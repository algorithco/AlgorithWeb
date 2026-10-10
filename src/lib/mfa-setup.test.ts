import { describe, expect, it } from "vitest";
import {
  buildQrSvg,
  groupSetupKey,
  RECOVERY_CODES_FILENAME,
  recoveryCodesText,
} from "./mfa-setup";

const URI =
  "otpauth://totp/Algorithco%3Aname%40example.com?secret=ISDUVBMKAH5BGA7LTIYQ7C55IKKLL6JJ&issuer=Algorithco&algorithm=SHA1&digits=6&period=30";

describe("setup QR code", () => {
  it("builds a square viewBox with a four-module quiet zone", () => {
    const qr = buildQrSvg(URI);
    expect(qr).not.toBeNull();
    const [x, y, w, h] = (qr?.viewBox ?? "").split(" ").map(Number);
    expect(x).toBe(-4);
    expect(y).toBe(-4);
    expect(w).toBe(h);
    // modules + 2 * quiet zone; a QR version 1 symbol is 21 modules
    expect((w ?? 0) - 8).toBeGreaterThanOrEqual(21);
    expect(((w ?? 0) - 8 - 17) % 4).toBe(0);
  });

  it("emits only well-formed, in-bounds horizontal runs", () => {
    const qr = buildQrSvg(URI);
    const span = Number((qr?.viewBox ?? "").split(" ")[2]) - 8;
    const runs = [
      ...(qr?.path ?? "").matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g),
    ];
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.map((run) => run[0]).join("")).toBe(qr?.path);
    for (const [, x, y, width, back] of runs) {
      expect(width).toBe(back);
      expect(Number(y)).toBeLessThan(span);
      expect(Number(x) + Number(width)).toBeLessThanOrEqual(span);
    }
  });

  it("is deterministic for the same input and differs for another", () => {
    expect(buildQrSvg(URI)).toEqual(buildQrSvg(URI));
    expect(buildQrSvg(URI)?.path).not.toBe(buildQrSvg(`${URI}1`)?.path);
  });

  it("returns null instead of throwing when the text is too long", () => {
    expect(buildQrSvg("x".repeat(5000))).toBeNull();
  });
});

describe("setup key formatting", () => {
  it("groups the key in fours and tolerates stray whitespace", () => {
    expect(groupSetupKey("ISDUVBMKAH5BGA7L")).toBe("ISDU VBMK AH5B GA7L");
    expect(groupSetupKey(" ABCDEF ")).toBe("ABCD EF");
    expect(groupSetupKey("")).toBe("");
  });
});

describe("recovery code file", () => {
  it("numbers the codes and records the generation date", () => {
    const text = recoveryCodesText(
      ["AAAA-1111", "BBBB-2222"],
      new Date("2026-10-10T12:00:00Z"),
    );
    expect(text).toContain("Generated: 2026-10-10");
    expect(text).toContain("1. AAAA-1111\n2. BBBB-2222\n");
    expect(RECOVERY_CODES_FILENAME).toMatch(/\.txt$/);
  });
});
