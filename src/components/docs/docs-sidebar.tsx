"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchEntry } from "@/content/docs";
import { type TocItem, TocList, useActiveSection } from "./docs-toc";

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

/** The sections of the page on screen, read from its headings. */
function readSections(): TocItem[] {
  return [
    ...document.querySelectorAll<HTMLElement>(".docs-article [data-toc-title]"),
  ].map((section) => ({
    id: section.id,
    title: section.dataset.tocTitle ?? "",
  }));
}

/**
 * The documentation's navigation: a search over every page and section, then
 * each product's pages. On a narrow screen it is a bar under the site header
 * that names the page and section being read and opens a sheet with the
 * search, the sections of this page and every page (the CSS shows it as a
 * sidebar from 64rem).
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
  const [sections, setSections] = useState<TocItem[]>([]);
  const active = useActiveSection(sections);
  const results = useMemo(
    () => search(searchIndex, query),
    [searchIndex, query],
  );
  const input = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const id = useId();

  // A new page closes the menu, clears the search and reads its sections.
  useEffect(() => {
    if (!pathname) return;
    setOpen(false);
    setQuery("");
    setSections(readSections());
  }, [pathname]);

  // While the sheet is open: Escape closes it, the page behind stays still,
  // and it opens at its top, where the sections of this page are.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.dataset.docsMenuOpen = "";
    if (body.current) body.current.scrollTop = 0;
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.docsMenuOpen;
    };
  }, [open]);

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
  // A product's first page is named by the product, not "Overview".
  const place =
    products.find((product) => `/docs/${product.slug}` === pathname)?.name ??
    current?.title ??
    "Documentation";
  const section = sections.find((item) => item.id === active);
  const close = () => setOpen(false);

  return (
    <aside className="docs-sidebar" data-open={open || undefined}>
      <button
        aria-controls={`${id}-body`}
        aria-expanded={open}
        className="docs-sidebar__toggle"
        onClick={() => setOpen((value) => !value)}
        ref={toggle}
        type="button"
      >
        <span className="docs-sidebar__where">
          <span className="docs-sidebar__page keep-case">{place}</span>
          {section && sections.length > 1 ? (
            <span className="docs-sidebar__section">{section.title}</span>
          ) : null}
        </span>
        <span className="docs-sidebar__action">
          {open ? "Close" : "Menu"}
          <span aria-hidden="true" className="docs-sidebar__chevron" />
        </span>
      </button>
      {/* Tapping beside the sheet closes it. */}
      <div aria-hidden="true" className="docs-sidebar__scrim" onClick={close} />
      <div
        className="docs-sidebar__body"
        data-open={open || undefined}
        id={`${id}-body`}
        ref={body}
      >
        <div className="docs-search" role="search">
          <input
            aria-controls={`${id}-results`}
            aria-label="Search the documentation"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // Escape clears the search first, then closes the menu.
              if (event.key === "Escape" && query) {
                event.stopPropagation();
                setQuery("");
              }
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
                    <Link
                      href={entry.href}
                      onClick={() => {
                        setQuery("");
                        close();
                      }}
                    >
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
        {sections.length > 1 ? (
          <nav aria-label="On this page" className="docs-sidebar__toc">
            <p>On this page</p>
            <TocList active={active} items={sections} onNavigate={close} />
          </nav>
        ) : null}
        <nav aria-label="Documentation" className="docs-nav">
          <Link
            aria-current={pathname === "/docs" ? "page" : undefined}
            className="docs-nav__home"
            href="/docs"
            onClick={close}
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
                          onClick={close}
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
