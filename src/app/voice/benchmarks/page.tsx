import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { BenchmarkTable } from "@/components/voice/benchmark-table";
import {
  benchmarkLanguages,
  benchmarkRun,
  formatDownload,
  formatSpeed,
  formatWer,
  pickOf,
} from "@/content/voice-benchmarks";

export const metadata: Metadata = {
  title: "AlgorithVoice model benchmarks",
  description:
    "Every on-device speech model in AlgorithVoice, measured on the same recordings on one laptop: word error rate, speed and memory for English, Russian and Uzbek.",
  alternates: { canonical: "/voice/benchmarks" },
};

const measured = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
  new Date(`${benchmarkRun.date}T00:00:00Z`),
);

const METHOD: ReadonlyArray<readonly [string, string]> = [
  [
    "The recordings",
    `${benchmarkRun.recordingsPerLanguage} per language from the ${benchmarkRun.dataset}: people reading sentences aloud, 17 to 20 minutes for each language. Whisper Large v3 was measured on the first 30, because on this machine it runs slower than speech.`,
  ],
  [
    "The machine",
    `One ${benchmarkRun.machine}, ${benchmarkRun.threads} threads. The models ran through the same code that runs inside the app.`,
  ],
  [
    "Word error rate",
    "The words a model got wrong, left out or added, as a share of the words that were said. Capitals and punctuation are not counted. A number written in digits where the reference spells it out counts as an error, for every model alike.",
  ],
  [
    "Speed",
    "Seconds of speech transcribed per second of work. At 10× a three-second phrase is written in about a third of a second; below 1× the model cannot keep up with you.",
  ],
  [
    "What this does not tell you",
    "These are read sentences in quiet rooms, not dictation. Your microphone, your accent and your room change the result, and with 100 recordings a gap of about a point between two models is too small to call.",
  ],
];

export default function VoiceBenchmarksPage() {
  return (
    <>
      <PageHero
        eyebrow="Benchmarks"
        title="Measured on real speech."
        description={`Every on-device model, run on the same recordings on one ordinary laptop: how many words it gets wrong, how fast it writes, and how much memory it takes. Measured on ${measured}.`}
      />

      <Section
        className="bench-picks"
        eyebrow="The short answer"
        title="One model per language."
      >
        <div className="bench-picks__grid" data-stagger>
          {benchmarkLanguages.map((language) => {
            const pick = pickOf(language);
            return (
              <article className="bench-pick" key={language.code}>
                <p className="eyebrow">{language.name}</p>
                <h3>{pick.name}</h3>
                <dl className="bench-pick__figures">
                  <div>
                    <dt>Word error rate</dt>
                    <dd>{formatWer(pick.wer)}</dd>
                  </div>
                  <div>
                    <dt>Faster than speech</dt>
                    <dd>{formatSpeed(pick.speed)}</dd>
                  </div>
                </dl>
                <p className="bench-pick__reason">{language.pickReason}</p>
                <p className="bench-pick__meta">
                  {formatDownload(pick.downloadMb)} download
                  {pick.status === "coming-soon"
                    ? " · arrives with the next release"
                    : " · in the app today"}
                </p>
                <a className="text-link" href={`#${language.code}`}>
                  Compare all {language.models.length} models{" "}
                  <span aria-hidden="true">↓</span>
                </a>
              </article>
            );
          })}
        </div>
      </Section>

      {benchmarkLanguages.map((language) => (
        <Section
          className="bench-language"
          eyebrow={`${language.models.length} models · ${language.minutes} minutes of speech`}
          id={language.code}
          key={language.code}
          title={language.name}
        >
          <p className="bench-language__takeaway">{language.takeaway}</p>
          <BenchmarkTable language={language} />
          {"footnote" in language ? (
            <p className="bench-language__footnote">{language.footnote}</p>
          ) : null}
        </Section>
      ))}

      <Section
        className="bench-method"
        eyebrow="Method"
        title="How it was measured."
      >
        <dl className="faq-list">
          {METHOD.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
        <div className="bench-method__next">
          <Link className="button button--primary" href="/voice/download">
            <span>Download AlgorithVoice</span>
            <span aria-hidden="true" className="button__mark">
              →
            </span>
          </Link>
          <Link className="text-link" href="/docs/voice/models">
            How models are installed <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>
    </>
  );
}
