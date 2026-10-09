import type { ReactNode } from "react";
import { Container } from "./container";
import { SplitWords } from "./split-words";

export function Section({
  eyebrow,
  title,
  children,
  className = "",
  id,
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`section ${className}`} data-reveal id={id}>
      <Container>
        {(eyebrow || title) && (
          <header className="section__header">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2 className="section__title" aria-label={title}>
                <span aria-hidden="true">
                  <SplitWords text={title} />
                </span>
              </h2>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
