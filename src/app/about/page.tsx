import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import {
  companyFacts as facts,
  companyPrinciples as principles,
  productNotes,
} from "@/content/company";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "About",
  description:
    "Algorithco is an independent software company building local-first tools for developers and power users: AlgorithVoice and AlgorithGuard.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We build software that returns control to the person using it."
        description="Algorithco is an independent software company making focused tools for developers and power users. Two products today, one standard for both: fast to use, private by default, and honest about what they do."
      />

      <Section className="prose-section">
        <div className="editorial-grid">
          <p className="eyebrow">The company</p>
          <div className="large-prose">
            <p>{copy.about[1]}</p>
            <p>
              We are small, independent and founder-led, based in Uzbekistan. We
              do not sell ads, we do not run trackers, and our products do not
              need your data to work.
            </p>
          </div>
        </div>
        <dl className="about-facts" data-stagger>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section eyebrow="What we build" title="Two tools, built the same way.">
        <div className="about-products">
          {products.map((product, index) => (
            <article
              className={`about-product about-product--${product.accent}`}
              key={product.slug}
            >
              <div className="about-product__meta">
                <span>0{index + 1}</span>
                <StatusBadge
                  label={product.statusLabel}
                  status={product.status}
                />
              </div>
              <div>
                <h3>{product.name}</h3>
                <p className="about-product__tagline">{product.tagline}</p>
              </div>
              <div className="about-product__body">
                <p>{productNotes[product.slug]}</p>
                <ul className="tag-list" aria-label="Works with">
                  {product.platforms.map((platform) => (
                    <li key={platform}>{platform}</li>
                  ))}
                </ul>
                <Link className="text-link" href={product.href}>
                  More about {product.name} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="How we work"
        title="Principles, and what they mean in practice."
      >
        <ol className="about-principles" data-stagger>
          {principles.map((principle, index) => (
            <li key={principle.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
              <p className="about-principles__practice">
                <strong>In practice</strong>
                {principle.practice}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="about-status">
        <div className="editorial-grid">
          <p className="eyebrow">Where we are</p>
          <div className="large-prose">
            <p>
              AlgorithVoice is available on Windows and Linux, and a native
              macOS app is in development. AlgorithGuard is in early preview: it
              starts in shadow mode, so you can watch what it would do before
              you let it enforce anything.
            </p>
            <p>
              We publish what we collect and why in plain language. Read our{" "}
              <Link href="/privacy">privacy policy</Link> and{" "}
              <Link href="/terms">terms</Link>.
            </p>
          </div>
        </div>
        <div className="about-cta">
          <p>Questions, feedback or a partnership in mind?</p>
          <ButtonLink href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
