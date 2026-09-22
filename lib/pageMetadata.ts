import type { Metadata } from "next";
import {
  SITE_NAME,
  absoluteUrl,
  otherLanguage,
  pageLanguageLinks,
  type PageLocation,
} from "@/lib/site";
import type { Language } from "@/types/content";

// Metadata per pagina en per taal: canonical, hreflang en Open Graph komen
// uit één helper, zodat geen pagina ze apart (en inconsistent) invult.

// hreflang-code per taal. x-default wijst naar de NL-versie.
export const HREFLANG: Record<Language, string> = {
  nl: "nl-BE",
  en: "en",
};

const OPEN_GRAPH_LOCALE: Record<Language, string> = {
  nl: "nl_BE",
  en: "en_GB",
};

// Open Graph-velden die elke pagina deelt. Next.js merget metadata ondiep:
// een pagina die openGraph zet, vervangt het hele object uit de layout.
// alternateLocale alleen als er een vertaling bestaat.
export function sharedOpenGraph(language: Language, hasTranslation = true) {
  return {
    siteName: SITE_NAME,
    locale: OPEN_GRAPH_LOCALE[language],
    ...(hasTranslation
      ? { alternateLocale: [OPEN_GRAPH_LOCALE[otherLanguage(language)]] }
      : {}),
  } satisfies NonNullable<Metadata["openGraph"]>;
}

// og:type "profile" beschrijft de persoon zelf (homepage en root layout).
export const PROFILE_OPEN_GRAPH = {
  type: "profile",
  firstName: "Klaas",
  lastName: "Vanslambrouck",
} as const;

export interface PageMetadataInput extends PageLocation {
  /** Weggelaten: de titel van de root layout. Anders via de titeltemplate. */
  title?: string;
  /** Weggelaten: de description van de root layout. */
  description?: string;
  ogType: "article" | "profile";
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  const links = pageLanguageLinks(input);
  const canonical = absoluteUrl(links.canonicalPath);

  const languages: Record<string, string> = {};
  for (const language of ["nl", "en"] as const) {
    const path = links.paths[language];
    if (path !== undefined) languages[HREFLANG[language]] = absoluteUrl(path);
  }
  if (links.paths.nl !== undefined) {
    languages["x-default"] = absoluteUrl(links.paths.nl);
  }

  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      ...sharedOpenGraph(input.language, links.alternatePath !== null),
      ...(input.ogType === "profile" ? PROFILE_OPEN_GRAPH : { type: "article" }),
      url: canonical,
    },
  };
}
