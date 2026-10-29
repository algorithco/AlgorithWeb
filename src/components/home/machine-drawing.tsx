"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { machineParts } from "@/content/how-it-works";
import { useDrawingScale } from "@/hooks/use-drawing-scale";

type Pill = "hidden" | "listen" | "think";

type Scene = {
  /** The numbered part the animation is explaining; 0 for none. */
  part: number;
  keysDown: boolean;
  pill: Pill;
  typed: string;
  diskBusy: boolean;
  cloudBusy: boolean;
  sending: boolean;
};

const IDLE: Scene = {
  part: 0,
  keysDown: false,
  pill: "hidden",
  typed: "",
  diskBusy: false,
  cloudBusy: false,
  sending: false,
};
const PHRASE = "See you Thursday at ten.";
const VIEW_WIDTH = 800;
const CANCELLED = Symbol("cancelled");

// Rounded rectangles written as paths, so that they can draw themselves in.
const LID =
  "M118 110H502A18 18 0 0 1 520 128V374A4 4 0 0 1 516 378H104A4 4 0 0 1 100 374V128A18 18 0 0 1 118 110Z";
const SCREEN =
  "M122 124H498A8 8 0 0 1 506 132V348A8 8 0 0 1 498 356H122A8 8 0 0 1 114 348V132A8 8 0 0 1 122 124Z";
const BASE = "M60 378H560V384A8 8 0 0 1 552 392H68A8 8 0 0 1 60 384Z";
const NOTCH =
  "M282 378V380.5A2.5 2.5 0 0 0 284.5 383H335.5A2.5 2.5 0 0 0 338 380.5V378";
const CLOUD =
  "M709.8 190.2a19.8 19.8 0 0 1-2.64-39.42A26.4 26.4 0 0 1 758.2 152.8A17.6 17.6 0 0 1 756 190.2Z";

/** Grey lines for the text already in the document: top, width, entrance delay. */
const DOC_LINES = [
  [137, 44, 0.7],
  [180, 200, 0.78],
  [198, 292, 0.84],
  [216, 236, 0.9],
  [276, 262, 0.96],
  [294, 150, 1.02],
] as const;

const WAVE = Array.from({ length: 8 }, (_, index) => 282 + index * 9);

/** Numbered callouts: the marker's centre and its leader line to the part. */
const CALLOUTS = [
  { n: 1, x: 310, y: 76, leader: "M310 76V113" },
  { n: 2, x: 62, y: 248, leader: "M62 248H132" },
  { n: 3, x: 568, y: 436, leader: "M568 436L531 390" },
  { n: 4, x: 623, y: 104, leader: "M623 104V150" },
] as const;

const delay = (seconds: number) => ({ "--dl": `${seconds}s` }) as CSSProperties;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/**
 * A line drawing of the visitor's computer for the home page: the hotkey, the
 * on-device model, the disk and a switch on the wire to the cloud, each with a
 * numbered callout that matches the list beside it. Once in view it draws
 * itself, then a quiet loop dictates one sentence and lights each part in
 * turn. The switch is real: closing it shows the one request that goes out.
 */
