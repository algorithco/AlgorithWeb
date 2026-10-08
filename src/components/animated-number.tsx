"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 900;

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;

/**
 * Counts up to `value` when it first appears and between values afterwards.
 * Integers only; callers format anything else themselves.
 */
export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(() =>
    typeof window === "undefined" || reducedMotion() ? value : 0,
  );
  const shown = useRef(display);

  useEffect(() => {
    const from = shown.current;
    if (reducedMotion() || from === value) {
      shown.current = value;
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const current = Math.round(
        from + (value - from) * easeOutQuart(progress),
      );
      shown.current = current;
      setDisplay(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span suppressHydrationWarning>{display}</span>;
}
