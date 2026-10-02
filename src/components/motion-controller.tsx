"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (reducedMotion) {
      for (const item of revealItems) item.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    for (const item of revealItems) observer.observe(item);

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
      observer.disconnect();
      for (const cleanup of cleanups) cleanup();
    };
  }, [pathname]);

  return null;
}
