import { PageHero } from "./page-hero";
import { Section } from "./section";

export function LegalPlaceholder({ title }: { title: string }) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        description="This page is reserved for Algorithco’s legal information."
      />
      <Section className="legal-section">
        <div className="legal-notice">
          <p className="eyebrow">Placeholder</p>
          <h2>Pending legal review</h2>
          <p>
            This page does not contain legal terms yet. Final text must be
            prepared or approved by qualified legal counsel before publication.
          </p>
        </div>
      </Section>
    </>
  );
}
