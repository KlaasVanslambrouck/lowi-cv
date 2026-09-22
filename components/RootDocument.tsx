import type { ReactNode } from "react";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { XrayProvider } from "@/context/XrayContext";
import type { Language } from "@/types/content";
import "@/app/globals.css";

// Gedeelde <html>/<body> voor de twee root layouts: app/(nl)/layout.tsx en
// app/(en)/en/layout.tsx. Elke taal heeft een eigen root layout zodat
// <html lang> al in de server-HTML klopt.

// Fraunces: naam, headline en sectietitels
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// DM Sans: lopende CV-tekst. display "optional" omdat de hero-thesis het
// LCP-element is: een late font-swap zou de LCP-meting met seconden
// verschuiven. Op normale verbindingen laadt de font ruim binnen de
// block-periode en is er geen visueel verschil.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "optional",
});

// DM Mono: labels, cijfers, terminal-tekst en code-snippets
// (gewicht 300 wordt nergens gebruikt en is bewust weggelaten — scheelt preload-bytes)
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

// Ook gebruikt door app/global-not-found.tsx, dat buiten de layouts rendert.
export const FONT_CLASS_NAMES = `${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`;

interface RootDocumentProps {
  lang: Language;
  children: ReactNode;
}

export default function RootDocument({ lang, children }: RootDocumentProps) {
  return (
    <html lang={lang} className={FONT_CLASS_NAMES} suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <XrayProvider>{children}</XrayProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
