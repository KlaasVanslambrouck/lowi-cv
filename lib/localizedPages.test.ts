import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { lowiCelMeta } from "@/content/lowiCellContent";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { siteDescriptionFor } from "@/content/role";
import { LOCALIZED_PAGES } from "@/lib/localizedPages";
import { HREFLANG } from "@/lib/pageMetadata";
import {
  PUBLIC_ROUTES,
  absoluteUrl,
  localizedPath,
  otherLanguage,
  pageLanguageLinks,
} from "@/lib/site";
import type { Language } from "@/types/content";

function hreflangLinks(metadata: Metadata): Record<string, string> {
  return (metadata.alternates?.languages ?? {}) as Record<string, string>;
}

const LANGUAGES = ["nl", "en"] as const;

describe("de tweetalige pagina's en de sitemap beschrijven dezelfde routes", () => {
  it("LOCALIZED_PAGES komt overeen met PUBLIC_ROUTES.localized", () => {
    const fromSitemap = PUBLIC_ROUTES.filter((route) => route.localized).map(
      (route) => route.path,
    );
    const fromPages = LOCALIZED_PAGES.map((page) => page.basePath);
    expect([...fromPages].sort()).toEqual([...fromSitemap].sort());
  });
});

describe.each(LOCALIZED_PAGES)("metadata van $basePath", ({ basePath, metadata }) => {
  it.each(LANGUAGES)("%s: canonical wijst naar zichzelf", (language) => {
    expect(metadata(language).alternates?.canonical).toBe(
      absoluteUrl(localizedPath(basePath, language)),
    );
  });

  it.each(LANGUAGES)("%s: hreflang nl-BE, en en x-default", (language) => {
    expect(hreflangLinks(metadata(language))).toEqual({
      "nl-BE": absoluteUrl(localizedPath(basePath, "nl")),
      en: absoluteUrl(localizedPath(basePath, "en")),
      "x-default": absoluteUrl(localizedPath(basePath, "nl")),
    });
  });

  it("hreflang is wederkerig", () => {
    expect(hreflangLinks(metadata("nl")).en).toBe(
      metadata("en").alternates?.canonical,
    );
    expect(hreflangLinks(metadata("en"))["nl-BE"]).toBe(
      metadata("nl").alternates?.canonical,
    );
  });

  it.each(LANGUAGES)("%s: og:locale en og:url volgen de taal", (language) => {
    const openGraph = metadata(language).openGraph;
    expect(openGraph?.locale).toBe(language === "nl" ? "nl_BE" : "en_GB");
    expect(openGraph?.alternateLocale).toEqual([
      language === "nl" ? "en_GB" : "nl_BE",
    ]);
    expect(openGraph?.url).toBe(absoluteUrl(localizedPath(basePath, language)));
  });

  it.each(LANGUAGES)(
    "%s: de taalknop wijst naar de hreflang-URL van de andere taal",
    (language) => {
      const { alternatePath } = pageLanguageLinks({ basePath, language });
      expect(absoluteUrl(alternatePath ?? "")).toBe(
        hreflangLinks(metadata(language))[HREFLANG[otherLanguage(language)]],
      );
    },
  );
});

describe("teksten per taal", () => {
  it.each(LANGUAGES)("%s: de homepage gebruikt de description van die taal", (language) => {
    const [home] = LOCALIZED_PAGES;
    expect(home.metadata(language).description).toBe(siteDescriptionFor(language));
  });

  it.each(LANGUAGES)("%s: /nidus en /lowi gebruiken hun eigen copy", (language) => {
    const [, nidus, lowi] = LOCALIZED_PAGES;
    expect(nidus.metadata(language).title).toBe(nidusCaseStudy.meta.title[language]);
    expect(nidus.metadata(language).description).toBe(
      nidusCaseStudy.meta.description[language],
    );
    expect(lowi.metadata(language).title).toBe(lowiCelMeta.title[language]);
    expect(lowi.metadata(language).description).toBe(
      lowiCelMeta.description[language],
    );
  });

  it("de Nederlandse en Engelse description verschillen", () => {
    for (const page of LOCALIZED_PAGES) {
      expect(page.metadata("nl").description).not.toBe(
        page.metadata("en").description,
      );
    }
  });
});

// De og:image-route hoort bij het routesegment, dus /en erft de NL-afbeelding
// niet: elke taalversie heeft een eigen opengraph-image.tsx.
describe("Open Graph-afbeelding per taalversie", () => {
  const OG_FILES: readonly { path: string; language: Language }[] = [
    { path: "app/(nl)/opengraph-image.tsx", language: "nl" },
    { path: "app/(nl)/nidus/opengraph-image.tsx", language: "nl" },
    { path: "app/(nl)/lowi/opengraph-image.tsx", language: "nl" },
    { path: "app/(en)/en/opengraph-image.tsx", language: "en" },
    { path: "app/(en)/en/nidus/opengraph-image.tsx", language: "en" },
    { path: "app/(en)/en/lowi/opengraph-image.tsx", language: "en" },
  ];

  it.each(OG_FILES)("$path bestaat en bouwt de $language-variant", ({ path, language }) => {
    const file = join(process.cwd(), path);
    expect(existsSync(file)).toBe(true);
    const source = readFileSync(file, "utf8");
    expect(source).toContain(`("${language}")`);
    expect(source).not.toContain(`("${otherLanguage(language)}")`);
  });
});
