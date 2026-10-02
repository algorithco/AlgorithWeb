import Link from "next/link";
import { products } from "@/config/products";

export function ProductSwitcher() {
  return (
    <details className="switcher">
      <summary>Products</summary>
      <div className="switcher__panel">
        <p className="switcher__eyebrow">Products</p>
        {products.map((product) => (
          <Link
            className={`switcher__item switcher__item--${product.accent}`}
            href={`/products/${product.slug}`}
            key={product.slug}
          >
            <span>
              <strong>{product.name}</strong>
              <small>{product.tagline}</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
        <Link className="switcher__all" href="/products">
          View all products
        </Link>
      </div>
    </details>
  );
}
