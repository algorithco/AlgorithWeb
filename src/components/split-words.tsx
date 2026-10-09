import { type CSSProperties, Fragment } from "react";

/**
 * Renders a heading's words as individually masked spans so they can rise into
 * place (styles in motion.css). The caller keeps the full text available to
 * assistive tech via aria-label on the heading and aria-hidden on this output.
 */
export function SplitWords({
  text,
  offset = 0,
}: {
  text: string;
  /** Words already rendered before this run, so the stagger continues. */
  offset?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        // Words can repeat, so the index is part of the identity.
        <Fragment key={`${index}-${word}`}>
          <span
            className="split-word"
            style={{ "--w": offset + index } as CSSProperties}
          >
            <span className="split-word__inner">{word}</span>
          </span>
          {/* The space lives outside the inline-block so it never collapses. */}
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
