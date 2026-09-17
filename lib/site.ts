import type { Metadata, MetadataRoute } from "next";

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
];
