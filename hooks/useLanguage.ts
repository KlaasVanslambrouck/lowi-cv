"use client";

import { useCallback, useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import type { Bilingual } from "@/types/content";

// Centrale hook voor alle componenten: de taal van de huidige route en een
// t()-helper die de juiste variant uit een Bilingual-veld kiest.
export function useLanguage() {
  const language = useContext(LanguageContext);

  const t = useCallback((text: Bilingual) => text[language], [language]);

  return { language, t };
}
