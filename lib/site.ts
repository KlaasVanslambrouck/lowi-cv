import type { Metadata, MetadataRoute } from "next";
import type { Language } from "@/types/content";

// Canonieke basis-URL van de publieke site. Bron is NEXT_PUBLIC_SITE_URL;
// NEXT_PUBLIC_-waarden worden tijdens de build ingelijnd, dus een wijziging
// vraagt een nieuwe build. Zonder waarde valt de site terug op Vercel.
const FALLBACK_SITE_URL = "https://lowiklaasvanslambrouck.vercel.app";

type SitemapEntry = MetadataRoute.Sitemap[number];

export type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

// ISO 8601-datum (YYYY-MM-DD), bv. "2026-09-16".
export type IsoDate = `${number}-${number}-${number}`;

export interface PublicRoute {
  path: `/${string}`;
  changeFrequency: ChangeFrequency;
  /** Relatief gewicht tussen 0 en 1. */
  priority: number;
  /** Handmatig bijgehouden; later automatiseerbaar (bv. uit de git-historiek). */
  lastModified: IsoDate;
}

function normalizeSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return FALLBACK_SITE_URL;

  // Protocol is optioneel in de env var: "example.com" → "https://example.com".
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    // Bewust hard falen: een foute canonieke URL mag niet stil in de build belanden.
    throw new Error(`NEXT_PUBLIC_SITE_URL is geen geldige URL: "${trimmed}"`);
  }

  // Query en hash horen niet in een basis-URL; trailing slashes weg.
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "Klaas Vanslambrouck";

// IndexNow-sleutel (32 tekens, [a-f0-9]). Moet identiek zijn aan de
// bestandsnaam én de inhoud van public/<sleutel>.txt: zoekmachines halen dat
// bestand op om te controleren dat een ping van de eigenaar van het domein komt.
// Niet geheim: het bewijst alleen controle over het domein en staat hoe dan ook
// publiek op de site.
export const INDEXNOW_KEY = "167e8c9f936b77cbb623005b267df08e";

// Laatste inhoudelijke wijziging aan de CV-gegevens; gedeeld door /cv.json
// (meta.lastModified) en de sitemap. Handmatig bijhouden.
export const CV_LAST_MODIFIED: IsoDate = "2026-09-22";

// Open Graph-velden die elke pagina deelt. Next.js merget metadata ondiep:
// een pagina die openGraph zet, vervangt het hele object uit de layout.
// Spread dit object daarom in elke openGraph-definitie.
export const SHARED_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: "nl_BE",
  alternateLocale: ["en_GB"],
} satisfies NonNullable<Metadata["openGraph"]>;

// Maakt van een pad een absolute URL op SITE_URL: "/nidus" → "https://…/nidus".
export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

// URL-prefix per taal: Nederlands staat op "/", Engels onder "/en".
const LANGUAGE_PREFIX: Record<Language, string> = {
  nl: "",
  en: "/en",
};

// Zet een Nederlands (ongeprefixt) intern pad om naar de gevraagde taal:
// "/" → "/en", "/#projects" → "/en#projects", "/nidus#x" → "/en/nidus#x".
// Verwacht altijd het NL-pad; een pad dat al met "/en" begint is een fout.
export function localizedPath(path: string, language: Language): string {
  if (!path.startsWith("/")) {
    throw new Error(`localizedPath verwacht een intern pad, kreeg "${path}"`);
  }
  if (/^\/en(?:[/#?]|$)/.test(path)) {
    throw new Error(`localizedPath verwacht het NL-pad, kreeg "${path}"`);
  }

  const prefix = LANGUAGE_PREFIX[language];
  if (prefix === "") return path;

  // Bij de homepage valt de losse "/" weg: "/en", niet "/en/".
  const rest = path.slice(1);
  const isHomePath = rest === "" || rest.startsWith("#") || rest.startsWith("?");
  return isHomePath ? `${prefix}${rest}` : `${prefix}${path}`;
}

// Publieke, indexeerbare routes. /cases/* staat bewust niet in deze lijst
// (noindex); /beheer en /api zijn intern.
export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  {
    path: "/",
    changeFrequency: "monthly",
    priority: 1,
    lastModified: "2026-09-07",
  },
  {
    path: "/nidus",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: "2026-07-13",
  },
  {
    path: "/lowi",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: "2026-09-16",
  },
  {
    // PDF op het eigen domein (rewrite naar nidus-api in next.config.ts).
    // lastModified handmatig: het bestand wordt bij elke aanvraag gegenereerd.
    path: "/cv.pdf",
    changeFrequency: "yearly",
    priority: 0.5,
    lastModified: CV_LAST_MODIFIED,
  },
  {
    // Machineleesbaar CV (JSON Resume) voor agents.
    path: "/cv.json",
    changeFrequency: "yearly",
    priority: 0.5,
    lastModified: CV_LAST_MODIFIED,
  },
];
