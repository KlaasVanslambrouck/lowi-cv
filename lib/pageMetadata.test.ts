import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { HREFLANG, pageMetadata } from "@/lib/pageMetadata";
import {
  PUBLIC_ROUTES,
  absoluteUrl,
  localizedPath,
  otherLanguage,
  pageLanguageLinks,
} from "@/lib/site";

// Next typeert alternates.languages breed (ook URL-objecten en descriptors);
// pageMetadata zet er altijd absolute strings in.
function hreflangLinks(metadata: Metadata): Record<string, string> {
  return (metadata.alternates?.languages ?? {}) as Record<string, string>;
}

const LANGUAGES = ["nl", "en"] as const;
const LOCALIZED_PATHS = PUBLIC_ROUTES.filter((route) => route.localized).map(
  (route) => route.path,
);

describe("pageMetadata voor elke vertaalde pagina", () => {
  for (const basePath of LOCALIZED_PATHS) {
    for (const language of LANGUAGES) {
      const metadata = pageMetadata({ basePath, language, ogType: "article" });
      const ownUrl = absoluteUrl(localizedPath(basePath, language));
      const links = hreflangLinks(metadata);

      it(`${language} ${basePath}: canonical wijst naar zichzelf`, () => {
        expect(metadata.alternates?.canonical).toBe(ownUrl);
      });

      it(`${language} ${basePath}: hreflang nl-BE, en en x-default, absoluut`, () => {
        expect(links).toEqual({
          "nl-BE": absoluteUrl(localizedPath(basePath, "nl")),
          en: absoluteUrl(localizedPath(basePath, "en")),
          "x-default": absoluteUrl(localizedPath(basePath, "nl")),
        });
      });

      it(`${language} ${basePath}: og:locale, alternateLocale en og:url`, () => {
        expect(metadata.openGraph?.locale).toBe(language === "nl" ? "nl_BE" : "en_GB");
        expect(metadata.openGraph?.alternateLocale).toEqual([
          language === "nl" ? "en_GB" : "nl_BE",
        ]);
        expect(metadata.openGraph?.url).toBe(ownUrl);
      });

      it(`${language} ${basePath}: de taalknop wijst naar de hreflang-URL van de andere taal`, () => {
        const { alternatePath } = pageLanguageLinks({ basePath, language });
        expect(alternatePath).not.toBeNull();
        expect(absoluteUrl(alternatePath ?? "")).toBe(
          links[HREFLANG[otherLanguage(language)]],
        );
      });
    }

    it(`${basePath}: hreflang is wederkerig`, () => {
      const nl = pageMetadata({ basePath, language: "nl", ogType: "article" });
      const en = pageMetadata({ basePath, language: "en", ogType: "article" });
      expect(hreflangLinks(nl).en).toBe(en.alternates?.canonical);
      expect(hreflangLinks(en)["nl-BE"]).toBe(nl.alternates?.canonical);
    });
  }
});

describe("pageMetadata met een afwijkende of ontbrekende vertaling", () => {
  it("alternateUrl null: geen hreflang en geen alternateLocale voor de andere taal", () => {
    const metadata = pageMetadata({
      basePath: "/blog/alleen-nl",
      language: "nl",
      alternateUrl: null,
      ogType: "article",
    });
    expect(hreflangLinks(metadata)).toEqual({
      "nl-BE": absoluteUrl("/blog/alleen-nl"),
      "x-default": absoluteUrl("/blog/alleen-nl"),
    });
    expect(metadata.openGraph?.alternateLocale).toBeUndefined();
    expect(
      pageLanguageLinks({ basePath: "/blog/alleen-nl", language: "nl", alternateUrl: null })
        .alternatePath,
    ).toBeNull();
  });

  it("alternateUrl met eigen slug: hreflang en taalknop gebruiken die slug", () => {
    const page = {
      basePath: "/blog/mijn-post",
      language: "en",
      alternateUrl: "/blog/mijn-post-nl",
    } as const;
    const metadata = pageMetadata({ ...page, ogType: "article" });
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/en/blog/mijn-post"));
    expect(hreflangLinks(metadata)).toEqual({
      "nl-BE": absoluteUrl("/blog/mijn-post-nl"),
      en: absoluteUrl("/en/blog/mijn-post"),
      "x-default": absoluteUrl("/blog/mijn-post-nl"),
    });
    expect(pageLanguageLinks(page).alternatePath).toBe("/blog/mijn-post-nl");
  });

  it("weigert een externe alternateUrl", () => {
    expect(() =>
      pageLanguageLinks({
        basePath: "/nidus",
        language: "nl",
        alternateUrl: "https://example.com/en/nidus",
      }),
    ).toThrow();
  });
});

describe("pageMetadata og:type", () => {
  it("profile zet voornaam en achternaam", () => {
    const metadata = pageMetadata({ basePath: "/", language: "en", ogType: "profile" });
    expect(metadata.openGraph).toMatchObject({
      type: "profile",
      firstName: "Klaas",
      lastName: "Vanslambrouck",
    });
  });
});
