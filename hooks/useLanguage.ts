"use client";

import { useCallback, useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import type { Bilingual } from "@/types/content";

// Centrale hook voor alle componenten: huidige taal, toggle en een
// t()-helper die de juiste variant uit een Bilingual-veld kiest.
export function useLanguage() {
  const { language, toggleLanguage } = useContext(LanguageContext);

  const t = useCallback((text: Bilingual) => text[language], [language]);

  return { language, toggleLanguage, t };
}
