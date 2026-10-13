/**
 * What the brand page offers: the files to download, the names and the
 * colors. The files under /brand are written by deploy/brand/build-brand.cjs,
 * and every color here is checked against tokens.css by the test beside this
 * file, so the page cannot show a value the site does not use.
 */

/** Every file of the page in one archive. */
export const brandKit = {
  href: "/brand/algorithco-brand.zip",
  fileName: "algorithco-brand.zip",
} as const;

/** Each file comes in both formats, at /brand/<file>.<format>. */
export const brandFormats = ["svg", "png"] as const;

export type BrandAsset = {
  /** The file name without its extension. */
  file: string;
  label: string;
  use: string;
  /** What the preview is shown on. */
  stage: "paper" | "black" | "icon";
};

export type BrandMark = {
  slug: "algorithco" | "voice";
  name: string;
  note: string;
  assets: readonly BrandAsset[];
};

export const brandMarks: readonly BrandMark[] = [
  {
    slug: "algorithco",
    name: "Algorithco",
    note: "The company mark. Use it when you mean Algorithco as a whole, or more than one of its products.",
    assets: [
      {
        file: "algorithco-mark-black",
        label: "Black",
        use: "For light backgrounds",
        stage: "paper",
      },
      {
        file: "algorithco-mark-white",
        label: "White",
        use: "For dark backgrounds",
        stage: "black",
      },
      {
        file: "algorithco-icon",
        label: "Icon",
        use: "Where a square is needed",
        stage: "icon",
      },
    ],
  },
  {
    slug: "voice",
    name: "AlgorithVoice",
    note: "Four bars of a waveform. Use it when you mean the dictation app.",
    assets: [
      {
        file: "algorithvoice-mark-black",
        label: "Black",
        use: "For light backgrounds",
        stage: "paper",
      },
      {
        file: "algorithvoice-mark-white",
        label: "White",
        use: "For dark backgrounds",
        stage: "black",
      },
      {
        file: "algorithvoice-icon",
        label: "Icon",
        use: "Where a square is needed",
        stage: "icon",
      },
    ],
  },
];

export const brandNames = [
  {
    slug: "algorithco",
    /** How the name is set beside its mark. */
    lockup: "algorithco",
    name: "Algorithco",
    note: "One word with one capital. Only our own wordmark sets it in lowercase.",
    avoid: ["AlgorithCo", "Algorith Co", "Algorithm Co"],
  },
  {
    slug: "voice",
    lockup: "AlgorithVoice",
    name: "AlgorithVoice",
    note: "One word, with a capital A and a capital V.",
    avoid: ["Algorith Voice", "Algorithvoice", "Algorithco Voice"],
  },
  {
    slug: "guard",
    lockup: "AlgorithGuard",
    name: "AlgorithGuard",
    note: "One word, with a capital A and a capital G. Its command is algo, always in lowercase.",
    avoid: ["Algorith Guard", "Algorithguard", "Algo Guard"],
  },
] as const;

/** The colors the brand is known by. `token` is where the site keeps each. */
export const brandColors = [
  {
    name: "Ink",
    token: "--color-text",
    hex: "#111111",
    role: "Text, and the ground of every dark surface.",
  },
  {
    name: "Paper",
    token: "--color-bg",
    hex: "#f7f7f5",
    role: "The page itself. Warmer than white, so long reading stays easy.",
  },
  {
    name: "White",
    token: "--color-surface",
    hex: "#ffffff",
    role: "Cards and panels on paper, and text on ink.",
  },
  {
    name: "Yellow",
    token: "--color-guard",
    hex: "#ffd300",
    role: "The one accent. It belongs to AlgorithGuard, and marks what is new or in focus.",
  },
] as const;

export type BrandColorName = (typeof brandColors)[number]["name"];

export function brandColor(name: BrandColorName) {
  // The names are the keys of the list above, so one is always found.
  return brandColors.find((color) => color.name === name)?.hex ?? "#000000";
}

/** Text on a ground, by color name. The page works out how well each reads. */
export const colorPairs: ReadonlyArray<{
  text: BrandColorName;
  ground: BrandColorName;
}> = [
  { text: "Ink", ground: "Paper" },
  { text: "White", ground: "Ink" },
  { text: "Ink", ground: "Yellow" },
  { text: "White", ground: "Yellow" },
];

/** Every color of the interface, in the light and the dark theme. */
export const themeColors = [
  { role: "Page", token: "--color-bg", light: "#f7f7f5", dark: "#0f0f0f" },
  {
    role: "Surface",
    token: "--color-surface",
    light: "#ffffff",
    dark: "#161616",
  },
  { role: "Text", token: "--color-text", light: "#111111", dark: "#f4f4f1" },
  {
    role: "Quiet text",
    token: "--color-muted",
    light: "#62625d",
    dark: "#aaa9a2",
  },
  {
    role: "Faint text",
    token: "--color-subtle",
    light: "#8b8b84",
    dark: "#7a7973",
  },
  { role: "Line", token: "--color-border", light: "#d9d9d3", dark: "#31312f" },
  {
    role: "Strong line",
    token: "--color-border-strong",
    light: "#aaaaa3",
    dark: "#555550",
  },
  { role: "Yellow", token: "--color-guard", light: "#ffd300", dark: "#ffd300" },
  {
    role: "Yellow tint",
    token: "--color-guard-soft",
    light: "#fff4b8",
    dark: "#2b2500",
  },
  {
    role: "Yellow text",
    token: "--color-guard-ink",
    light: "#6b5600",
    dark: "#ffd300",
  },
] as const;

/** What must not be done to a mark; each is drawn on the page. */
export const brandMisuse = [
  { kind: "recolor", rule: "Do not recolor it." },
  { kind: "stretch", rule: "Do not stretch or squeeze it." },
  { kind: "rotate", rule: "Do not rotate or tilt it." },
  { kind: "effects", rule: "Do not add shadows, outlines or effects." },
] as const;

export const brandAllowed = [
  "Refer to Algorithco or its products in an article, a review, a video, a talk or a comparison.",
  "Show that your tool, guide or integration works with AlgorithVoice or AlgorithGuard.",
  "List AlgorithVoice or AlgorithGuard among the tools you use.",
  "Link to this site, with a mark as the link.",
] as const;

export const brandNotAllowed = [
  "Use a mark or a name in your own logo, product name, app icon, domain or social handle.",
  "Suggest that we made, sponsor or endorse something we did not.",
  "Put a mark on things you sell or give away, such as clothing or stickers, without asking first.",
  "Show a mark or a name beside content that is unlawful or meant to deceive.",
] as const;
