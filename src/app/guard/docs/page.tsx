import Link from "next/link";
import { guardDocs } from "@/content/guard-docs";

export default function GuardDocsPage() {
  return (
    <>
      <p className="eyebrow">
        <span className="keep-case">AlgorithGuard</span>
      </p>
      <h1>Documentation</h1>
      <p className="docs-lead">
        Install the CLI, understand the local decision pipeline, and operate the
        team console.
      </p>
      <div className="docs-grid">
        {Object.entries(guardDocs).map(([slug, doc]) => (
          <Link className="guard-card" href={`/guard/docs/${slug}`} key={slug}>
            <h2>{doc.title}</h2>
            <p className="muted">{doc.intro}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
