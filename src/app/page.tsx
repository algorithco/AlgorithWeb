import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { products } from "@/config/products";
import { copy } from "@/content/copy";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="home-hero" data-page-enter>
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
            <ButtonLink href="/products">Explore products</ButtonLink>
          </div>
        </Container>
      </section>

      <Section
        eyebrow="Products"
        title="Small tools. Serious intent."
        className="products-section"
      >
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard product={product} index={index} key={product.slug} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Why Algorithco"
        title="Your machine. Your workflow. Your call."
        className="why-section"
      >
        <div className="principles-grid">
          {copy.why.map((item) => (
            <article className="principle" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <Link className="text-link" href="/about">
          More about the company <span aria-hidden="true">→</span>
        </Link>
      </Section>
    </>
  );
}
