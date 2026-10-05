"use client";

import { useEffect, useState } from "react";

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

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep the selected theme for the current page session.
    }
    applyTheme(next);
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
