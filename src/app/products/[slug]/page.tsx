import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { StatusBadge } from "@/components/status-badge";
import { getProduct, products } from "@/config/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const title = product.name;
  return {
    title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${title} — Algorithco`,
      description: product.description,
      url: `/products/${product.slug}`,
    },
    twitter: {
      card: "summary",
      title: `${title} — Algorithco`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className={`product-page product-page--${product.accent}`}>
      <section className="product-hero" data-reveal>
        <Container>
          <div className="product-hero__meta">
            <span>Algorithco / {product.shortName}</span>
            <StatusBadge status={product.status} label={product.statusLabel} />
          </div>
          <h1>{product.tagline}</h1>
          <div className="product-hero__foot">
            <div>
              <p className="product-name">{product.name}</p>
              <p>{product.description}</p>
            </div>
            <ButtonLink external href={product.externalUrl}>
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
            <ol className="feature-list">
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
            <ul className="platform-list">
              {product.platforms.map((platform) => (
                <li key={platform}>{platform}</li>
              ))}
            </ul>
          </div>
          {product.status === "preview" && (
            <aside className="preview-note" data-reveal>
              <p className="eyebrow">Status</p>
              <h2>Early preview—not generally available.</h2>
              <p>
                Guard is currently a private MVP. Its product page is the source
                for future availability updates.
              </p>
            </aside>
          )}
        </Container>
      </section>
    </div>
  );
}
