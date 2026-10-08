"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { flushSync } from "react-dom";

type Theme = "system" | "light" | "dark";
const themes: Theme[] = ["system", "light", "dark"];
const STORAGE_KEY = "algorithco-theme";

function applyTheme(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.dataset.theme = theme;
  }
  document.documentElement.style.colorScheme =
    theme === "system" ? "light dark" : theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Theme switching still works when storage is unavailable.
    }
    const initialTheme = themes.includes(saved as Theme)
      ? (saved as Theme)
      : "system";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const cycleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    const commit = () => {
      setTheme(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Keep the selected theme for the current page session.
      }
      applyTheme(next);
    };

    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (typeof document.startViewTransition !== "function" || reduceMotion) {
      commit();
      return;
    }

    // Circular reveal growing from the toggle. The old theme stays on screen
    // until the new one has been painted inside the expanding circle.
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    root.classList.add("theme-vt");
    const transition = document.startViewTransition(() => {
      flushSync(commit);
    });
    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 700,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => undefined);
    transition.finished
      .catch(() => undefined)
      .finally(() => root.classList.remove("theme-vt"));
  };

  return (
    <button
      className="theme-toggle"
      onClick={cycleTheme}
      type="button"
      aria-label={`Theme: ${theme}. Change theme`}
      title={`Theme: ${theme}. Click to switch.`}
    >
      <span aria-hidden="true" className="theme-toggle__icon" />
      <span className="theme-toggle__label">{theme}</span>
    </button>
  );
}
