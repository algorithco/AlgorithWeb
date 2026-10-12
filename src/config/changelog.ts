import { getProduct, type ProductLink } from "./products";

export type ChangelogStream = {
  /** /changelog/<slug>, and the prefix of every release anchor. */
  slug: string;
  name: string;
  /** The name where space is short: the filter and the release label. */
  shortName: string;
  description: string;
  /**
   * The changelog this stream is read from, relative to the repository root.
   * A file under src/content/changelog is a copy of another repository's
   * CHANGELOG.md, written by `pnpm changelog:sync` (sources.json says from
   * where); the site's own changelog is read in place.
   */
  file: string;
  mark: "voice" | "guard" | "algorithco";
  /** Where the newest release is picked up, for a product that is installed. */
  action?: ProductLink;
};

const voice = getProduct("voice");
const guard = getProduct("guard");

/** One stream per product, in the order the filter lists them. */
export const changelogStreams: readonly ChangelogStream[] = [
  {
    slug: "voice",
    name: voice?.name ?? "AlgorithVoice",
    shortName: voice?.name ?? "AlgorithVoice",
    description: "The desktop dictation app.",
    file: "src/content/changelog/voice.md",
    mark: "voice",
    action: voice?.cta,
  },
  {
    slug: "guard",
    name: guard?.name ?? "AlgorithGuard",
    shortName: guard?.name ?? "AlgorithGuard",
    description: "The algo CLI and its console.",
    file: "src/content/changelog/guard.md",
    mark: "guard",
    action: guard?.cta,
  },
  {
    slug: "account",
    name: "Algorithco Account",
    shortName: "Account",
    description: "Sign-in, security and billing, shared by every product.",
    file: "src/content/changelog/account.md",
    mark: "algorithco",
  },
  {
    slug: "web",
    name: "Website and dashboard",
    shortName: "Website",
    description: "This site, its documentation and the dashboard.",
    file: "CHANGELOG.md",
    mark: "algorithco",
  },
];

export function getChangelogStream(slug: string) {
  return changelogStreams.find((stream) => stream.slug === slug);
}
