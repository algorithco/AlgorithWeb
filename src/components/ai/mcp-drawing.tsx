"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { mcpParts } from "@/content/mcp";
import { useDrawingScale } from "@/hooks/use-drawing-scale";

type Consent = "hidden" | "ask" | "press";

type Scene = {
  /** The numbered part the animation is explaining; 0 for none. */
  part: number;
  round: number;
  asked: number;
  answered: number;
  tool: boolean;
  consent: Consent;
  approved: boolean;
  mcpBusy: boolean;
  /** The row of the product being read; -1 for none. */
  row: number;
  sending: boolean;
};

/** Questions the loop asks, the tool it calls and the row that answers. */
const ROUNDS = [
  {
    question: ["How much cloud time", "is left this month?"],
    tool: "get_usage_summary",
    row: 1,
    answer: ["5 min used of 70 h.", "Nearly all of it is left."],
  },
  {
    question: ["Which computers are", "signed in?"],
    tool: "list_devices",
    row: 2,
    answer: ["Two Windows PCs,", "both seen today."],
  },
  {
    question: ["What plan am I on?"],
    tool: "get_plan",
    row: 0,
    answer: ["Pro, active until", "December 2027."],
  },
] as const;

const ROWS = [
  { label: "Plan", y: 104 },
  { label: "Usage", y: 140 },
  { label: "Computers", y: 176 },
] as const;
const ROW_HEIGHT = 30;

const IDLE: Scene = {
  part: 0,
  round: 0,
  asked: 0,
  answered: 0,
  tool: false,
  consent: "hidden",
  approved: false,
  mcpBusy: false,
  row: -1,
  sending: false,
};
const STILL: Scene = {
  ...IDLE,
  asked: 99,
  answered: 99,
  tool: true,
  approved: true,
};
const CANCELLED = Symbol("cancelled");

// Rounded rectangles written as paths, so that they can draw themselves in.
const WINDOW =
  "M42 70H318A18 18 0 0 1 336 88V382A18 18 0 0 1 318 400H42A18 18 0 0 1 24 382V88A18 18 0 0 1 42 70Z";
const CABINET =
  "M612 92H764A12 12 0 0 1 776 104V206A12 12 0 0 1 764 218H612A12 12 0 0 1 600 206V104A12 12 0 0 1 612 92Z";
const MCP_BOX =
  "M482 206H548A12 12 0 0 1 560 218V254A12 12 0 0 1 548 266H482A12 12 0 0 1 470 254V218A12 12 0 0 1 482 206Z";
type Layout = {
  /** viewBox width, for the drawing scale. */
  width: number;
  viewBox: string;
  /** Moves each part from where the wide drawing has it. */
  move: {
    chat?: string;
    gate?: string;
    consent?: string;
    mcp?: string;
    products?: string;
    guard?: string;
  };
  account: { x: number; y: number; anchor: "middle" | "start" };
  tool: { x: number; y: number; anchor: "middle" | "start" };
  toGate: string;
  toRow: (y: number) => string;
  toGuard: string;
  packet: { x: number; y: number };
  /** Numbered callouts: the marker's centre and its leader line to the part. */
  callouts: readonly { n: number; x: number; y: number; leader: string }[];
};

/** Left to right: the chat, the approval and the server, then the products. */
const WIDE: Layout = {
  width: 800,
  viewBox: "0 20 800 400",
  move: {},
  account: { x: 403, y: 274, anchor: "middle" },
  tool: { x: 515, y: 286, anchor: "middle" },
  toGate: "M336 236H470",
  toRow: (y) =>
    `M560 236C590 236 576 ${y + ROW_HEIGHT / 2} 606 ${y + ROW_HEIGHT / 2}`,
  toGuard: "M560 236C590 236 576 340 600 340",
  packet: { x: 336, y: 236 },
  callouts: [
    { n: 1, x: 180, y: 40, leader: "M180 40V70" },
    { n: 2, x: 403, y: 330, leader: "M403 330V256" },
    { n: 3, x: 515, y: 330, leader: "M515 330V298" },
    { n: 4, x: 688, y: 40, leader: "M688 40V62" },
  ],
};

/**
 * On a phone the same parts stand top to bottom, so the drawing is drawn at
 * about half the scale reduction and its labels stay readable.
 */
