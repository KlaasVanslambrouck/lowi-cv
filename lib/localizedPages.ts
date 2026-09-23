import type { Metadata } from "next";
import { lowiCelMeta } from "@/content/lowiCellContent";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { siteDescriptionFor } from "@/content/role";
import { pageMetadata } from "@/lib/pageMetadata";
import type { PageLocation } from "@/lib/site";
import type { Language, PageMetaCopy } from "@/types/content";

// Definitie van elke pagina die in twee talen bestaat: waar ze staat en welke
// metadata ze krijgt. Los van de route-componenten (geen JSX, geen CSS), zodat
// de tests dit kunnen importeren en de paginabestanden, de route-componenten
// en de tests dezelfde bron gebruiken.

export function homePage(language: Language): PageLocation {
  return { basePath: "/", language };
}

export function nidusPage(language: Language): PageLocation {
  return { basePath: "/nidus", language };
}

export function lowiPage(language: Language): PageLocation {
  return { basePath: "/lowi", language };
}

// De titel komt van de root layout (siteTitleFor), zodat de titeltemplate
// "%s | Klaas Vanslambrouck" hem niet nog eens aanvult.
export function homeMetadata(language: Language): Metadata {
  return pageMetadata({
    ...homePage(language),
    description: siteDescriptionFor(language),
    ogType: "profile",
  });
}

function caseStudyMetadata(page: PageLocation, copy: PageMetaCopy): Metadata {
  return pageMetadata({
    ...page,
    // Titel zonder naam: de template uit de root layout vult die aan.
    title: copy.title[page.language],
    description: copy.description[page.language],
    ogType: "article",
  });
}

export function nidusMetadata(language: Language): Metadata {
  return caseStudyMetadata(nidusPage(language), nidusCaseStudy.meta);
}

export function lowiMetadata(language: Language): Metadata {
  return caseStudyMetadata(lowiPage(language), lowiCelMeta);
}

// Alle tweetalige pagina's, voor de tests. PUBLIC_ROUTES (sitemap) en deze
// lijst moeten dezelfde paden bevatten; lib/localizedPages.test.ts bewaakt dat.
export const LOCALIZED_PAGES = [
  { basePath: "/", metadata: homeMetadata },
  { basePath: "/nidus", metadata: nidusMetadata },
  { basePath: "/lowi", metadata: lowiMetadata },
] as const satisfies readonly {
  basePath: `/${string}`;
  metadata: (language: Language) => Metadata;
}[];
