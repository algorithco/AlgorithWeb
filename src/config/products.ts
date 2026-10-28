export const productStatuses = ["available", "preview", "coming-soon"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export type ProductLink = { label: string; href: string };

export type Product = {
  slug: string;
  /** Root of the product's own section of the site (/voice, /guard). */
  href: string;
  /** Links of the product navbar under the site header, in order. */
  sections: readonly ProductLink[];
  /** The one action at the right end of the product navbar. */
  cta: ProductLink;
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  statusLabel: string;
  /** Heading of the "Works with" list: what `platforms` names. */
  platformsLabel: string;
  platforms: readonly string[];
  features: readonly string[];
  accent: "mono" | "yellow";
  externalUrl: string;
  externalLabel: string;
};

const externalUrl = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const products = [
  {
    slug: "voice",
    href: "/voice",
    sections: [
      { label: "Overview", href: "/voice" },
      { label: "Benchmarks", href: "/voice/benchmarks" },
    ],
    cta: { label: "Download", href: "/voice/download" },
    name: "AlgorithVoice",
    tagline: "Talk faster. Type never.",
    description:
      "Push-to-talk voice dictation that puts your words into the app you are already using.",
    status: "available",
    statusLabel: "Available",
    platformsLabel: "Platforms",
    platforms: ["Windows", "Linux"],
    features: [
      "Hold a hotkey, speak, and text appears in the focused app.",
      "Offline transcription with on-device models.",
      "Audio stays on your device for local transcription.",
      "Optional cloud transcription when you choose it.",
      "Free and Pro plans.",
    ],
    accent: "mono",
    externalUrl: externalUrl(
      process.env.NEXT_PUBLIC_VOICE_URL,
      "https://algorithco.trqsh.uz/app/voice",
    ),
    externalLabel: "Open AlgorithVoice",
  },
  {
    slug: "guard",
    href: "/guard",
    sections: [{ label: "Overview", href: "/guard" }],
    cta: { label: "Install", href: "/docs/guard/install" },
    name: "AlgorithGuard",
    tagline: "Control for coding agents.",
    description:
      "An intelligent control layer for CLI coding agents that makes their work safer, quieter, and auditable.",
    status: "preview",
    statusLabel: "Early preview",
    platformsLabel: "Coding agents",
    platforms: ["Claude Code", "Codex CLI", "OpenCode"],
    features: [
      "Attaches through hooks and plugins.",
      "Privacy-first and local-first by design.",
      "Shadow mode lets you observe before enforcing controls.",
      "A local audit log keeps activity inspectable.",
      "CLI command: algo.",
    ],
    accent: "yellow",
    externalUrl: externalUrl(
      process.env.NEXT_PUBLIC_GUARD_URL,
      "https://algorithco.trqsh.uz/app/guard",
    ),
    externalLabel: "Open AlgorithGuard",
  },
] as const satisfies readonly Product[];

export type ProductSlug = (typeof products)[number]["slug"];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

/** The product whose section contains this path, if any. */
export function productForPath(pathname: string) {
  return products.find(
    (product) =>
      pathname === product.href || pathname.startsWith(`${product.href}/`),
  );
}
