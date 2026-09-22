"use client";

import { createContext, type ReactNode } from "react";

// Pad van dezelfde pagina in de andere taal, of null als er geen vertaling is.
// De route vult dit met pageLanguageLinks(…).alternatePath — dezelfde bron als
// de hreflang-links in de metadata. Zonder provider (bv. /cases/*): null.
export const TranslationContext = createContext<string | null>(null);

interface TranslationProviderProps {
  alternatePath: string | null;
  children: ReactNode;
}

export function TranslationProvider({
  alternatePath,
  children,
}: TranslationProviderProps) {
  return (
    <TranslationContext.Provider value={alternatePath}>
      {children}
    </TranslationContext.Provider>
  );
}
