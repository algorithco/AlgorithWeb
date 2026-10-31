"use client";

import { useEffect, useId, useState } from "react";

type TocItem = { id: string; label: string; number: string };

/**
 * Table of contents that marks the clause currently being read. Beside the
 * text it is always open; above the text, on a phone or a tablet, it folds
 * behind one button and folds again once a clause is chosen.
 */
export function LegalToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    // The current clause is the last one whose top has passed the line 35%
    // down the viewport. That answer only changes when a clause crosses the
    // observed band, so the observer is just the trigger to re-measure; above
    // the first clause nothing is current.
    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight * 0.35;
        let current: string | null = null;
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= line) current = section.id;
        }
        setActive(current);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="On this page"
      className="legal-toc"
      data-open={open || undefined}
    >
      <p>On this page</p>
      <button
        aria-controls={listId}
        aria-expanded={open}
        className="legal-toc__toggle"
        onClick={() => setOpen((now) => !now)}
        type="button"
      >
        On this page
        <span className="legal-toc__count">{items.length} sections</span>
        <span aria-hidden="true" className="legal-toc__chevron" />
      </button>
      <ol id={listId}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              aria-current={active === item.id ? "location" : undefined}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">{item.number}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
