"use client";

import { useState } from "react";

type Theme = "system" | "light" | "dark";
const themes: Theme[] = ["system", "light", "dark"];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    if (next === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = next;
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={cycleTheme}
      type="button"
      aria-label={`Theme: ${theme}. Change theme`}
    >
      <span aria-hidden="true" className="theme-toggle__icon" />
      <span className="theme-toggle__label">{theme}</span>
    </button>
  );
}
