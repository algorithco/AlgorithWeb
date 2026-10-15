/**
 * The shape of the documentation at /docs. Text fields take the same inline
 * Markdown as a changelog line: `code`, **bold** and [links](/to).
 */

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: readonly string[]; ordered?: boolean }
  /** Numbered steps, each with a short title. */
  | { type: "steps"; items: readonly { title: string; text: string }[] }
  /** Commands or file contents, shown as typed, with a copy button. */
  | { type: "code"; code: string; label?: string }
  | {
      type: "table";
      head: readonly string[];
      rows: readonly (readonly string[])[];
      /** Columns that hold commands or identifiers, not prose. */
      codeColumns?: readonly number[];
    }
  /** A term and what it means: a flag, a setting, a file. */
  | { type: "defs"; items: readonly (readonly [string, string])[] }
  | {
      type: "note";
      tone: "info" | "tip" | "warning";
      title?: string;
      text: string;
    };

export type DocSection = {
  /** Anchor on the page: /docs/voice/dictation#hotkey. */
  id: string;
  title: string;
  blocks: readonly DocBlock[];
};

export type DocPage = {
  /** "" for the product's first page, which lives at /docs/<product>. */
  slug: string;
  /** Name in the sidebar. */
  title: string;
  /** One or two sentences under the title, also the page description. */
  summary: string;
  sections: readonly DocSection[];
};

export type DocGroup = {
  /** Heading in the sidebar. */
  title: string;
  pages: readonly DocPage[];
};

export type DocProduct = {
  slug: "voice" | "guard" | "account";
  name: string;
  /** What the product is, on the docs home. */
  description: string;
  /** The product's own page on this site, when it has one. */
  productHref?: string;
  accent: "mono" | "yellow" | "neutral";
  groups: readonly DocGroup[];
};
