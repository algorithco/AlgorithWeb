import Link from "next/link";
import { AlgorithcoMark, VoiceMark } from "@/components/brand-marks";
import type { ChangelogStream } from "@/config/changelog";
import { type ChangeType, formatDay } from "@/lib/changelog";
import type { StreamRelease } from "@/lib/changelog-source";
import { InlineText } from "./inline-text";

const TYPE_LABELS: Record<ChangeType, string> = {
  added: "New",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  deprecated: "Deprecated",
  security: "Security",
};

/** A stream's mark; "all" is the filter's entry for every stream at once. */
export function StreamMark({
  mark,
}: {
  mark: ChangelogStream["mark"] | "all";
}) {
  if (mark === "voice") return <VoiceMark className="changelog-mark" />;
  if (mark === "algorithco")
    return <AlgorithcoMark className="changelog-mark" />;
  return (
    <span
      aria-hidden="true"
      className={`changelog-mark changelog-mark--${mark === "guard" ? "dot" : "ring"}`}
    />
  );
}

/** One release on the timeline, linkable as /changelog#<anchor>. */
export function ReleaseEntry({ entry }: { entry: StreamRelease }) {
  const { stream, release, anchor, latest } = entry;
  const heading = release.version ?? release.title ?? formatDay(release.date);
  const classes = [
    "changelog-entry",
    // A version is a few digits; a dated release is headed by a sentence.
    release.version ? "" : "changelog-entry--dated",
    latest ? "changelog-entry--latest" : "",
  ];
  return (
    <li className={classes.filter(Boolean).join(" ")} data-reveal id={anchor}>
      <article aria-labelledby={`${anchor}-title`}>
        <p className="changelog-entry__meta">
          <span className="changelog-entry__stream">
            <StreamMark mark={stream.mark} />
            {stream.name}
          </span>
          <time dateTime={release.date}>{formatDay(release.date)}</time>
          {latest ? (
            <span className="changelog-entry__latest">Latest</span>
          ) : null}
        </p>
        <h2 id={`${anchor}-title`}>
          <a href={`#${anchor}`}>
            {release.version ? (
              <span className="sr-only">{stream.name} </span>
            ) : null}
            {heading}
          </a>
        </h2>
        {release.version && release.title ? (
          <p className="changelog-entry__title">{release.title}</p>
        ) : null}
        {release.summary.map((paragraph) => (
          <p className="changelog-entry__summary" key={paragraph}>
            <InlineText text={paragraph} />
          </p>
        ))}
        {release.groups.map((group) => (
          <section
            className={`changelog-group changelog-group--${group.type}`}
            key={group.type}
          >
            <h3>{TYPE_LABELS[group.type]}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {latest && stream.action ? (
          <Link className="text-link" href={stream.action.href}>
            {stream.action.label} {stream.name}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </article>
    </li>
  );
}
