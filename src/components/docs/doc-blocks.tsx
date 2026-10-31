import type { CSSProperties } from "react";
import { InlineText } from "@/components/changelog/inline-text";
import type { DocBlock } from "@/content/docs";
import { CopyButton } from "./copy-button";

// A term with no capital letter is a command, a flag, a file or a value
// (`--limit <n>`, `algo why`, `local-only`) and is set in monospace; a term
// written as words ("Shadow first", "Pro required") is set as text.
const isLiteral = (term: string) => !/[A-Z]/.test(term);

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <InlineText text={block.text} />
        </p>
      );
    case "list": {
      const items = block.items.map((item) => (
        <li key={item}>
          <InlineText text={item} />
        </li>
      ));
      return block.ordered ? (
        <ol className="docs-list docs-list--ordered">{items}</ol>
      ) : (
        <ul className="docs-list">{items}</ul>
      );
    }
    case "steps":
      return (
        <ol className="docs-steps">
          {block.items.map((step) => (
            <li key={step.title}>
              <h3>
                <InlineText text={step.title} />
              </h3>
              <p>
                <InlineText text={step.text} />
              </p>
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <figure className="docs-code">
          <figcaption>
            <span>{block.label ?? "Code"}</span>
            <CopyButton text={block.code} />
          </figcaption>
          <pre>
            <code>{block.code}</code>
          </pre>
        </figure>
      );
    case "table":
      return (
        <div
          className="docs-table"
          data-columns={block.head.length}
          style={{ "--docs-columns": block.head.length } as CSSProperties}
        >
          <table>
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => {
                    const content = block.codeColumns?.includes(index) ? (
                      <code>{cell}</code>
                    ) : (
                      <InlineText text={cell} />
                    );
                    return index === 0 ? (
                      <th key={index} scope="row">
                        {content}
                      </th>
                    ) : (
                      <td
                        data-label={block.head[index] || undefined}
                        key={index}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "defs":
      return (
        <dl className="docs-defs">
          {block.items.map(([term, text]) => (
            <div key={term}>
              <dt>{isLiteral(term) ? <code>{term}</code> : term}</dt>
              <dd>
                <InlineText text={text} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "note":
      return (
        <aside className={`docs-note docs-note--${block.tone}`}>
          <p className="docs-note__title">
            {block.title ??
              { info: "Note", tip: "Tip", warning: "Important" }[block.tone]}
          </p>
          <p>
            <InlineText text={block.text} />
          </p>
        </aside>
      );
  }
}

/** The body of one documentation section. */
export function DocBlocks({ blocks }: { blocks: readonly DocBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <Block block={block} key={index} />
      ))}
    </>
  );
}
