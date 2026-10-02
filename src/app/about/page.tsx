import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Algorithco, a software company building focused tools for developers and power users.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We build software that returns control to the person using it."
        description={copy.about[0]}
      />
      <Section className="prose-section">
        <div className="editorial-grid">
          <p className="eyebrow">The company</p>
          <div className="large-prose">
            <p>{copy.about[1]}</p>
            <p>
              Today, that work takes shape in two products: voice dictation that
              can stay on-device, and a control layer for CLI coding agents.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
