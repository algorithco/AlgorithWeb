import { describe, expect, it } from "vitest";
import { changelogStreams } from "../config/changelog";
import sources from "../content/changelog/sources.json";
import { allReleases, loadChangelog, streamReleases } from "./changelog-source";

describe("changelog streams", () => {
  it("have unique URL-safe slugs", () => {
    const slugs = changelogStreams.map((stream) => stream.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+$/);
  });

  it("are synced from a repository exactly when they are a copy", () => {
    const copies = changelogStreams
      .filter((stream) => stream.file.startsWith("src/content/changelog/"))
      .map((stream) => stream.slug);
    expect(Object.keys(sources).sort()).toEqual([...copies].sort());
    for (const stream of changelogStreams) {
      if (copies.includes(stream.slug)) {
        expect(stream.file).toBe(`src/content/changelog/${stream.slug}.md`);
      }
    }
  });
});

// The changelogs in the repository are what the next build publishes: a
// mistake in one of them fails here, not on the live page.
describe.each(changelogStreams)("the $name changelog", (stream) => {
  const { releases, problems } = loadChangelog(stream);

  it("is written in the format the pages read", () => {
    expect(problems).toEqual([]);
  });

  it("has releases, each with something to say", () => {
    expect(releases.length).toBeGreaterThan(0);
    for (const release of releases) {
      for (const group of release.groups) {
        for (const item of group.items) expect(item.trim()).not.toBe("");
      }
    }
  });

  it("is numbered or dated throughout, not both", () => {
    const numbered = releases.filter((release) => release.version !== null);
    expect([0, releases.length]).toContain(numbered.length);
  });

  it("names a dated release", () => {
    for (const release of releases) {
      if (release.version === null) expect(release.title).not.toBeNull();
    }
  });
});

describe("the combined changelog", () => {
  it("lists every release once, newest first", () => {
    const releases = allReleases();
    const anchors = releases.map((entry) => entry.anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
    const days = releases.map((entry) => entry.release.date);
    expect(days).toEqual([...days].sort().reverse());
    expect(releases).toHaveLength(
      changelogStreams.flatMap(streamReleases).length,
    );
  });

  it("marks one newest release per stream", () => {
    for (const stream of changelogStreams) {
      const latest = streamReleases(stream).filter((entry) => entry.latest);
      expect(latest).toHaveLength(1);
      expect(latest[0].anchor).toBe(
        `${stream.slug}-${streamReleases(stream)[0].release.id}`,
      );
    }
  });
});
