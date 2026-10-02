import type { ReactNode } from "react";
import { Container } from "./container";

export function Section({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`section ${className}`} data-reveal>
      <Container>
        {(eyebrow || title) && (
          <header className="section__header">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="section__title">{title}</h2>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
