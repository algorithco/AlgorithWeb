import { notFound } from "next/navigation";
import { type GuardDocTopic, guardDocs } from "@/content/guard-docs";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return Object.keys(guardDocs).map((topic) => ({ topic }));
}

export default async function GuardDocPage({ params }: Props) {
  const { topic } = await params;
  if (!(topic in guardDocs)) notFound();
  const doc = guardDocs[topic as GuardDocTopic];
  return (
    <>
      <p className="eyebrow">
        <span className="keep-case">AlgorithGuard</span> documentation
      </p>
      <h1>{doc.title}</h1>
      <p className="docs-lead">{doc.intro}</p>
      {doc.sections.map(([title, body]) => (
        <section className="docs-section" key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
    </>
  );
}
