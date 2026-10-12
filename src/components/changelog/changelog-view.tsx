import Link from "next/link";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { type ChangelogStream, changelogStreams } from "@/config/changelog";
import { formatDay } from "@/lib/changelog";
import { allReleases, streamReleases } from "@/lib/changelog-source";
import { ReleaseEntry, StreamMark } from "./release-entry";

/**
 * The changelog: every stream on /changelog, one stream on /changelog/<slug>.
 * The filter is plain links between those pages, so it works without
 * JavaScript and every view has its own address.
 */
export function ChangelogView({ stream }: { stream?: ChangelogStream }) {
  const entries = stream ? streamReleases(stream) : allReleases();
  const counts = new Map(
    changelogStreams.map((item) => [item.slug, streamReleases(item).length]),
  );
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const newest = entries[0];
  const description = stream
    ? `${stream.description}${
        newest
          ? ` ${entries.length} ${entries.length === 1 ? "release" : "releases"}, the newest on ${formatDay(newest.release.date)}.`
          : ""
      }`
    : "Every release of AlgorithVoice and AlgorithGuard, and every change to your account and this site. Newest first.";

  return (
    <>
      <PageHero
        description={description}
        eyebrow="Changelog"
        title={stream ? `${stream.name}.` : "What's new."}
      />
      <section className="changelog">
        <Container className="changelog__layout">
          <aside className="changelog__aside">
            <nav aria-label="Products" className="changelog-filter">
              <p>Products</p>
              <ul>
                <li>
                  <Link
                    aria-current={stream ? undefined : "page"}
                    href="/changelog"
                  >
                    <StreamMark mark="all" />
                    <span>All products</span>
                    <small>{total}</small>
                  </Link>
                </li>
                {changelogStreams.map((item) => (
                  <li key={item.slug}>
                    <Link
                      aria-current={
                        item.slug === stream?.slug ? "page" : undefined
                      }
                      href={`/changelog/${item.slug}`}
                    >
                      <StreamMark mark={item.mark} />
                      <span>{item.shortName}</span>
                      <small>{counts.get(item.slug)}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          {entries.length > 0 ? (
            <ol className="changelog__list">
              {entries.map((entry) => (
                <ReleaseEntry entry={entry} key={entry.anchor} />
              ))}
            </ol>
          ) : (
            <p className="changelog__empty">Nothing has been released yet.</p>
          )}
        </Container>
      </section>
    </>
  );
}
