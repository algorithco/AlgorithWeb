import type { ReactNode } from "react";
import { legal } from "@/content/legal";
import { Container } from "./container";
import { LegalToc } from "./legal-toc";
import { PageHero } from "./page-hero";

export type LegalClause = {
  id: string;
  title: string;
  body: ReactNode;
};

const number = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Long-form legal page: hero, a sticky table of contents and numbered clauses
 * that can be linked to directly (/privacy#cookies).
 */
export function LegalDocument({
  title,
  description,
  summary,
  clauses,
}: {
  title: string;
  description: string;
  summary: readonly ReactNode[];
  clauses: readonly LegalClause[];
}) {
  return (
    <>
      <PageHero description={description} eyebrow="Legal" title={title} />
      <section className="legal-doc">
        <Container className="legal-doc__layout">
          <aside className="legal-doc__aside">
            <dl className="legal-doc__meta">
              <div>
                <dt>Last updated</dt>
                <dd>
                  <time dateTime={legal.updatedIso}>{legal.updated}</time>
                </dd>
              </div>
              <div>
                <dt>Questions</dt>
                <dd>
                  <a href={`mailto:${legal.email}`}>{legal.email}</a>
                </dd>
              </div>
            </dl>
            <LegalToc
              items={clauses.map(({ id, title: label }, index) => ({
                id,
                label,
                number: number(index),
              }))}
            />
          </aside>
          <div className="legal-doc__body">
            <div className="legal-summary" data-reveal>
              <p className="eyebrow">In short</p>
              <ul>
                {summary.map((point, index) => (
                  // Static, ordered list: the index is a stable key.
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
            {clauses.map((clause, index) => (
              <section
                aria-labelledby={`${clause.id}-title`}
                className="legal-clause"
                id={clause.id}
                key={clause.id}
              >
                <h2 id={`${clause.id}-title`}>
                  <span aria-hidden="true">{number(index)}</span>
                  {clause.title}
                </h2>
                {clause.body}
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
