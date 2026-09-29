"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { THEME_KEY } from "@/lib/constants";
import { ThemeContext, type Theme } from "@/lib/theme-context";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // The inline script in app/layout.tsx has already set the class before hydration.
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage can be unavailable (private mode); the theme still applies for this visit */
    }
    setTheme(next);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
