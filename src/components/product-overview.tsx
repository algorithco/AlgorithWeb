import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { StatusBadge } from "@/components/status-badge";
import type { Product } from "@/config/products";
import { siteConfig } from "@/config/site";
import { docsHref, getDocsProduct, productPages } from "@/content/docs";

export function productMetadata(product: Product): Metadata {
  const title = product.name;
  return {
    title,
    description: product.description,
    alternates: { canonical: product.href },
    openGraph: {
      title: `${title} — Algorithco`,
      description: product.description,
      url: product.href,
    },
    twitter: {
      card: "summary",
      title: `${title} — Algorithco`,
      description: product.description,
    },
  };
}

/**
 * Overview page of a product section (/voice, /guard). `children` are extra
 * detail rows of that product, placed after the platforms.
 */
export function ProductOverview({
  children,
  product,
}: {
  children?: ReactNode;
  product: Product;
}) {
  // The product page is where its documentation is linked from.
  const docs = getDocsProduct(product.slug);
  return (
    <div className={`product-page product-page--${product.accent}`}>
      <section className="product-hero" data-reveal>
        <Container>
          <div className="product-hero__meta">
            <span>
              Algorithco / <span className="keep-case">{product.name}</span>
            </span>
            <StatusBadge status={product.status} label={product.statusLabel} />
          </div>
          <h1>{product.tagline}</h1>
          <div className="product-hero__foot">
            <div>
              <p className="product-name">{product.name}</p>
              <p>{product.description}</p>
            </div>
            <ButtonLink
              external={
                new URL(product.externalUrl).origin !==
                new URL(siteConfig.siteUrl).origin
              }
              href={product.externalUrl}
            >
              {product.externalLabel}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="product-details">
        <Container>
          <div className="detail-row" data-reveal>
            <div>
              <p className="eyebrow">What it does</p>
              <h2>One job, carefully built.</h2>
            </div>
            <ol className="feature-list" data-stagger>
              {product.features.map((feature, index) => (
                <li key={feature}>
                  <span>0{index + 1}</span>
                  <p>{feature}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="detail-row detail-row--compact" data-reveal>
            <div>
              <p className="eyebrow">Works with</p>
              <h2>Platforms</h2>
            </div>
            <ul className="platform-list" data-stagger>
              {product.platforms.map((platform) => (
                <li key={platform}>{platform}</li>
              ))}
            </ul>
          </div>
          {children}
          {docs ? (
            <div className="detail-row" data-reveal>
              <div>
                <p className="eyebrow">Documentation</p>
                <h2>Every detail, written down.</h2>
              </div>
              <div>
                <ul className="product-docs" data-stagger>
                  {productPages(docs)
                    .filter((page) => page.slug)
                    .map((page) => (
                      <li key={page.slug}>
                        <Link href={docsHref(docs.slug, page.slug)}>
                          {page.title}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                </ul>
                <Link className="text-link" href={docsHref(docs.slug)}>
                  Read the <span className="keep-case">{product.name}</span>{" "}
                  documentation <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          ) : null}
          {product.status === "preview" && (
            <aside className="preview-note" data-reveal>
              <p className="eyebrow">Status</p>
              <h2>Early preview—not generally available.</h2>
              <p>
                AlgorithGuard is currently a private MVP. Its product page is
                the source for future availability updates.
              </p>
            </aside>
          )}
        </Container>
      </section>
    </div>
  );
}
