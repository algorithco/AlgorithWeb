import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
export default function NotFound() {
  return (
    <section className="not-found">
      <Container>
        <p className="eyebrow">404 / Not found</p>
        <h1>This page is off the map.</h1>
        <p>The address may have changed, or the page may never have existed.</p>
        <ButtonLink href="/">Return home</ButtonLink>
      </Container>
    </section>
  );
}
