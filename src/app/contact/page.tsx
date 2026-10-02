import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Algorithco.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start a conversation."
        description="Questions about Algorithco or one of our products? Reach us directly."
      />
      <Section className="contact-section">
        <div className="contact-block">
          <p className="eyebrow">Email</p>
          {siteConfig.contactEmail ? (
            <a
              className="contact-email"
              href={`mailto:${siteConfig.contactEmail}`}
            >
              {siteConfig.contactEmail}
            </a>
          ) : (
            <div>
              <p className="contact-unavailable">Contact email coming soon.</p>
              <p className="muted">
                The public address has not been configured yet.
              </p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
