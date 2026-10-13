"use client";

import { type CSSProperties, useState } from "react";

/**
 * A color value that is copied when pressed. With `swatch` it is the short
 * form used in a table: a dot of the color, then the value.
 */
export function CopyValue({
  label,
  value,
  swatch,
}: {
  /** What is copied, for the button's name: "Ink HEX". */
  label: string;
  value: string;
  swatch?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      aria-label={`Copy ${label}: ${value}`}
      className={`brand-copy${swatch ? " brand-copy--dot" : ""}`}
      data-copied={copied || undefined}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      type="button"
    >
      {swatch ? (
        <span
          aria-hidden="true"
          className="brand-copy__dot"
          style={{ "--dot": swatch } as CSSProperties}
        />
      ) : null}
      <code>{value}</code>
      <span aria-live="polite" className="brand-copy__state">
        {copied ? "Copied" : swatch ? "" : "Copy"}
      </span>
    </button>
  );
}
