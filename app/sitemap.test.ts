import type { MetadataRoute } from "next";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { LOCALIZED_PAGES } from "@/lib/localizedPages";
import { hreflangAlternates } from "@/lib/pageMetadata";
import { PUBLIC_ROUTES, absoluteUrl, localizedPath } from "@/lib/site";

type SitemapEntry = MetadataRoute.Sitemap[number];

function alternatesOf(entry: SitemapEntry): Record<string, string> {
  return (entry.alternates?.languages ?? {}) as Record<string, string>;
}

const LOCALIZED_ROUTES = PUBLIC_ROUTES.filter((route) => route.localized);
const SINGLE_ROUTES = PUBLIC_ROUTES.filter((route) => !route.localized);

describe("sitemap", () => {
  it("bevat elke vertaalde route twee keer en elk machinebestand één keer", async () => {
    const entries = await sitemap();

    expect(entries).toHaveLength(
      LOCALIZED_ROUTES.length * 2 + SINGLE_ROUTES.length,
    );
    expect(entries.map((entry) => entry.url)).toEqual([
      ...LOCALIZED_ROUTES.flatMap((route) => [
        absoluteUrl(localizedPath(route.path, "nl")),
        absoluteUrl(localizedPath(route.path, "en")),
      ]),
      ...SINGLE_ROUTES.map((route) => absoluteUrl(route.path)),
    ]);
  });

  it("geeft beide taalversies dezelfde lastModified, priority en changeFrequency", async () => {
    const entries = await sitemap();

    for (const route of LOCALIZED_ROUTES) {
      const [nl, en] = entries.filter((entry) =>
        [
          absoluteUrl(localizedPath(route.path, "nl")),
          absoluteUrl(localizedPath(route.path, "en")),
        ].includes(entry.url),
      );
      expect(nl.lastModified).toBe(route.lastModified);
      expect(en.lastModified).toBe(route.lastModified);
      expect(en.priority).toBe(nl.priority);
      expect(en.changeFrequency).toBe(nl.changeFrequency);
    }
  });

  it("geeft elke taalversie wederkerige alternates, gelijk aan de hreflang", async () => {
    const entries = await sitemap();

    for (const route of LOCALIZED_ROUTES) {
      for (const language of ["nl", "en"] as const) {
        const url = absoluteUrl(localizedPath(route.path, language));
        const entry = entries.find((candidate) => candidate.url === url);
        expect(entry, url).toBeDefined();
        expect(alternatesOf(entry as SitemapEntry)).toEqual(
          hreflangAlternates({ basePath: route.path, language }),
        );
        // Wederkerig: de alternates noemen beide versies.
        expect(Object.values(alternatesOf(entry as SitemapEntry))).toContain(url);
      }
    }
  });

  it("geeft machinebestanden geen alternates", async () => {
    const entries = await sitemap();

    for (const route of SINGLE_ROUTES) {
      const entry = entries.find(
        (candidate) => candidate.url === absoluteUrl(route.path),
      );
      expect(entry?.alternates).toBeUndefined();
    }
  });

  it("gebruikt exact de canonicals van de pagina's zelf", async () => {
    const entries = await sitemap();
    const urls = new Set(entries.map((entry) => entry.url));

    for (const page of LOCALIZED_PAGES) {
      for (const language of ["nl", "en"] as const) {
        expect(urls).toContain(page.metadata(language).alternates?.canonical);
      }
    }
  });

  it("bevat geen URL met een trailing slash", async () => {
    for (const entry of await sitemap()) {
      expect(entry.url.endsWith("/"), entry.url).toBe(false);
      for (const alternate of Object.values(alternatesOf(entry))) {
        expect(alternate.endsWith("/"), alternate).toBe(false);
      }
    }
  });
});
