import Link from "next/link";
import type { CSSProperties } from "react";
import type { Product } from "@/config/products";
import { StatusBadge } from "./status-badge";

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  return (
    <article
      className={`product-card product-card--${product.accent}`}
      data-reveal
      data-tilt
      style={{ "--card-order": index } as CSSProperties}
    >
      <div className="product-card__top">
        <span className="product-card__index">0{index + 1}</span>
        <StatusBadge status={product.status} label={product.statusLabel} />
      </div>
      <div>
        <p className="product-card__label">{product.name}</p>
        <h3>{product.tagline}</h3>
        <p className="product-card__description">{product.description}</p>
      </div>
      <div className="product-card__footer">
        <ul aria-label="Platforms" className="tag-list">
          {product.platforms.map((platform) => (
            <li key={platform}>{platform}</li>
          ))}
        </ul>
        <Link className="card-link" href={`/products/${product.slug}`}>
          View product <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
