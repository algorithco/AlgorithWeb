/**
 * Color arithmetic for the brand page: the notations a color is copied in, and
 * how well one color reads on another.
 */

export type Rgb = readonly [red: number, green: number, blue: number];

export function hexToRgb(hex: string): Rgb {
  const digits = hex.replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(digits)) {
    throw new Error(`Not a six-digit hex color: ${hex}`);
  }
  const value = Number.parseInt(digits, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** `#FFD300`: how a brand color is written out. */
export function formatHex(hex: string) {
  return `#${hex.replace(/^#/, "").toUpperCase()}`;
}

/** `255, 211, 0`: the three channels, as a design tool asks for them. */
export function formatRgb(hex: string) {
  return hexToRgb(hex).join(", ");
}

// WCAG 2.2 relative luminance: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
function luminance(hex: string) {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const share = channel / 255;
    return share <= 0.04045 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** The WCAG contrast ratio of two colors, from 1 (the same) to 21. */
export function contrastRatio(a: string, b: string) {
  const [dark, light] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (light + 0.05) / (dark + 0.05);
}

/** The WCAG level a ratio reaches for body text, if any. */
export function contrastGrade(ratio: number): "AAA" | "AA" | null {
  return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : null;
}
