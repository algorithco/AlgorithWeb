import Link from "next/link";
import { products } from "@/config/products";
import { Container } from "./container";
import { SplitWords } from "./split-words";

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-cta" data-reveal>
          <p className="eyebrow">Two tools. One point of view.</p>
          <h2 aria-label="Software should give you leverage, not take control.">
            <span aria-hidden="true">
              <SplitWords text="Software should give you leverage, not take control." />
            </span>
          </h2>
          <Link className="footer-cta__link" href="/products">
            Explore our products <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="footer-grid" data-stagger>
          <div>
            <Link className="wordmark" href="/">
              algorithco
            </Link>
            <p>Focused software for developers and power users.</p>
          </div>
          <nav aria-label="Product links">
            <p>Products</p>
            {products.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.slug}>
                {product.shortName}
              </Link>
            ))}
          </nav>
          <nav aria-label="Company links">
            <p>Company</p>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav aria-label="Legal links">
            <p>Legal</p>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Algorithco</span>
          <span>No trackers. No third-party analytics.</span>
        </div>
      </Container>
    </footer>
  );
}
