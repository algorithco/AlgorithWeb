import type { CSSProperties } from "react";
import {
  type BenchmarkLanguage,
  type BenchmarkModel,
  formatDownload,
  formatMemory,
  formatSpeed,
  formatWer,
} from "@/content/voice-benchmarks";

/** A bar as long as `value` is of the longest in its column. */
function Measure({
  label,
  value,
  longest,
  text,
}: {
  label: string;
  value: number;
  longest: number;
  text: string;
}) {
  const share = longest > 0 ? value / longest : 0;
  return (
    <div className="bench-measure" role="cell">
      <span aria-hidden="true" className="bench-measure__label">
        {label}
      </span>
      <span className="bench-measure__plot">
        <span
          aria-hidden="true"
          className="bench-bar"
          style={{ "--share": share.toFixed(4) } as CSSProperties}
        />
        <span className="bench-measure__value">{text}</span>
      </span>
    </div>
  );
}

function ModelRow({
  model,
  worstWer,
  fastest,
}: {
  model: BenchmarkModel;
  worstWer: number;
  fastest: number;
}) {
  return (
    <div
      className={`bench-row${model.pick ? " bench-row--pick" : ""}`}
      role="row"
    >
      <div className="bench-row__model" role="cell">
        <span className="bench-row__name">
          <strong>{model.name}</strong>
          {model.pick ? <span className="bench-tag">Our pick</span> : null}
        </span>
        {model.status === "coming-soon" ? (
          <small>Published. Arrives in the app with the next release.</small>
        ) : null}
        {model.note ? <small>{model.note}</small> : null}
      </div>
      <Measure
        label="Word error rate"
        longest={worstWer}
        text={formatWer(model.wer)}
        value={model.wer}
      />
      <Measure
        label="Speed"
        longest={fastest}
        text={formatSpeed(model.speed)}
        value={model.speed}
      />
      <div className="bench-row__figure" role="cell">
        <span aria-hidden="true">Memory</span>
        {formatMemory(model.memoryGb)}
      </div>
      <div className="bench-row__figure" role="cell">
        <span aria-hidden="true">Download</span>
        {formatDownload(model.downloadMb)}
      </div>
    </div>
  );
}

/**
 * One language's models, most accurate first: a table whose two measures
 * are drawn as bars, each column on its own scale. The model we would pick
 * is the one dark bar; every figure is also written out, so nothing depends
 * on reading a bar's length or its colour.
 */
export function BenchmarkTable({ language }: { language: BenchmarkLanguage }) {
  const worstWer = Math.max(...language.models.map((model) => model.wer));
  const fastest = Math.max(...language.models.map((model) => model.speed));
  return (
    <div
      aria-label={`${language.name}: on-device models, most accurate first`}
      className="bench-table"
      role="table"
    >
      <div className="bench-table__head" role="row">
        <span role="columnheader">Model</span>
        <span role="columnheader">
          Word error rate <small>lower is better</small>
        </span>
        <span role="columnheader">
          Speed <small>times faster than speech</small>
        </span>
        <span className="is-number" role="columnheader">
          Memory
        </span>
        <span className="is-number" role="columnheader">
          Download
        </span>
      </div>
      {language.models.map((model) => (
        <ModelRow
          fastest={fastest}
          key={model.id}
          model={model}
          worstWer={worstWer}
        />
      ))}
    </div>
  );
}
