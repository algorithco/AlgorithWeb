import Link from "next/link";
import type { ReactNode } from "react";
import { guardDocs } from "@/content/guard-docs";

export default function GuardDocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-shell">
      <aside className="docs-nav">
        <p className="eyebrow">Guard documentation</p>
        <Link href="/docs/guard">Overview</Link>
        {Object.entries(guardDocs).map(([slug, doc]) => (
          <Link key={slug} href={`/docs/guard/${slug}`}>
            {doc.title}
          </Link>
        ))}
      </aside>
      <article className="docs-content">{children}</article>
    </div>
  );
}
