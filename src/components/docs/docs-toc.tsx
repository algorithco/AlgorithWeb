"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; title: string };

/** "On this page": the sections of a docs page, marking the one being read. */
export function DocsToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    // The current section is the last one whose top has passed the line a
    // quarter down the viewport; the observer only says when to re-measure.
    const measure = () => {
      const line = window.innerHeight * 0.25;
      let current: string | null = sections[0]?.id ?? null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    const observer = new IntersectionObserver(measure, {
      rootMargin: "-15% 0px -70% 0px",
    });
    for (const section of sections) observer.observe(section);
    measure();
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className="docs-toc">
      <p>On this page</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              aria-current={active === item.id ? "location" : undefined}
              href={`#${item.id}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
