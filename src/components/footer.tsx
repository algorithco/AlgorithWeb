import Link from "next/link";
import type { CSSProperties } from "react";
import { products } from "@/config/products";
import { ButtonLink } from "./button-link";
import { Container } from "./container";
import { SplitWords } from "./split-words";

const GIANT_WORD = "algorithco";

// One layer of the oversized wordmark. The layers are stacked and share the
// same per-letter delays, so they rise together (styles in motion.css).
function GiantWord({ variant }: { variant: "base" | "sweep" | "lit" }) {
  return (
    <p className={`footer-giant__word footer-giant__word--${variant}`}>
      {Array.from(GIANT_WORD, (char, index) => (
        <span
          className="footer-giant__char"
          // Letters repeat, so the index is part of the identity.
          key={`${index}-${char}`}
          style={{ "--c": index } as CSSProperties}
        >
          {char}
        </span>
      ))}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div aria-hidden="true" className="footer-glow" />
      <Container>
        <div className="footer-cta" data-reveal>
          <div>
            <p className="eyebrow">Two tools. One point of view.</p>
            <h2 aria-label="Software should give you leverage, not take control.">
              <span aria-hidden="true">
                <SplitWords text="Software should give you leverage," />{" "}
                <span className="footer-cta__muted">
                  <SplitWords offset={5} text="not take control." />
                </span>
              </span>
            </h2>
            <div className="footer-cta__actions">
              <ButtonLink href="/#products">Explore products</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Get in touch
              </ButtonLink>
            </div>
          </div>
          <a aria-label="Back to top" className="back-to-top" href="#main">
            <svg aria-hidden="true" viewBox="0 0 120 120">
              <defs>
                <path
                  d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"
                  id="back-to-top-orbit"
                />
              </defs>
              <text>
                <textPath href="#back-to-top-orbit" textLength="286">
                  Back to top · Back to top · Back to top ·
                </textPath>
              </text>
            </svg>
            <span aria-hidden="true" className="back-to-top__arrow">
              <span>↑</span>
            </span>
          </a>
        </div>

        <div className="footer-grid" data-stagger>
          <div className="footer-brand">
            <Link aria-label="Algorithco home" className="wordmark" href="/">
              <span aria-hidden="true" className="wordmark__mark">
                A
              </span>
              <span>algorithco</span>
            </Link>
            <p>Focused software for developers and power users.</p>
          </div>
          <nav aria-label="Product links">
            <p>Products</p>
            {products.map((product) => (
              <Link href={product.href} key={product.slug}>
                {product.shortName}
                <span
                  className={`footer-status footer-status--${product.status}`}
                >
                  {product.statusLabel}
                </span>
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

        <div aria-hidden="true" className="footer-giant" data-reveal="fade">
          <div className="footer-giant__stack" data-spotlight>
            <GiantWord variant="base" />
            <GiantWord variant="sweep" />
            <GiantWord variant="lit" />
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Algorithco</span>
          <span className="footer-bottom__privacy">
            No trackers. No third-party analytics.
          </span>
        </div>
      </Container>
    </footer>
  );
}
