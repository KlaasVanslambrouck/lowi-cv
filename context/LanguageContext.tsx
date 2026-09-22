"use client";

import { createContext, type ReactNode } from "react";
import type { Language } from "@/types/content";

// Doorgegeven zodat bestaande imports van Language uit deze module blijven werken.
export type { Language };

// De taal komt uit de route: RootDocument krijgt hem van de root layout
// ("/" → nl, "/en/…" → en) en geeft hem hier door. Geen client-state, geen
// localStorage en geen browsertaal: server en client renderen dezelfde taal,
// en een bot ziet op elke URL wat een bezoeker ziet.
export const LanguageContext = createContext<Language>("nl");

interface LanguageProviderProps {
  language: Language;
  children: ReactNode;
}

export function LanguageProvider({ language, children }: LanguageProviderProps) {
  return (
    <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
  );
}
