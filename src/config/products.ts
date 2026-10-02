export const productStatuses = ["available", "preview", "coming-soon"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  statusLabel: string;
  platforms: readonly string[];
  features: readonly string[];
  accent: "mono" | "violet";
  externalUrl: string;
  externalLabel: string;
};

const externalUrl = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const products = [
  {
    slug: "voice",
    name: "Algorith Voice",
    shortName: "Voice",
    tagline: "Talk faster. Type never.",
    description:
      "Push-to-talk voice dictation that puts your words into the app you are already using.",
    status: "available",
    statusLabel: "Available",
    platforms: ["Windows", "Linux", "macOS"],
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
      "https://voice.algorithco.com",
    ),
    externalLabel: "Visit Algorith Voice",
  },
  {
    slug: "guard",
    name: "algorithco guard",
    shortName: "Guard",
    tagline: "Control for coding agents.",
    description:
      "An intelligent control layer for CLI coding agents that makes their work safer, quieter, and auditable.",
    status: "preview",
    statusLabel: "Early preview",
    platforms: ["Claude Code", "Codex CLI", "OpenCode"],
    features: [
      "Attaches through hooks and plugins.",
      "Privacy-first and local-first by design.",
      "Shadow mode lets you observe before enforcing controls.",
      "A local audit log keeps activity inspectable.",
      "CLI command: algo.",
    ],
    accent: "violet",
    externalUrl: externalUrl(
      process.env.NEXT_PUBLIC_GUARD_URL,
      "https://guard.algorithco.com",
    ),
    externalLabel: "Explore the early preview",
  },
] as const satisfies readonly Product[];

export type ProductSlug = (typeof products)[number]["slug"];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
