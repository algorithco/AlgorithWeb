import { describe, expect, it } from "vitest";
import { footerColumns } from "./footer";
import { products } from "./products";

describe("footer config", () => {
  const links = footerColumns.flatMap((column) => column.links);

  it("has named columns with at least one link each", () => {
    const titles = footerColumns.map((column) => column.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const column of footerColumns) {
      expect(column.title.trim()).not.toBe("");
      expect(column.links.length).toBeGreaterThan(0);
    }
  });

  it("links each page once, inside this site", () => {
    const hrefs = links.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const link of links) {
      expect(link.label.trim()).not.toBe("");
      expect(link.href).toMatch(/^\/(?!\/)/);
    }
  });

  it("lists every product and the documentation", () => {
    const hrefs = links.map((link) => link.href);
    for (const product of products) expect(hrefs).toContain(product.href);
    expect(hrefs).toContain("/docs");
  });
});
