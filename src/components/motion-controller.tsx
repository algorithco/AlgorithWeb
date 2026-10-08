"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

// Layout effects run before the browser paints (and before a route
// transition snapshots the new page), which is what lets above-the-fold
// content appear already revealed during client-side navigation.
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const REVEAL_SELECTOR = "[data-reveal], [data-stagger]";
// Surfaces that light up around the pointer (--mx / --my, see motion.css).
const SPOTLIGHT_SELECTOR = [
  "[data-spotlight]",
  ".dashboard-panel",
  ".dashboard-summary-card",
  ".dashboard-product",
  ".guard-card",
  ".account-center__plan-grid article",
].join(", ");

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reveal(item: HTMLElement, instant: boolean) {
  if (instant) item.dataset.instant = "true";
  item.dataset.visible = "true";
}

export function MotionController() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  // Scroll reveal. First load: animate as sections scroll into view. Client
  // navigation: the route transition already animates the page in, so content
  // that is on screen is shown immediately and only the rest waits for scroll.
  useBrowserLayoutEffect(() => {
    const isClientNavigation =
      previousPathname.current !== null &&
      previousPathname.current !== pathname;
    previousPathname.current = pathname;

    const items = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    ).filter((item) => item.dataset.visible !== "true");

    if (prefersReducedMotion()) {
      for (const item of items) reveal(item, true);
      return;
    }

    const instantItems: HTMLElement[] = [];
    const observed: HTMLElement[] = [];
    if (isClientNavigation) {
      const fold = window.innerHeight * 0.92;
      // Measure everything first, then mutate: a single layout pass.
      const tops = items.map((item) => item.getBoundingClientRect().top);
      items.forEach((item, index) => {
        (tops[index] < fold ? instantItems : observed).push(item);
      });
      for (const item of instantItems) reveal(item, true);
    } else {
      observed.push(...items);
    }

    // `data-instant` only suppresses the entrance; restore normal transitions
    // (hover, tilt…) once the revealed state has been painted.
    let outer = 0;
    let inner = 0;
    if (instantItems.length > 0) {
      outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          for (const item of instantItems) delete item.dataset.instant;
        });
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement, false);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );
    for (const item of observed) observer.observe(item);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname]);

  // Pointer tilt on product cards (existing behaviour).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const tiltItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt]"),
    );
    const cleanups = tiltItems.map((item) => {
      const handlePointerMove = (event: PointerEvent) => {
        const bounds = item.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        item.style.setProperty("--pointer-x", `${x * 100}%`);
        item.style.setProperty("--pointer-y", `${y * 100}%`);
        item.style.setProperty("--tilt-x", `${(0.5 - y) * 2.4}deg`);
        item.style.setProperty("--tilt-y", `${(x - 0.5) * 2.4}deg`);
      };
      const handlePointerLeave = () => {
        item.style.setProperty("--tilt-x", "0deg");
        item.style.setProperty("--tilt-y", "0deg");
      };
      item.addEventListener("pointermove", handlePointerMove);
      item.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        item.removeEventListener("pointermove", handlePointerMove);
        item.removeEventListener("pointerleave", handlePointerLeave);
      };
    });
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [pathname]);

  // One delegated listener feeds the pointer position to whichever spotlight
  // surface is under the cursor, so late-mounted dashboard cards work too.
  useEffect(() => {
    if (
      prefersReducedMotion() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    let frame = 0;
    let latest: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const event = latest;
      latest = null;
      const target = (event?.target as Element | null)?.closest?.(
        SPOTLIGHT_SELECTOR,
      ) as HTMLElement | null | undefined;
      if (!event || !target) return;
      const bounds = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
      target.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    };
    const handlePointerMove = (event: PointerEvent) => {
      latest = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
