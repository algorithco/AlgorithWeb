import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  brandColors,
  brandFormats,
  brandKit,
  brandMarks,
  colorPairs,
  themeColors,
} from "./brand";

const root = process.cwd();
const tokens = readFileSync(path.join(root, "src/app/tokens.css"), "utf8");

/** The custom properties of one rule of tokens.css. */
function tokensOf(selector: string) {
  const start = tokens.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`tokens.css has no ${selector} rule`);
  const body = tokens.slice(start, tokens.indexOf("}", start));
  return new Map(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

// The first `:root` rule is the light theme; the system-dark media query and
// `[data-theme="dark"]` hold the same dark values.
const light = tokensOf(":root");
const dark = tokensOf(':root[data-theme="dark"]');

describe("brand downloads", () => {
  it("offers only files that exist", () => {
    for (const mark of brandMarks) {
      for (const asset of mark.assets) {
        for (const format of brandFormats) {
          const file = `public/brand/${asset.file}.${format}`;
          expect(existsSync(path.join(root, file)), file).toBe(true);
        }
      }
    }
  });

  it("has the archive of all of them", () => {
    expect(existsSync(path.join(root, "public", brandKit.href))).toBe(true);
    expect(brandKit.href.endsWith(`/${brandKit.fileName}`)).toBe(true);
  });
});

describe("brand colors", () => {
  it("are the colors the site is built with", () => {
    for (const color of brandColors) {
      expect(light.get(color.token), color.name).toBe(color.hex);
    }
  });

  it("match both themes of the site", () => {
    for (const color of themeColors) {
      expect(light.get(color.token), `${color.role}, light`).toBe(color.light);
      expect(dark.get(color.token), `${color.role}, dark`).toBe(color.dark);
    }
  });

  it("are paired by names that exist", () => {
    const names = brandColors.map((color) => color.name);
    expect(new Set(names).size).toBe(names.length);
    for (const pair of colorPairs) {
      expect(names).toContain(pair.text);
      expect(names).toContain(pair.ground);
    }
  });
});