export function MachineDrawing() {
  const artRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const packetRef = useRef<SVGCircleElement>(null);
  const cloudRef = useRef(false);
  const pausedRef = useRef(false);
  const [scene, setScene] = useState<Scene>(IDLE);
  const [entered, setEntered] = useState(false);
  const [settled, setSettled] = useState(false);
  const [still, setStill] = useState(false);
  const [cloud, setCloud] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(0);

  useDrawingScale(svgRef, VIEW_WIDTH);

  useEffect(() => {
    cloudRef.current = cloud;
  }, [cloud]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Once the drawing has drawn itself, state changes stop waiting for the
  // entrance delays.
  useEffect(() => {
    if (!entered) return;
    const timer = setTimeout(() => setSettled(true), 2800);
    return () => clearTimeout(timer);
  }, [entered]);

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setEntered(true);
      setScene({ ...IDLE, typed: PHRASE });
      return;
    }

    let cancelled = false;
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) setEntered(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(art);

    const show = (patch: Partial<Scene>) => {
      if (!cancelled) setScene((current) => ({ ...current, ...patch }));
    };
    // Counts only the time the animation is playing, so Pause holds it.
    const wait = async (ms: number) => {
      let left = ms;
      let last = performance.now();
      while (left > 0) {
        if (cancelled) throw CANCELLED;
        await sleep(Math.min(left, 100));
        const now = performance.now();
        if (!pausedRef.current) left -= now - last;
        last = now;
      }
      if (cancelled) throw CANCELLED;
    };
    const whenVisible = async () => {
      while (!visible) {
        if (cancelled) throw CANCELLED;
        await sleep(250);
      }
    };
    // One dot along the wire, through the closed switch, to the cloud or back.
    const travel = (back: boolean, ms: number) =>
      new Promise<void>((resolve, reject) => {
        const route = routeRef.current;
        const packet = packetRef.current;
        if (!route || !packet) {
          resolve();
          return;
        }
        const length = route.getTotalLength();
        let progress = 0;
        let last = performance.now();
        const frame = (now: number) => {
          if (cancelled) {
            reject(CANCELLED);
            return;
          }
          if (!pausedRef.current) {
            progress = Math.min(1, progress + (now - last) / ms);
          }
          last = now;
          const eased = easeInOut(progress);
          const point = route.getPointAtLength(
            length * (back ? 1 - eased : eased),
          );
          packet.setAttribute("cx", point.x.toFixed(1));
          packet.setAttribute("cy", point.y.toFixed(1));
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });

    const play = async () => {
      await whenVisible();
      await wait(2800);
      for (;;) {
        await whenVisible();
        show({ part: 1, keysDown: true, pill: "listen" });
        await wait(2300);
        show({ keysDown: false });
        if (cloudRef.current) {
          show({ part: 4, pill: "think", sending: true });
          await travel(false, 1100);
          show({ cloudBusy: true });
          await wait(600);
          show({ cloudBusy: false });
          await travel(true, 1100);
          show({ sending: false });
        } else {
          show({ part: 2, pill: "think" });
          await wait(1300);
        }
        show({ part: 2, pill: "hidden" });
        for (let length = 1; length <= PHRASE.length; length++) {
          show({ typed: PHRASE.slice(0, length) });
          await wait(42);
        }
        await wait(700);
        show({ part: 3, diskBusy: true });
        await wait(1300);
        show({ diskBusy: false });
        show({ part: 0 });
        await wait(2600);
        show({ typed: "" });
        await wait(800);
      }
    };
    play().catch((error) => {
      if (error !== CANCELLED) throw error;
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  const toggleCloud = () => setCloud((current) => !current);
  const isOn = (n: number) => scene.part === n || hovered === n;
  const lit = (n: number) => (hovered === n ? " is-lit" : "");
  const svgClass = [
    "machine__svg",
    cloud && "is-cloud",
    paused && "is-paused",
    settled && "is-settled",
  ]
    .filter(Boolean)
    .join(" ");
  const status = scene.sending
    ? "This request is going to the cloud, because you turned it on."
    : cloud
      ? "Cloud is on. Dictation goes out only while it stays on."
      : "Nothing leaves this machine.";

  return (
    <>
      <div className="how-it-works__art">
        <div className={`machine${entered ? " is-in" : ""}`} ref={artRef}>
          <div aria-hidden="true" className="machine__paper" />
          <svg
            aria-label="A line drawing of a laptop. The microphone, the speech model and the disk are all on it. A wire leads to the cloud through a switch that stays open, so nothing goes out until you close it."
            className={svgClass}
            ref={svgRef}
            role="img"
            viewBox="0 44 800 462"
          >
            <defs>
              <radialGradient id="machine-shadow">
                <stop
                  offset="0"
                  style={{ stopColor: "var(--color-text)", stopOpacity: 0.16 }}
                />
                <stop
                  offset="1"
                  style={{ stopColor: "var(--color-text)", stopOpacity: 0 }}
                />
              </radialGradient>
            </defs>
            <ellipse
              className="machine__fade"
              cx="310"
              cy="400"
              fill="url(#machine-shadow)"
              rx="270"
              ry="14"
              style={delay(0.6)}
            />

            {/* The laptop */}
            <path
              className="machine__fade machine__fill-lid"
              d={LID}
              style={delay(0.4)}
            />
            <path
              className="machine__fade machine__fill-screen"
              d={SCREEN}
              style={delay(0.5)}
            />
            <path
              className="machine__fade machine__fill-base"
              d={BASE}
              style={delay(0.5)}
            />
            <path
              className="machine__line machine__draw"
              d={LID}
              pathLength={1}
              style={delay(0)}
            />
            <path
              className={`machine__line machine__draw${lit(2)}`}
              d={SCREEN}
              pathLength={1}
              style={delay(0.15)}
            />
            <path
              className={`machine__line machine__draw${lit(3)}`}
              d={BASE}
              pathLength={1}
              style={delay(0.3)}
            />
            <path
              className="machine__soft machine__draw"
              d={NOTCH}
              pathLength={1}
              style={delay(0.45)}
            />
            <circle
              className={`machine__fade machine__camera${lit(1)}`}
              cx="310"
              cy="117"
              r="2.6"
              style={delay(0.6)}
            />
            <rect
              className={`machine__fade machine__disk${scene.diskBusy ? " is-busy" : ""}${lit(3)}`}
              height="3"
              rx="1.5"
              style={delay(0.6)}
              width="18"
              x="518"
              y="384"
            />

            {/* What is on the screen */}
            <path
              className="machine__soft machine__draw"
              d="M114 158H506"
              pathLength={1}
              style={delay(0.55)}
            />
            {DOC_LINES.map(([y, width, seconds]) => (
              <rect
                className="machine__doc-line"
                height="7"
                key={y}
                rx="3.5"
                style={delay(seconds)}
                width={width}
                x="138"
                y={y}
              />
            ))}
            <text className={`machine__typed${lit(2)}`} x="138" y="253">
              {scene.typed}
              <tspan className="machine__caret">|</tspan>
            </text>

            {/* The AlgorithVoice pill while you talk */}
            <g className={`machine__pill is-${scene.pill}`}>
              <rect height="28" rx="14" width="120" x="250" y="318" />
              <circle className="machine__rec" cx="268" cy="332" r="4" />
              <g className="machine__wave">
                {WAVE.map((x, index) => (
                  <rect
                    height="16"
                    key={x}
                    rx="1.7"
                    style={{ "--d": `${-index * 0.13}s` } as CSSProperties}
                    width="3.4"
                    x={x}
                    y="324"
                  />
                ))}
              </g>
              <g className="machine__dots">
                {[303, 315, 327].map((cx, index) => (
                  <circle
                    cx={cx}
                    cy="332"
                    key={cx}
                    r="2.6"
                    style={{ "--d": `${index * 0.15}s` } as CSSProperties}
                  />
                ))}
              </g>
            </g>

            {/* The hotkey */}
            <g
              className={`machine__keys${scene.keysDown ? " is-down" : ""}`}
              style={delay(1)}
            >
              <g className="machine__key">
                <rect
                  className="machine__key-base"
                  height="38"
                  rx="9"
                  width="84"
                  x="206"
                  y="430"
                />
                <rect
                  className="machine__key-top"
                  height="25"
                  rx="6"
                  width="74"
                  x="211"
                  y="434"
                />
                <text x="248" y="447">
                  Ctrl
                </text>
              </g>
              <g className="machine__key">
                <rect
                  className="machine__key-base"
                  height="38"
                  rx="9"
                  width="112"
                  x="302"
                  y="430"
                />
                <rect
                  className="machine__key-top"
                  height="25"
                  rx="6"
                  width="102"
                  x="307"
                  y="434"
                />
                <text x="358" y="447">
                  Space
                </text>
              </g>
              <text className="machine__hint" x="310" y="494">
                hold to talk
              </text>
            </g>

            {/* The wire to the cloud, broken by a switch */}
            <path
              className={`machine__wire machine__draw${lit(4)}`}
              d="M520 170H591"
              pathLength={1}
              style={delay(1.15)}
            />
            <path
              className={`machine__wire machine__wire--far machine__fade${lit(4)}`}
              d="M655 170H690"
              style={delay(1.5)}
            />
            <circle
              className="machine__terminal machine__fade"
              cx="596"
              cy="170"
              r="5"
              style={delay(1.3)}
            />
            <circle
              className="machine__terminal machine__fade"
              cx="650"
              cy="170"
              r="5"
              style={delay(1.35)}
            />
            <line
              className={`machine__lever machine__fade${lit(4)}`}
              style={delay(1.3)}
              x1="596"
              x2="645"
              y1="170"
              y2="170"
            />
            <path
              className={`machine__cloud machine__fade${scene.cloudBusy ? " is-busy" : ""}${lit(4)}`}
              d={CLOUD}
              style={delay(1.55)}
            />
            <text
              className="machine__state machine__fade"
              style={delay(1.6)}
              x="623"
              y="200"
            >
              {cloud ? "ON" : "OFF"}
            </text>
            <text
              className="machine__label machine__fade"
              style={delay(1.6)}
              x="732"
              y="216"
            >
              Cloud
            </text>
            <path d="M520 170H690" fill="none" ref={routeRef} stroke="none" />
            <circle
              className={`machine__packet${scene.sending ? " is-moving" : ""}`}
              cx="520"
              cy="170"
              r="4.5"
              ref={packetRef}
            />
            <rect
              className="machine__hit"
              height="80"
              onClick={toggleCloud}
              width="86"
              x="580"
              y="130"
            />

            {/* Numbered callouts, as in a technical drawing */}
            {CALLOUTS.map((callout) => (
              <g
                className={`machine__callout${isOn(callout.n) ? " is-on" : ""}`}
                key={callout.n}
                onPointerEnter={() => setHovered(callout.n)}
                onPointerLeave={() => setHovered(0)}
                style={delay(1.6 + callout.n * 0.1)}
              >
                <path className="machine__leader" d={callout.leader} />
                <circle
                  className="machine__ring"
                  cx={callout.x}
                  cy={callout.y}
                  r="12"
                />
                <circle
                  className="machine__dot"
                  cx={callout.x}
                  cy={callout.y}
                  r="12"
                />
                <text x={callout.x} y={callout.y}>
                  {callout.n}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p className={`machine__status${scene.sending ? " is-live" : ""}`}>
          <span aria-hidden="true" />
          {status}
        </p>
      </div>

      <div className="how-it-works__parts">
        <ol className="machine-parts" data-stagger>
          {machineParts.map((part) => (
            <li
              className={`machine-parts__item${isOn(part.n) ? " is-on" : ""}`}
              key={part.n}
              onPointerEnter={() => setHovered(part.n)}
              onPointerLeave={() => setHovered(0)}
            >
              <span className="machine-parts__no">0{part.n}</span>
              <div>
                <h3>{part.title}</h3>
                <p>{part.body}</p>
                {part.n === 4 ? (
                  <label className="machine-parts__switch">
                    <button
                      aria-checked={cloud}
                      aria-label="Cloud transcription"
                      className="machine-toggle"
                      onClick={toggleCloud}
                      role="switch"
                      type="button"
                    />
                    <span>Cloud transcription</span>
                  </label>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        {still ? null : (
          <button
            className="machine__pause"
            onClick={() => setPaused((current) => !current)}
            type="button"
          >
            {paused ? "Play the animation" : "Pause the animation"}
          </button>
        )}
      </div>
    </>
  );
}
