import { Container } from "./container";
import { SplitWords } from "./split-words";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero" data-reveal="fade">
      <Container>
        <p className="eyebrow">{eyebrow}</p>
        <h1 aria-label={title}>
          <span aria-hidden="true">
            <SplitWords text={title} />
          </span>
        </h1>
        <p className="page-hero__description">{description}</p>
      </Container>
    </section>
  );
}
