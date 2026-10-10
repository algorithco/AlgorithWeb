import type { Metadata } from "next";
import Link from "next/link";
import { voiceDocs } from "@/content/voice-docs";

export const metadata: Metadata = {
  title: "AlgorithVoice documentation",
  description:
    "Install AlgorithVoice, dictate with the hotkey, and choose between local and cloud transcription.",
  alternates: { canonical: "/voice/docs" },
};

export default function VoiceDocsPage() {
  return (
    <>
      <p className="eyebrow">
        <span className="keep-case">AlgorithVoice</span>
      </p>
      <h1>Documentation</h1>
      <p className="docs-lead">
        Install the desktop app, dictate with the hotkey, and choose how your
        speech is transcribed.
      </p>
      <div className="docs-grid">
        {Object.entries(voiceDocs).map(([slug, doc]) => (
          <Link className="guard-card" href={`/voice/docs/${slug}`} key={slug}>
            <h2>{doc.title}</h2>
            <p className="muted">{doc.intro}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
