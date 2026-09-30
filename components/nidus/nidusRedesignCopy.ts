import type { Bilingual } from "@/types/content";

// TODO concept-copy: alle nieuwe tekst van de herwerkte /nidus-pagina
// (docs/redesign/artboards/Main.dc.html §4 en Nidus.dc.html). Nog te
// beoordelen; de gevalideerde copy blijft in content/nidusCaseStudy.ts.
export const nidusRedesignCopy = {
  pageNav: { nl: "Op deze pagina", en: "On this page" },
  interface: { nl: "Interface", en: "Interface" },
  decisions: { nl: "Beslissingen", en: "Decisions" },
  comingSoon: { nl: "Binnenkort", en: "Coming soon" },
  introNote: {
    nl: "eerst de keuzes, dan de schermen",
    en: "the choices first, then the screens",
  },
  embedNote: {
    nl: "de echte interface, met verzonnen data",
    en: "the real interface, with made-up data",
  },
  architectureLegend: {
    nl: "Getekende pijlen tonen alleen verbindingen die in de bestaande tekst bevestigd zijn.",
    en: "Drawn arrows only show connections confirmed in the existing copy.",
  },
  onlyViaApi: { nl: "uitsluitend via nidus-api", en: "exclusively via nidus-api" },
  onlyWriteAccess: { nl: "enige schrijftoegang", en: "only write access" },
} satisfies Record<string, Bilingual>;

// Laagnamen zijn taalonafhankelijke systeemtermen (volgorde = NidusArchitecture).
export const NIDUS_LAYER_EYEBROW: Bilingual = {
  nl: "client / api / data / edge / ai",
  en: "client / api / data / edge / ai",
};

// Markeringen: letterlijke passages uit de bestaande copy. Staat een passage
// niet (meer) in de tekst, dan blijft die tekst gewoon ongemarkeerd.
export const NIDUS_HIGHLIGHTS = {
  introSubtitle: { nl: "Het zenuwcentrum", en: "The nerve centre" },
  principle: {
    nl: "nidus-mobile roept nooit rechtstreeks Supabase aan",
    en: "nidus-mobile never calls Supabase directly",
  },
  decisions: [
    {
      nl: "toegeven dat het met de beschikbare data niet preciezer kan",
      en: "admitting the available data won't support more precision",
    },
    {
      nl: "een gevalideerde formulevorm met één gekalibreerde parameter is betrouwbaarder dan een volledig zelf teruggerekend model",
      en: "a validated formula shape with one calibrated parameter beats a fully self-derived model",
    },
    {
      nl: "minder herbruikbaar, maar robuust voor exact dit probleem",
      en: "less reusable, but robust for exactly this problem",
    },
    {
      nl: "de data hoort logisch bij die ene sessie en wordt nooit los bevraagd",
      en: "the data logically belongs to that one session and is never queried on its own",
    },
    {
      nl: "Dezelfde technologie, een bewust andere architectuurkeuze voor een andere context.",
      en: "Same technology, a deliberately different architecture for a different context.",
    },
  ],
} satisfies Record<string, Bilingual | Bilingual[]>;

// TODO concept-copy: doorhalingen bij een echt verworpen keuze, op de NL-titel
// van de beslissing (Main.dc.html §4: "Recharts → custom SVG", "database → browser").
export const NIDUS_DECISION_STRIKES: Record<string, { from: string; to: string }> = {
  "Custom SVG in plaats van een chart-library forceren": {
    from: "Recharts",
    to: "custom SVG",
  },
  "Gespreksgeheugen in de browser, niet de database": {
    from: "database",
    to: "browser",
  },
};
