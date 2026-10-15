import type { Metadata } from "next";
import Link from "next/link";
import { InlineText } from "@/components/changelog/inline-text";
import type { DocLocation } from "@/content/docs";
import { plainText } from "@/lib/changelog";
import { DocBlocks } from "./doc-blocks";
import { DocsToc } from "./docs-toc";

export function docMetadata({ product, page, href }: DocLocation): Metadata {
  const title = page.slug
    ? `${page.title} — ${product.name} docs`
    : `${product.name} docs`;
  const description = plainText(page.summary);
  return {
    title,
    description,
    alternates: { canonical: href },
    openGraph: { title: `${title} — Algorithco`, description, url: href },
  };
}

/** One page of the documentation: title, sections, and the way onwards. */
export function DocArticle({ location }: { location: DocLocation }) {
  const { product, page, previous, next } = location;
  return (
    <div className="docs-page" data-docs-product={product.slug}>
      <article className="docs-article">
        <nav aria-label="Breadcrumb" className="docs-breadcrumb">
          <ol>
            <li>
              <Link href="/docs">Docs</Link>
            </li>
            <li>
              {page.slug ? (
                <Link className="keep-case" href={`/docs/${product.slug}`}>
                  {product.name}
                </Link>
              ) : (
                <span aria-current="page" className="keep-case">
                  {product.name}
                </span>
              )}
            </li>
            {page.slug ? (
              <li>
                <span aria-current="page">{page.title}</span>
              </li>
            ) : null}
          </ol>
        </nav>
        <header className="docs-article__header">
          <h1>{page.slug ? page.title : product.name}</h1>
          <p className="docs-article__summary">
            <InlineText text={page.summary} />
          </p>
          {!page.slug && product.productHref ? (
            <Link className="text-link" href={product.productHref}>
              <span className="keep-case">{product.name}</span> product page{" "}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </header>
        {page.sections.map((section) => (
          <section
            aria-labelledby={`${section.id}-title`}
            className="docs-section"
            id={section.id}
            key={section.id}
          >
            <h2 id={`${section.id}-title`}>
              <a
                aria-hidden="true"
                className="docs-anchor"
                href={`#${section.id}`}
                tabIndex={-1}
              >
                #
              </a>
              <InlineText text={section.title} />
            </h2>
            <DocBlocks blocks={section.blocks} />
          </section>
        ))}
        <nav aria-label="More pages" className="docs-pager">
          {previous ? (
            <Link className="docs-pager__link" href={previous.href} rel="prev">
              <small>Previous</small>
              <span>{previous.title}</span>
              {previous.product !== product.name ? (
                <small className="keep-case">{previous.product}</small>
              ) : null}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              className="docs-pager__link docs-pager__link--next"
              href={next.href}
              rel="next"
            >
              <small>Next</small>
              <span>{next.title}</span>
              {next.product !== product.name ? (
                <small className="keep-case">{next.product}</small>
              ) : null}
            </Link>
          ) : null}
        </nav>
      </article>
      <aside className="docs-aside">
        <DocsToc
          items={page.sections.map((section) => ({
            id: section.id,
            title: plainText(section.title),
          }))}
        />
      </aside>
    </div>
  );
}
