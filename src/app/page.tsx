import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { MachineDrawing } from "@/components/home/machine-drawing";
import { Section } from "@/components/section";
import { SplitWords } from "@/components/split-words";
import { StatusBadge } from "@/components/status-badge";
import { products } from "@/config/products";
import { companyFacts, companyPrinciples } from "@/content/company";
import { copy } from "@/content/copy";
import { howItWorks } from "@/content/how-it-works";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="home-hero" data-page-enter data-spotlight>
        <div aria-hidden="true" className="hero-spotlight" />
        <Container>
          <div className="hero-kicker">
            <span>Software company</span>
            <span>Local-first by design</span>
          </div>
          <h1 aria-label={copy.companyPositioning} className="hero-title">
            <span aria-hidden="true" className="hero-title__line">
              Software that
            </span>
            <span aria-hidden="true" className="hero-title__line">
              stays out of
            </span>
            <span
              aria-hidden="true"
              className="hero-title__line hero-title__line--last"
            >
              your way.
            </span>
          </h1>
          <div className="hero-foot">
            <p>{copy.companyDescription}</p>
            <ButtonLink href="/about">About the company</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="section" data-reveal id="how-it-works">
        <Container>
          <div className="how-it-works">
            <div className="how-it-works__head">
              <p className="eyebrow">{howItWorks.eyebrow}</p>
              <h2 aria-label={howItWorks.title} className="how-it-works__title">
                <span aria-hidden="true">
                  <SplitWords text={howItWorks.title} />
                </span>
              </h2>
              <p className="how-it-works__lead">{howItWorks.lead}</p>
            </div>
            <MachineDrawing />
          </div>
        </Container>
      </section>

      <Section className="home-company" eyebrow="The company">
        <div className="editorial-grid">
          <p className="eyebrow">Who we are</p>
          <div className="large-prose">
            <p>
              An independent, founder-led software company based in Uzbekistan.
              We build a small number of tools and hold each one to the same
              standard: fast to use, private by default, honest about what it
              does.
            </p>
          </div>
        </div>
        <dl className="about-facts" data-stagger>
          {companyFacts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        eyebrow="How we build"
        title="Your machine. Your workflow. Your call."
        className="why-section"
      >
        <div className="principles-grid principles-grid--four" data-stagger>
          {companyPrinciples.map((principle, index) => (
            <article className="principle" key={principle.title}>
              <span>0{index + 1}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
        <Link className="text-link" href="/about">
          What these mean in practice <span aria-hidden="true">→</span>
        </Link>
      </Section>

      <Section
        eyebrow="Products"
        title="What we make."
        className="home-products-section"
        id="products"
      >
        <ul className="home-products">
          {products.map((product, index) => (
            <li
              className={`home-product home-product--${product.accent}`}
              key={product.slug}
            >
              <span className="home-product__index">0{index + 1}</span>
              <div className="home-product__name">
                <h3>{product.name}</h3>
                <StatusBadge
                  label={product.statusLabel}
                  status={product.status}
                />
              </div>
              <p>{product.description}</p>
              <Link className="text-link" href={product.href}>
                Explore {product.name} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
