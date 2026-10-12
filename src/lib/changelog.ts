/**
 * Reads a product's CHANGELOG.md (the format is in docs/changelog.md) into
 * the releases the changelog pages show.
 *
 * Only a section with a release date is a release: `## Unreleased` is work
 * that has not shipped and is never published. The parser does not throw on
 * a malformed file, because a typo in one product's changelog must not stop
 * the site from building; it reports what it skipped in `problems`, and the
 * tests fail on any problem in the changelogs that are in the repository.
 *
 * The pages are public and the source is not: a line that gives the address
 * of a repository is never published.
 */

export const changeTypes = [
  "added",
  "changed",
  "fixed",
  "removed",
  "deprecated",
  "security",
] as const;
export type ChangeType = (typeof changeTypes)[number];

export type ChangeGroup = { type: ChangeType; items: string[] };

export type Release = {
  /** Unique within one changelog: the version, or the date when there is none. */
  id: string;
  /** Null for a product that ships continuously and is dated, not numbered. */
  version: string | null;
  /** ISO day, YYYY-MM-DD. */
  date: string;
  title: string | null;
  /** Paragraphs between the heading and the first group. */
  summary: string[];
  groups: ChangeGroup[];
};

export type ParsedChangelog = { releases: Release[]; problems: string[] };

// The headings people actually type, mapped onto the six types.
const TYPE_NAMES: Record<string, ChangeType> = {
  added: "added",
  new: "added",
  changed: "changed",
  improved: "changed",
  fixed: "fixed",
  removed: "removed",
  deprecated: "deprecated",
  security: "security",
};

const VERSION = /^\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.]+)?$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
// "0.5.21 — 2026-10-01 — Title": an em dash, an en dash or a spaced hyphen.
const HEADING_SEPARATOR = /\s+[—–-]\s+/;
// A code host, an SSH remote or a clone URL.
const REPOSITORY =
  /\b(?:github|gitlab|bitbucket|codeberg)\.(?:com|org|io)\b|\bgit@[\w.-]+:|\/[\w.-]+\.git\b/i;

/** Whether the text gives away where the source code lives. */
export function namesRepository(text: string) {
  return REPOSITORY.test(text);
}

function isRealDay(value: string) {
  if (!ISO_DAY.test(value)) return false;
  const day = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(day.getTime()) && day.toISOString().startsWith(value);
}

type Heading =
  | { kind: "unreleased" }
  | { kind: "release"; version: string | null; date: string; title: string }
  | { kind: "invalid"; reason: string };

function readHeading(text: string): Heading {
  const [first = "", ...rest] = text.split(HEADING_SEPARATOR);
  const lead = first.replace(/^\[(.+)\]$/, "$1").trim();
  if (/^unreleased$/i.test(lead)) return { kind: "unreleased" };
  if (ISO_DAY.test(lead)) {
    if (!isRealDay(lead)) return { kind: "invalid", reason: "is not a date" };
    return {
      kind: "release",
      version: null,
      date: lead,
      title: rest.join(" — "),
    };
  }
  const version = lead.replace(/^v/i, "");
  if (!VERSION.test(version)) {
    return { kind: "invalid", reason: "is neither a version nor a date" };
  }
  const [day = "", ...title] = rest;
  const date = day.replace(/^\((.+)\)$/, "$1").trim();
  if (!date) return { kind: "invalid", reason: "has no release date" };
  if (!isRealDay(date)) {
    return { kind: "invalid", reason: `has an invalid date "${date}"` };
  }
  return { kind: "release", version, date, title: title.join(" — ") };
}

