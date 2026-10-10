import qrcode from "qrcode-generator";

/** Quiet zone required by the QR spec (modules); scanners fail without it. */
const QUIET_ZONE = 4;

export type QrSvg = {
  /** `viewBox` including the quiet zone. */
  viewBox: string;
  /** One `<path d>`: every dark module, merged into horizontal runs. */
  path: string;
};

/**
 * Encodes `text` as a QR code entirely in the browser. The setup URI carries
 * the TOTP secret, so it must never be sent to a third-party QR service.
 * Returns null when the text cannot be encoded.
 */
export function buildQrSvg(text: string): QrSvg | null {
  let size: number;
  let isDark: (row: number, col: number) => boolean;
  try {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    size = qr.getModuleCount();
    isDark = (row, col) => qr.isDark(row, col);
  } catch {
    return null;
  }

  const runs: string[] = [];
  for (let row = 0; row < size; row++) {
    let col = 0;
    while (col < size) {
      if (!isDark(row, col)) {
        col++;
        continue;
      }
      const start = col;
      while (col < size && isDark(row, col)) col++;
      runs.push(`M${start} ${row}h${col - start}v1h-${col - start}z`);
    }
  }
  const span = size + QUIET_ZONE * 2;
  return {
    viewBox: `${-QUIET_ZONE} ${-QUIET_ZONE} ${span} ${span}`,
    path: runs.join(""),
  };
}

/** `ABCDEFGH` -> `ABCD EFGH`: easier to read aloud and type by hand. */
export function groupSetupKey(key: string): string {
  return (
    key
      .replace(/\s+/g, "")
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
}

export const RECOVERY_CODES_FILENAME = "algorithco-recovery-codes.txt";

export function recoveryCodesText(codes: string[], generatedOn: Date): string {
  return [
    "Algorithco recovery codes",
    `Generated: ${generatedOn.toISOString().slice(0, 10)}`,
    "",
    "Each code works once if you lose access to your authenticator app.",
    "Keep this file somewhere safe and private.",
    "",
    ...codes.map((code, index) => `${index + 1}. ${code}`),
    "",
  ].join("\n");
}
