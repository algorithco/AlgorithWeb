import type { Metadata } from "next";
import Link from "next/link";
import { docsHref, docsProducts, productPages } from "@/content/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "How to install and use AlgorithVoice and AlgorithGuard, and how your Algorithco account works.",
  alternates: { canonical: "/docs" },
};

const popular = [
  { label: "Install AlgorithVoice", href: "/docs/voice/install" },
  { label: "Choose an on-device model", href: "/docs/voice/models" },
  { label: "AlgorithGuard quickstart", href: "/docs/guard/quickstart" },
  { label: "algo command reference", href: "/docs/guard/cli" },
  { label: "Two-step verification", href: "/docs/account/security#two-step" },
  { label: "Plans and billing", href: "/docs/account/billing" },
] as const;

/** /docs: where every product's documentation starts. */
export default function DocsHomePage() {
  return (
    <div className="docs-home">
      <header className="docs-home__header">
        <p className="eyebrow">Documentation</p>
        <h1>Everything you need to use Algorithco.</h1>
        <p className="docs-article__summary">
          Install the apps, learn what each setting does, and find the answer
          when something does not work. Press <kbd>/</kbd> to search.
        </p>
      </header>

      <div className="docs-home__products">
        {docsProducts.map((product) => {
          const pages = productPages(product).filter((page) => page.slug);
          return (
            <section
              aria-labelledby={`docs-home-${product.slug}`}
              className="docs-home__product"
              data-docs-product={product.slug}
              key={product.slug}
            >
              <h2 className="keep-case" id={`docs-home-${product.slug}`}>
                <Link href={docsHref(product.slug)}>{product.name}</Link>
              </h2>
              <p>{product.description}</p>
              <ul>
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link href={docsHref(product.slug, page.slug)}>
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="text-link" href={docsHref(product.slug)}>
                Start here <span aria-hidden="true">→</span>
              </Link>
            </section>
          );
        })}
      </div>

      <section
        aria-labelledby="docs-home-popular"
        className="docs-home__popular"
      >
        <h2 id="docs-home-popular">Popular pages</h2>
        <ul>
          {popular.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                {link.label} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="docs-home-help" className="docs-home__help">
        <h2 id="docs-home-help">Still stuck?</h2>
        <p>
          Each product has a troubleshooting page:{" "}
          <Link href="/docs/voice/troubleshooting">AlgorithVoice</Link>,{" "}
          <Link href="/docs/guard/troubleshooting">AlgorithGuard</Link>. If it
          does not have your answer, <Link href="/contact">write to us</Link>.
          What changed in each release is in the{" "}
          <Link href="/changelog">changelog</Link>.
        </p>
      </section>
    </div>
  );
}
