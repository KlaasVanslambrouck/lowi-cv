import type { ReactNode } from "react";
import AnalyticsObserver from "@/components/AnalyticsObserver";
import {
  Alfa_Slab_One,
  Caveat,
  DM_Mono,
  DM_Sans,
  Fraunces,
  Karla,
} from "next/font/google";
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

// --- Redesign (schetsboek) ---------------------------------------------------
// Staan naast de drie families hierboven, niet in plaats ervan: NidusMockups
// blijft Fraunces/DM Sans/DM Mono gebruiken. De tokens in
// styles/sketchbook.module.css verwijzen naar deze variabelen.

// Alfa Slab One: display (koppen)
const alfaSlabOne = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alfa-slab-one",
  display: "swap",
});

// Karla: lopende tekst in het redesign. display "optional" om dezelfde
// LCP-reden als DM Sans hierboven.
const karla = Karla({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-karla",
  display: "optional",
});

// Caveat: alleen kantlijnnotities. Nooit LCP, dus geen preload.
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

// Ook gebruikt door app/global-not-found.tsx, dat buiten de layouts rendert.
export const FONT_CLASS_NAMES = [
  fraunces.variable,
  dmSans.variable,
  dmMono.variable,
  alfaSlabOne.variable,
  karla.variable,
  caveat.variable,
].join(" ");

interface RootDocumentProps {
  lang: Language;
  children: ReactNode;
}

export default function RootDocument({ lang, children }: RootDocumentProps) {
  return (
    <html lang={lang} className={FONT_CLASS_NAMES} suppressHydrationWarning>
      <body>
        <AnalyticsObserver />
        <LanguageProvider language={lang}>
          <XrayProvider>{children}</XrayProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