const TALL: Layout = {
  width: 420,
  viewBox: "0 20 420 880",
  move: {
    chat: "translate(30 0)",
    gate: "translate(-263 224)",
    consent: "translate(-109 295)",
    mcp: "translate(-375 304)",
    products: "translate(-400 536)",
    guard: "translate(-400 518)",
  },
  account: { x: 166, y: 464, anchor: "start" },
  tool: { x: 196, y: 544, anchor: "start" },
  toGate: "M140 400V510",
  toRow: (y) => {
    const c = y + 548;
    return `M140 570V${c - 28}Q140 ${c} 168 ${c}H206`;
  },
  toGuard: "M140 570V830Q140 858 168 858H200",
  packet: { x: 140, y: 400 },
  callouts: [
    { n: 1, x: 210, y: 40, leader: "M210 40V70" },
    { n: 2, x: 60, y: 460, leader: "M60 460H124" },
    { n: 3, x: 60, y: 540, leader: "M60 540H95" },
    { n: 4, x: 400, y: 691, leader: "M400 691H376" },
  ],
};

/** True below 40rem, where the drawing stands tall. */
function useTall() {
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 40rem)");
    const update = () => setTall(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return tall;
}

const delay = (seconds: number) => ({ "--dl": `${seconds}s` }) as CSSProperties;
const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/** The first `count` characters of `lines`, still split into lines. */
function typed(lines: readonly string[], count: number) {
  let left = count;
  return lines.map((line) => {
    const shown = line.slice(0, Math.max(0, left));
    left -= line.length;
    return shown;
  });
}
const length = (lines: readonly string[]) =>
  lines.reduce((sum, line) => sum + line.length, 0);

/**
 * A line drawing of an AI assistant connected to Algorithco for /ai: the chat,
 * the approval in Algorithco Account, the MCP server and the products behind
 * it, each with a numbered callout that matches the list beside it. Once in
 * view it draws itself, then a quiet loop asks a question, approves the
 * assistant the first time, follows the request to the row that answers it
 * and types the answer back.
 */
