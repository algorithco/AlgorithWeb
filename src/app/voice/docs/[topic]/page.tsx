import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  type VoiceDocTopic,
  voiceDocs,
  voiceModels,
} from "@/content/voice-docs";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return Object.keys(voiceDocs).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  if (!(topic in voiceDocs)) return {};
  const doc = voiceDocs[topic as VoiceDocTopic];
  return {
    title: `${doc.title} — AlgorithVoice docs`,
    description: doc.intro,
    alternates: { canonical: `/voice/docs/${topic}` },
  };
}

export default async function VoiceDocPage({ params }: Props) {
  const { topic } = await params;
  if (!(topic in voiceDocs)) notFound();
  const doc = voiceDocs[topic as VoiceDocTopic];
  return (
    <>
      <p className="eyebrow">
        <span className="keep-case">AlgorithVoice</span> documentation
      </p>
      <h1>{doc.title}</h1>
      <p className="docs-lead">{doc.intro}</p>
      {topic === "models" ? (
        <section className="docs-section">
          <h2>Catalog</h2>
          <div className="docs-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Download</th>
                  <th scope="col">Languages</th>
                  <th scope="col">License</th>
                </tr>
              </thead>
              <tbody>
                {voiceModels.map((model) => (
                  <tr key={model.id}>
                    <th scope="row">
                      <code>{model.id}</code>
                      {model.note ? <small>{model.note}</small> : null}
                    </th>
                    <td>{model.size}</td>
                    <td>{model.languages}</td>
                    <td>{model.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {doc.sections.map(([title, body]) => (
        <section className="docs-section" key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
    </>
  );
}