export function parseChangelog(markdown: string): ParsedChangelog {
  const problems: string[] = [];
  const releases: Release[] = [];
  const lines = markdown
    .replace(/\r\n?/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n");

  let release: Release | null = null;
  let group: ChangeGroup | null = null;
  // The item or summary paragraph a wrapped line continues.
  let open: "item" | "summary" | null = null;

  const closeRelease = () => {
    if (!release) return;
    const id = release.id;
    const keep = (text: string) => {
      if (!namesRepository(text)) return true;
      problems.push(`${id}: a line gives a repository address`);
      return false;
    };
    if (release.title && !keep(release.title)) release.title = null;
    release.summary = release.summary.filter(keep);
    for (const entry of release.groups) entry.items = entry.items.filter(keep);
    release.groups = release.groups.filter((entry) => entry.items.length > 0);
    if (release.groups.length > 0) releases.push(release);
    else problems.push(`${release.id}: the release lists no changes`);
    release = null;
    group = null;
    open = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const text = line.trim();

    const section = /^##\s+(.+)$/.exec(line);
    if (section) {
      closeRelease();
      const heading = readHeading(section[1].trim());
      if (heading.kind === "release") {
        release = {
          id: heading.version ?? heading.date,
          version: heading.version,
          date: heading.date,
          title: heading.title.trim() || null,
          summary: [],
          groups: [],
        };
      } else if (heading.kind === "invalid") {
        problems.push(`"## ${section[1].trim()}" ${heading.reason}`);
      }
      continue;
    }
    if (!release) continue;

    if (text === "") {
      open = null;
      continue;
    }

    const typeHeading = /^###\s+(.+)$/.exec(line);
    if (typeHeading) {
      const name = typeHeading[1].trim();
      const type = TYPE_NAMES[name.toLowerCase()];
      if (!type) {
        problems.push(`${release.id}: "### ${name}" is not a change type`);
      }
      const wanted: ChangeType = type ?? "changed";
      group = release.groups.find((entry) => entry.type === wanted) ?? null;
      if (!group) {
        group = { type: wanted, items: [] };
        release.groups.push(group);
      }
      open = null;
      continue;
    }

    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      if (!group) {
        problems.push(`${release.id}: a change is listed outside a ### group`);
        group = { type: "changed", items: [] };
        release.groups.push(group);
      }
      group.items.push(item[1].trim());
      open = "item";
      continue;
    }

    // Anything else is running text: a wrapped line of the item above, or
    // the summary under the heading.
    if (open === "item" && group) {
      const last = group.items.length - 1;
      group.items[last] =
        `${group.items[last]} ${text.replace(/^[-*]\s+/, "")}`;
    } else if (open === "summary") {
      const last = release.summary.length - 1;
      release.summary[last] = `${release.summary[last]} ${text}`;
    } else if (!group) {
      release.summary.push(text);
      open = "summary";
    } else {
      problems.push(`${release.id}: text outside a list item: "${text}"`);
    }
  }
  closeRelease();

  const seen = new Set<string>();
  for (const [index, entry] of releases.entries()) {
    if (seen.has(entry.id)) problems.push(`${entry.id}: listed twice`);
    seen.add(entry.id);
    const newer = releases[index - 1];
    if (newer && newer.date < entry.date) {
      problems.push(`${entry.id}: newer than ${newer.id}, but listed below it`);
    }
  }

  // Newest first whatever the file says; the same day keeps the file's order.
  releases.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { releases, problems };
}

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "strong"; children: InlineToken[] }
  | { kind: "link"; href: string; children: InlineToken[] };

const INLINE = /`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/;

/** A link may lead to this site or to an https page, nowhere else. */
function isSafeHref(href: string) {
  if (namesRepository(href)) return false;
  return /^https:\/\//.test(href) || /^\/(?!\/)/.test(href);
}

/** The inline Markdown a changelog line may use: `code`, **bold**, [links](/to). */
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let rest = text;
  while (rest) {
    const match = INLINE.exec(rest);
    if (!match) break;
    if (match.index > 0) {
      tokens.push({ kind: "text", text: rest.slice(0, match.index) });
    }
    const [whole, code, strong, label, href] = match;
    if (code !== undefined) tokens.push({ kind: "code", text: code });
    else if (strong !== undefined) {
      tokens.push({ kind: "strong", children: parseInline(strong) });
    } else if (isSafeHref(href)) {
      tokens.push({ kind: "link", href, children: parseInline(label) });
    } else tokens.push(...parseInline(label));
    rest = rest.slice(match.index + whole.length);
  }
  if (rest) tokens.push({ kind: "text", text: rest });
  return tokens;
}

/** The line as plain text, for page descriptions. */
export function plainText(text: string): string {
  const flatten = (tokens: InlineToken[]): string =>
    tokens
      .map((token) =>
        "children" in token ? flatten(token.children) : token.text,
      )
      .join("");
  return flatten(parseInline(text));
}

const LONG_DAY = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

/** "2026-10-01" as "October 1, 2026", the same day in every time zone. */
export function formatDay(date: string): string {
  return LONG_DAY.format(new Date(`${date}T00:00:00Z`));
}
