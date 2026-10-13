import { describe, expect, it } from "vitest";
import {
  contrastGrade,
  contrastRatio,
  formatHex,
  formatRgb,
  hexToRgb,
} from "./color";

describe("color notations", () => {
  it("reads the channels of a hex color", () => {
    expect(hexToRgb("#ffd300")).toEqual([255, 211, 0]);
    expect(hexToRgb("F7F7F5")).toEqual([247, 247, 245]);
  });

  it("refuses anything but six hex digits", () => {
    for (const value of ["#fff", "#ffd30", "#gggggg", "yellow"]) {
      expect(() => hexToRgb(value)).toThrow();
    }
  });

  it("writes a color out the way it is copied", () => {
    expect(formatHex("#ffd300")).toBe("#FFD300");
    expect(formatRgb("#ffd300")).toBe("255, 211, 0");
  });
});

describe("contrast", () => {
  it("is 21 between black and white, in either order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1 between a color and itself", () => {
    expect(contrastRatio("#ffd300", "#ffd300")).toBe(1);
  });

  it("grades a ratio for body text", () => {
    expect(contrastGrade(7)).toBe("AAA");
    expect(contrastGrade(4.5)).toBe("AA");
    expect(contrastGrade(4.49)).toBeNull();
  });
});
