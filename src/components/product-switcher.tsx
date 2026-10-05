"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { products } from "@/config/products";

export function ProductSwitcher() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // The header never remounts on client-side navigation, so a native
  // <details> would stay open after following a link. Close it on every
  // route change and on every in-menu click (covers same-page clicks where
  // the pathname does not change).
  useEffect(() => {
    ref.current?.removeAttribute("open");
  }, [pathname]);

  const close = () => ref.current?.removeAttribute("open");

  return (
    <details className="switcher" ref={ref}>
      <summary>Products</summary>
      <div className="switcher__panel">
        <p className="switcher__eyebrow">Products</p>
        {products.map((product) => (
          <Link
            className={`switcher__item switcher__item--${product.accent}`}
            href={`/products/${product.slug}`}
            key={product.slug}
            onClick={close}
          >
            <span>
              <strong>{product.name}</strong>
              <small>{product.tagline}</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
        <Link className="switcher__all" href="/products" onClick={close}>
          View all products
        </Link>
      </div>
    </details>
  );
}
