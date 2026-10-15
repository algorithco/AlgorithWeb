"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchEntry } from "@/content/docs";

export type SidebarProduct = {
  slug: string;
  name: string;
  groups: readonly {
    title: string;
    pages: readonly { title: string; href: string }[];
  }[];
};

const MAX_RESULTS = 8;

function search(index: readonly SearchEntry[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return index
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const haystack = `${title} ${entry.trail.toLowerCase()}`;
      if (!words.every((word) => haystack.includes(word))) return null;
      // Matches in the title first, and whole pages before their sections.
      const score =
        words.filter((word) => title.includes(word)).length * 2 +
        (title.startsWith(words[0]) ? 1 : 0) +
        (entry.href.includes("#") ? 0 : 1);
      return { entry, score };
    })
    .filter((match) => match !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((match) => match.entry);
}

/**
 * The documentation's navigation: a search over every page and section, then
 * each product's pages. On a narrow screen it folds into a menu above the
 * page (the CSS shows it open from 64rem).
 */
export function DocsSidebar({
  products,
  searchIndex,
}: {
  products: readonly SidebarProduct[];
  searchIndex: readonly SearchEntry[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => search(searchIndex, query),
    [searchIndex, query],
  );
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  // A new page closes the menu and clears the search.
  useEffect(() => {
    if (!pathname) return;
    setOpen(false);
    setQuery("");
  }, [pathname]);

  // "/" jumps to the search, as on most documentation sites.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      event.preventDefault();
      setOpen(true);
      // The menu must be shown before its input can take focus.
      requestAnimationFrame(() => input.current?.focus());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = products
    .flatMap((product) => product.groups.flatMap((group) => group.pages))
    .find((page) => page.href === pathname);

  return (
    <aside className="docs-sidebar">
      <button
        aria-controls={`${id}-body`}
        aria-expanded={open}
        className="docs-sidebar__toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span>
          <small>Documentation</small>
          {current?.title ?? "All pages"}
        </span>
        <span aria-hidden="true" className="docs-sidebar__chevron" />
      </button>
      <div
        className="docs-sidebar__body"
        data-open={open || undefined}
        id={`${id}-body`}
      >
        <div className="docs-search" role="search">
          <input
            aria-controls={`${id}-results`}
            aria-label="Search the documentation"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
            placeholder="Search docs"
            ref={input}
            spellCheck={false}
            type="search"
            value={query}
          />
          <kbd aria-hidden="true">/</kbd>
        </div>
        <div aria-live="polite" id={`${id}-results`}>
          {query.trim() ? (
            results.length > 0 ? (
              <ul className="docs-search__results">
                {results.map((entry) => (
                  <li key={entry.href}>
                    <Link href={entry.href} onClick={() => setQuery("")}>
                      <span>{entry.title}</span>
                      <small>{entry.trail}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="docs-search__empty">
                Nothing matches “{query.trim()}”.
              </p>
            )
          ) : null}
        </div>
        <nav aria-label="Documentation" className="docs-nav">
          <Link
            aria-current={pathname === "/docs" ? "page" : undefined}
            className="docs-nav__home"
            href="/docs"
          >
            All documentation
          </Link>
          {products.map((product) => (
            <div className="docs-nav__product" key={product.slug}>
              <p className="docs-nav__name keep-case">{product.name}</p>
              {product.groups.map((group) => (
                <div className="docs-nav__group" key={group.title}>
                  {product.groups.length > 1 ? (
                    <p className="docs-nav__group-title">{group.title}</p>
                  ) : null}
                  <ul>
                    {group.pages.map((page) => (
                      <li key={page.href}>
                        <Link
                          aria-current={
                            pathname === page.href ? "page" : undefined
                          }
                          href={page.href}
                        >
                          {page.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
