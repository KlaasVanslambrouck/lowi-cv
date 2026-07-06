"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

const STORAGE_KEY = "cv-theme";

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

function readPreferredTheme(): Theme {
  if (!window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyDocumentTheme(theme: Theme) {
  document.documentElement.dataset.cvTheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const resolvedTheme = readStoredTheme() ?? readPreferredTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bewust: voorkeur kan pas na mount gelezen worden (SSR heeft geen localStorage/matchMedia)
    setTheme(resolvedTheme);
    applyDocumentTheme(resolvedTheme);

    return () => {
      delete document.documentElement.dataset.cvTheme;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((previous) => {
      const next: Theme = previous === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage kan geblokkeerd zijn; de runtime theme-state blijft werken.
      }
      applyDocumentTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