export function McpDrawing() {
  const artRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gateRouteRef = useRef<SVGPathElement>(null);
  const rowRouteRefs = useRef<(SVGPathElement | null)[]>([]);
  const packetRef = useRef<SVGCircleElement>(null);
  const pausedRef = useRef(false);
  const [scene, setScene] = useState<Scene>(IDLE);
  const [entered, setEntered] = useState(false);
  const [settled, setSettled] = useState(false);
  const [still, setStill] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(0);
  const pointerRef = useRef("mouse");
  const tall = useTall();
  const layout = tall ? TALL : WIDE;

  useDrawingScale(svgRef, layout.width);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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
      setScene(STILL);
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
    // One dot along a wire, forwards or back.
    const travel = (route: SVGPathElement | null, back: boolean, ms: number) =>
      new Promise<void>((resolve, reject) => {
        const packet = packetRef.current;
        if (!route || !packet) {
          resolve();
          return;
        }
        const total = route.getTotalLength();
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
            total * (back ? 1 - eased : eased),
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
      await wait(2600);
      for (let turn = 0; ; turn++) {
        const round = turn % ROUNDS.length;
        const { question, answer, row } = ROUNDS[round];
        await whenVisible();
        // Each pass through the three questions starts from a new assistant,
        // so the approval is shown again.
        if (round === 0) show({ approved: false });
        show({ part: 1, round, asked: 0, answered: 0, tool: false });
        for (let count = 1; count <= length(question); count++) {
          show({ asked: count });
          await wait(38);
        }
        await wait(500);
        if (round === 0) {
          show({ part: 2, consent: "ask" });
          await wait(1500);
          show({ consent: "press" });
          await wait(450);
          show({ consent: "hidden", approved: true });
          await wait(450);
        }
        show({ part: 3, sending: true });
        await travel(gateRouteRef.current, false, 900);
        show({ mcpBusy: true, tool: true });
        await wait(500);
        show({ part: 4 });
        const route = rowRouteRefs.current[row] ?? null;
        await travel(route, false, 650);
        show({ row });
        await wait(800);
        show({ row: -1 });
        await travel(route, true, 650);
        show({ part: 3 });
        await travel(gateRouteRef.current, true, 900);
        show({ mcpBusy: false, sending: false, part: 1 });
        for (let count = 1; count <= length(answer); count++) {
          show({ answered: count });
          await wait(30);
        }
        show({ part: 0 });
        await wait(2800);
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

  const current = ROUNDS[scene.round];
  const question = typed(current.question, scene.asked);
  const answer = typed(current.answer, scene.answered);
  const isOn = (n: number) => scene.part === n || hovered === n;
  const lit = (n: number) => (hovered === n ? " is-lit" : "");
  const svgClass = [
    "machine__svg",
    "mcpd",
    paused && "is-paused",
    settled && "is-settled",
    scene.approved && "is-approved",
  ]
    .filter(Boolean)
    .join(" ");
  const status =
    scene.consent !== "hidden"
      ? "Algorithco Account asks you first. Nothing is shared until you approve."
      : scene.sending
        ? `Calling ${current.tool}. It can only read.`
        : "Read-only. What you dictated is never stored, so it is never sent.";
  // A mouse lights a part while it points at it; a tap lights it until the
  // next tap.
  const point = (n: number) => ({
    onPointerDown: (event: PointerEvent) => {
      pointerRef.current = event.pointerType;
    },
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== "touch") setHovered(n);
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType !== "touch") setHovered(0);
    },
    onClick: () => {
      if (pointerRef.current === "touch") {
        setHovered((now) => (now === n ? 0 : n));
      }
    },
  });

  return (
    <>
      <div className="mcp-intro__art">
        <div
          className={`machine${entered ? " is-in" : ""}${tall ? " is-tall" : ""}`}
          ref={artRef}
        >
          <div aria-hidden="true" className="machine__paper" />
          <svg
            aria-label="A line drawing of an AI assistant connected to Algorithco. A question in the chat travels through an approval in Algorithco Account to one MCP server, which reads the answer from your AlgorithVoice account: plan, usage or computers. Transcripts are not stored. AlgorithGuard is drawn as coming next."
            className={svgClass}
            ref={svgRef}
            role="img"
            viewBox={layout.viewBox}
          >
            {/* The assistant's chat */}
            <g transform={layout.move.chat}>
              <path
                className="machine__fade machine__fill-lid"
                d={WINDOW}
                style={delay(0.4)}
              />
              <path
                className={`machine__line machine__draw${lit(1)}`}
                d={WINDOW}
                pathLength={1}
                style={delay(0)}
              />
              <path
                className="machine__soft machine__draw"
                d="M24 104H336"
                pathLength={1}
                style={delay(0.3)}
              />
              <text
                className="mcpd__title machine__fade"
                style={delay(0.5)}
                x="44"
                y="91"
              >
                Assistant
              </text>
              <g
                className={`mcpd__bubble${scene.asked > 0 ? " is-shown" : ""}`}
              >
                <rect height="56" rx="14" width="196" x="120" y="122" />
                {question.map((line, index) => (
                  <text
                    className="mcpd__ask"
                    key={current.question[index]}
                    x="304"
                    y={146 + index * 20}
                  >
                    {line}
                  </text>
                ))}
              </g>
              <text
                className={`mcpd__chip${scene.tool ? " is-shown" : ""}`}
                x="44"
                y="210"
              >
                {`→ ${current.tool}`}
              </text>
              {answer.map((line, index) => (
                <text
                  className={`mcpd__answer${lit(1)}`}
                  key={current.answer[index]}
                  x="44"
                  y={244 + index * 22}
                >
                  {line}
                  {index === answer.length - 1 &&
                  scene.answered > 0 &&
                  scene.answered < length(current.answer) ? (
                    <tspan className="machine__caret">|</tspan>
                  ) : null}
                </text>
              ))}
              <path
                className="machine__soft machine__draw"
                d="M54 352H306A14 14 0 0 1 320 366A14 14 0 0 1 306 380H54A14 14 0 0 1 40 366A14 14 0 0 1 54 352Z"
                pathLength={1}
                style={delay(0.55)}
              />
              <text
                className="mcpd__placeholder machine__fade"
                style={delay(0.7)}
                x="58"
                y="366"
              >
                Ask anything
              </text>
            </g>

            {/* The wire through Algorithco Account to the server */}
            <path
              className={`machine__wire machine__draw${lit(2)}${lit(3)}`}
              d={layout.toGate}
              pathLength={1}
              style={delay(0.9)}
            />
            <path
              d={layout.toGate}
              fill="none"
              ref={gateRouteRef}
              stroke="none"
            />
            <g transform={layout.move.gate}>
              <g
                className={`mcpd__gate machine__fade${lit(2)}`}
                style={delay(1.1)}
              >
                <circle cx="403" cy="236" r="16" />
                <path
                  className="mcpd__lock"
                  d="M397 236V231A6 6 0 0 1 409 231V236"
                />
                <rect
                  className="mcpd__lock-body"
                  height="10"
                  rx="2"
                  width="16"
                  x="395"
                  y="235"
                />
                <path className="mcpd__check" d="M396 236L401 241L411 230" />
              </g>
            </g>
            <text
              className="machine__label machine__fade"
              style={{ ...delay(1.2), textAnchor: layout.account.anchor }}
              x={layout.account.x}
              y={layout.account.y}
            >
              Account
            </text>
            <g transform={layout.move.consent}>
              <g className={`mcpd__consent is-${scene.consent}`}>
                <rect height="74" rx="12" width="128" x="339" y="128" />
                <text className="mcpd__consent-title" x="403" y="152">
                  Allow access?
                </text>
                <rect
                  className="mcpd__approve"
                  height="24"
                  rx="12"
                  width="88"
                  x="359"
                  y="166"
                />
                <text className="mcpd__approve-text" x="403" y="178">
                  Approve
                </text>
              </g>
            </g>

            {/* The MCP server */}
            <g transform={layout.move.mcp}>
              <path
                className="machine__fade machine__fill-screen"
                d={MCP_BOX}
                style={delay(1.2)}
              />
              <path
                className={`machine__line machine__draw${scene.mcpBusy ? " is-busy" : ""}${lit(3)}`}
                d={MCP_BOX}
                pathLength={1}
                style={delay(1.1)}
              />
              <text
                className="mcpd__server machine__fade"
                style={delay(1.3)}
                x="515"
                y="236"
              >
                MCP
              </text>
            </g>
            <text
              className={`mcpd__tool${scene.tool ? " is-shown" : ""}`}
              style={{ textAnchor: layout.tool.anchor }}
              x={layout.tool.x}
              y={layout.tool.y}
            >
              {current.tool}
            </text>

            {/* AlgorithVoice, the product that answers today */}
            {ROWS.map((row, index) => (
              <g key={row.label}>
                <path
                  className={`machine__wire machine__draw${lit(4)}`}
                  d={layout.toRow(row.y)}
                  pathLength={1}
                  style={delay(1.4 + index * 0.08)}
                />
                <path
                  d={layout.toRow(row.y)}
                  fill="none"
                  ref={(node) => {
                    rowRouteRefs.current[index] = node;
                  }}
                  stroke="none"
                />
              </g>
            ))}
            <g transform={layout.move.products}>
              <path
                className="machine__fade machine__fill-lid"
                d={CABINET}
                style={delay(1.6)}
              />
              <path
                className={`machine__line machine__draw${lit(4)}`}
                d={CABINET}
                pathLength={1}
                style={delay(1.5)}
              />
              <text
                className="mcpd__product machine__fade"
                style={delay(1.7)}
                x="606"
                y="84"
              >
                AlgorithVoice
              </text>
              {ROWS.map((row, index) => (
                <g
                  className={`mcpd__row machine__fade${scene.row === index ? " is-read" : ""}`}
                  key={row.label}
                  style={delay(1.75 + index * 0.08)}
                >
                  <rect
                    height={ROW_HEIGHT - 6}
                    rx="6"
                    width="160"
                    x="608"
                    y={row.y}
                  />
                  <text x="620" y={row.y + (ROW_HEIGHT - 6) / 2}>
                    {row.label}
                  </text>
                </g>
              ))}
              <g className="mcpd__never machine__fade" style={delay(2)}>
                <rect height="24" rx="6" width="160" x="608" y="226" />
                <text x="620" y="238">
                  Transcripts
                </text>
                <path d="M612 238H764" />
                <text className="mcpd__never-note" x="764" y="262">
                  never stored
                </text>
              </g>
            </g>

            {/* AlgorithGuard, next behind the same address */}
            <path
              className="machine__wire machine__wire--far machine__fade"
              d={layout.toGuard}
              style={delay(1.6)}
            />
            <g transform={layout.move.guard}>
              <g className="mcpd__next machine__fade" style={delay(1.9)}>
                <rect height="56" rx="12" width="176" x="600" y="312" />
                <text className="mcpd__product" x="614" y="336">
                  AlgorithGuard
                </text>
                <text className="mcpd__next-note" x="614" y="354">
                  next, same address
                </text>
              </g>
            </g>

            <circle
              className={`machine__packet${scene.sending ? " is-moving" : ""}`}
              cx={layout.packet.x}
              cy={layout.packet.y}
              r="4.5"
              ref={packetRef}
            />

            {/* Numbered callouts, as in a technical drawing */}
            {layout.callouts.map((callout) => (
              <g
                className={`machine__callout${isOn(callout.n) ? " is-on" : ""}`}
                key={callout.n}
                {...point(callout.n)}
                style={delay(1.9 + callout.n * 0.1)}
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
        <p
          className={`machine__status${scene.sending || scene.consent !== "hidden" ? " is-live" : ""}`}
        >
          <span aria-hidden="true" />
          {status}
        </p>
      </div>

      <div className="mcp-intro__parts">
        <ol className="machine-parts" data-stagger>
          {mcpParts.map((part) => (
            <li
              className={`machine-parts__item${isOn(part.n) ? " is-on" : ""}`}
              key={part.n}
              {...point(part.n)}
            >
              <span className="machine-parts__no">0{part.n}</span>
              <div>
                <h3>{part.title}</h3>
                <p>{part.body}</p>
              </div>
            </li>
          ))}
        </ol>
        {still ? null : (
          <button
            className="machine__pause"
            onClick={() => setPaused((now) => !now)}
            type="button"
          >
            {paused ? "Play the animation" : "Pause the animation"}
          </button>
        )}
      </div>
    </>
  );
}
