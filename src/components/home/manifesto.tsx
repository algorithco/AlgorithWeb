"use client";

import { Fragment, useEffect, useRef } from "react";
import { useDrawingScale } from "@/hooks/use-drawing-scale";
import { Container } from "../container";

const SENTENCE = "Software should give you leverage, not take control.";
const WORDS: readonly { text: string; kind?: "key" | "cross" }[] = [
  { text: "Software" },
  { text: "should" },
  { text: "give" },
  { text: "you" },
  { text: "leverage,", kind: "key" },
  { text: "not" },
  { text: "take", kind: "cross" },
  { text: "control.", kind: "cross" },
];
const VIEW_WIDTH = 620;
/** Where the beam rests on the fulcrum, in viewBox units. */
const PIVOT = { x: 230, y: 210 };
const BLOCK_WIDTH = 110;

/**
 * The company's point of view at the end of the home page. While the section
 * is pinned, scrolling lights the sentence word by word, marks "leverage" and
 * strikes out "take control"; beside it a lever lifts a heavy block with a
 * small push.
 */
export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const beamRef = useRef<SVGGElement>(null);
  const blockRef = useRef<SVGGElement>(null);
  const handRef = useRef<SVGGElement>(null);

  useDrawingScale(svgRef, VIEW_WIDTH);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const beam = beamRef.current;
    const block = blockRef.current;
    const hand = handRef.current;
    if (!section || !title || !beam || !block || !hand) return;
    const words = Array.from(
      title.querySelectorAll<HTMLElement>(".manifesto__word"),
    );

    const render = (progress: number) => {
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - (-2 * progress + 2) ** 2 / 2;
      const degrees = -9 + 18 * eased;
      const radians = (degrees * Math.PI) / 180;
      const turn = (x: number, y: number) => [
        x * Math.cos(radians) - y * Math.sin(radians) + PIVOT.x,
        x * Math.sin(radians) + y * Math.cos(radians) + PIVOT.y,
      ];
      beam.setAttribute(
        "transform",
        `translate(${PIVOT.x} ${PIVOT.y}) rotate(${degrees.toFixed(2)})`,
      );
      // The block and the hand ride the beam but stay upright.
      const [blockX, blockY] = turn(-135, -6);
      block.setAttribute(
        "transform",
        `translate(${(blockX - BLOCK_WIDTH / 2).toFixed(1)} ${(blockY - 74).toFixed(1)})`,
      );
      const [handX, handY] = turn(352, -6);
      hand.setAttribute(
        "transform",
        `translate(${handX.toFixed(1)} ${(handY - 15).toFixed(1)})`,
      );
      const lit = Math.floor(progress * 1.12 * words.length + 0.5);
      words.forEach((word, index) => {
        word.classList.toggle("is-lit", index < lit);
      });
      title.classList.toggle("is-crossed", progress > 0.93);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return;
    }

    section.classList.add("is-live");
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const distance = bounds.height - window.innerHeight;
      const progress = distance > 0 ? -bounds.top / distance : 1;
      render(Math.min(1, Math.max(0, progress)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      section.classList.remove("is-live");
    };
  }, []);

  return (
    <section
      aria-labelledby="manifesto-title"
      className="manifesto"
      ref={sectionRef}
    >
      <div className="manifesto__pin">
        <Container className="manifesto__inner">
          <div>
            <p className="eyebrow">Why we build</p>
            <h2
              aria-label={SENTENCE}
              className="manifesto__title"
              id="manifesto-title"
              ref={titleRef}
            >
              <span aria-hidden="true">
                {WORDS.map((word, index) => (
                  <Fragment key={word.text}>
                    <span
                      className={`manifesto__word${word.kind ? ` manifesto__word--${word.kind}` : ""}`}
                    >
                      {word.text}
                    </span>
                    {index < WORDS.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </span>
            </h2>
          </div>
          <figure className="manifesto__lever">
            <svg
              aria-hidden="true"
              className="manifesto__svg"
              ref={svgRef}
              viewBox="20 70 620 215"
            >
              <line
                className="manifesto__ground"
                x1="30"
                x2="630"
                y1="270"
                y2="270"
              />
              <path className="manifesto__fulcrum" d="M196 270H264L230 208Z" />
              <g ref={beamRef} transform="translate(230 210) rotate(-9)">
                <rect
                  className="manifesto__beam"
                  height="12"
                  rx="6"
                  width="580"
                  x="-190"
                  y="-6"
                />
              </g>
              <g ref={blockRef} transform="translate(40.7 151.2)">
                <rect
                  className="manifesto__block"
                  height="74"
                  rx="10"
                  width={BLOCK_WIDTH}
                />
                <text className="manifesto__label" x={BLOCK_WIDTH / 2} y="37">
                  your work
                </text>
              </g>
              <g ref={handRef} transform="translate(576.7 134)">
                <circle className="manifesto__hand" r="15" />
                <text
                  className="manifesto__label manifesto__label--you"
                  y="-30"
                >
                  you
                </text>
              </g>
              <circle className="manifesto__pivot" cx="230" cy="210" r="5" />
            </svg>
            <figcaption>A small, deliberate push. A big result.</figcaption>
          </figure>
        </Container>
      </div>
    </section>
  );
}
