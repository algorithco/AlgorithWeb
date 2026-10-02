import { describe, expect, it } from "vitest";
import { getProduct, productStatuses, products } from "./products";

describe("product config", () => {
  it("has unique URL-safe slugs", () => {
    const slugs = products.map((product) => product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs)
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("uses supported statuses", () => {
    for (const product of products)
      expect(productStatuses).toContain(product.status);
  });

  it("has all required public fields", () => {
    for (const product of products) {
      expect(product.name.trim()).not.toBe("");
      expect(product.shortName.trim()).not.toBe("");
      expect(product.tagline.trim()).not.toBe("");
      expect(product.description.trim()).not.toBe("");
      expect(product.statusLabel.trim()).not.toBe("");
      expect(product.platforms.length).toBeGreaterThan(0);
      expect(product.features.length).toBeGreaterThan(0);
      expect(product.externalUrl).toMatch(/^https:\/\//);
      expect(product.externalLabel.trim()).not.toBe("");
    }
  });

  it("looks products up by slug", () => {
    expect(getProduct("voice")?.name).toBe("Algorith Voice");
    expect(getProduct("missing")).toBeUndefined();
  });
});
