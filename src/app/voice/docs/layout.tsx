import Link from "next/link";
import type { ReactNode } from "react";
import { voiceDocs } from "@/content/voice-docs";

export default function VoiceDocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-shell docs-shell--mono">
      <aside className="docs-nav">
        <p className="eyebrow">
          <span className="keep-case">AlgorithVoice</span> documentation
        </p>
        <Link href="/voice/docs">Overview</Link>
        {Object.entries(voiceDocs).map(([slug, doc]) => (
          <Link key={slug} href={`/voice/docs/${slug}`}>
            {doc.title}
          </Link>
        ))}
      </aside>
      <article className="docs-content">{children}</article>
    </div>
  );
}
