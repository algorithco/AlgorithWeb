import { readFileSync } from "node:fs";
import path from "node:path";
import { type ChangelogStream, changelogStreams } from "../config/changelog";
import {
  type ParsedChangelog,
  parseChangelog,
  type Release,
} from "./changelog";

/**
 * The changelog files, read while the site is built (it is a static export,
 * so this never runs in a browser). Import it from server components only.
 */

export type StreamRelease = {
  stream: ChangelogStream;
  release: Release;
  /** `voice-0.5.21`: the release's anchor on every changelog page. */
  anchor: string;
  /** The newest release of its stream. */
  latest: boolean;
};

export function loadChangelog(stream: ChangelogStream): ParsedChangelog {
  let markdown: string;
  try {
    markdown = readFileSync(path.join(process.cwd(), stream.file), "utf8");
  } catch {
    // A missing file is an empty changelog, so the other streams still build.
    return { releases: [], problems: [`${stream.file} could not be read`] };
  }
  return parseChangelog(markdown);
}

export function streamReleases(stream: ChangelogStream): StreamRelease[] {
  return loadChangelog(stream).releases.map((release, index) => ({
    stream,
    release,
    anchor: `${stream.slug}-${release.id}`,
    latest: index === 0,
  }));
}

/** Every stream's releases as one list, newest first. */
export function allReleases(): StreamRelease[] {
  // The sort is stable: on one day the streams keep the order of the filter.
  return changelogStreams
    .flatMap(streamReleases)
    .sort((a, b) =>
      a.release.date < b.release.date
        ? 1
        : a.release.date > b.release.date
          ? -1
          : 0,
    );
}
