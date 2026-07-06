"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "nl" | "en";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: "nl",
  toggleLanguage: () => {},
});

// localStorage-sleutel voor de taalvoorkeur van de bezoeker
const STORAGE_KEY = "cv-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default Nederlands; de echte voorkeur wordt pas na mount bepaald
  // (localStorage en navigator bestaan niet tijdens server-side rendering).
  const [language, setLanguage] = useState<Language>("nl");

  useEffect(() => {
    // Eerder opgeslagen voorkeur wint; anders browsertaal:
    // begint met "nl" → Nederlands, anders Engels (fallback Nederlands).
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "nl" || stored === "en") {
      setLanguage(stored);
      return;
    }
    const browserLanguage = navigator.language?.toLowerCase() ?? "nl";
    setLanguage(browserLanguage.startsWith("nl") ? "nl" : "en");
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((previous) => {
      const next: Language = previous === "nl" ? "en" : "nl";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {/* lang-attribuut wisselt mee zodat screenreaders de juiste taal gebruiken */}
      <div lang={language}>{children}</div>
    </LanguageContext.Provider>
  );
}
