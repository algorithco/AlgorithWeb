import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseInline } from "../../lib/changelog";
import {
  type DocBlock,
  docsHref,
  docsProducts,
  docsSearchIndex,
  findDocsPage,
  productPages,
} from ".";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Every piece of inline text in a block. */
function texts(block: DocBlock): string[] {
  switch (block.type) {
    case "p":
      return [block.text];
    case "note":
      return [block.text, block.title ?? ""];
    case "list":
      return [...block.items];
    case "steps":
      return block.items.flatMap((step) => [step.title, step.text]);
    case "table":
      return block.rows.flat();
    case "defs":
      return block.items.map(([, text]) => text);
    case "code":
      return [];
  }
}

function links(text: string): string[] {
  const walk = (tokens: ReturnType<typeof parseInline>): string[] =>
    tokens.flatMap((token) =>
      token.kind === "link"
        ? [token.href, ...walk(token.children)]
        : token.kind === "strong"
          ? walk(token.children)
          : [],
    );
  return walk(parseInline(text));
}

const pages = docsProducts.flatMap((product) =>
  productPages(product).map((page) => ({ product, page })),
);

/** Does an app route exist for this path (outside /docs)? */
function siteRouteExists(path: string) {
  const app = join(__dirname, "..", "..", "app");
  if (path === "/") return true;
  return (
    existsSync(join(app, path, "page.tsx")) ||
    // /changelog/voice is served by changelog/[stream].
    existsSync(join(app, path.replace(/\/[^/]+$/, ""), "[stream]", "page.tsx"))
  );
}

describe("documentation", () => {
  it("has URL-safe, unique slugs and one overview per product", () => {
    const productSlugs = docsProducts.map((product) => product.slug);
    expect(new Set(productSlugs).size).toBe(productSlugs.length);
    for (const product of docsProducts) {
      const slugs = productPages(product).map((page) => page.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs[0]).toBe("");
      for (const slug of slugs.slice(1)) expect(slug).toMatch(SLUG);
    }
  });

  it("gives every page a title, a summary and sections with unique anchors", () => {
    for (const { page } of pages) {
      expect(page.title.trim()).not.toBe("");
      expect(page.summary.trim()).not.toBe("");
      expect(page.sections.length).toBeGreaterThan(0);
      const ids = page.sections.map((section) => section.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const section of page.sections) {
        expect(section.id).toMatch(SLUG);
        expect(section.blocks.length).toBeGreaterThan(0);
      }
    }
  });

  it("links only to pages and sections that exist", () => {
    const broken: string[] = [];
    for (const { product, page } of pages) {
      const from = docsHref(product.slug, page.slug);
      const all = [
        page.summary,
        ...page.sections.flatMap((section) => section.blocks.flatMap(texts)),
      ].flatMap(links);
      for (const href of all) {
        if (href.startsWith("https://")) continue;
        const [path, anchor] = href.split("#");
        const route = path.split("?")[0];
        if (route.startsWith("/docs/")) {
          const [, , productSlug, pageSlug = ""] = route.split("/");
          const target = findDocsPage(productSlug, pageSlug);
          if (
            !target ||
            (anchor &&
              !target.page.sections.some((section) => section.id === anchor))
          )
            broken.push(`${from} → ${href}`);
        } else if (!siteRouteExists(route)) {
          broken.push(`${from} → ${href}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it("finds each page with its neighbours", () => {
    const first = findDocsPage("voice");
    expect(first?.previous).toBeUndefined();
    expect(first?.next?.href).toBe("/docs/voice/install");
    expect(findDocsPage("guard")?.previous?.product).toBe("AlgorithVoice");
    expect(findDocsPage("voice", "missing")).toBeUndefined();
  });

  it("indexes every page and section for search", () => {
    const sections = pages.reduce(
      (count, { page }) => count + page.sections.length,
      0,
    );
    expect(docsSearchIndex).toHaveLength(pages.length + sections);
  });
});
