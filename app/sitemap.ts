import type { MetadataRoute } from "next";
import { hreflangAlternates } from "@/lib/pageMetadata";
import {
  PUBLIC_ROUTES,
  absoluteUrl,
  localizedPath,
  type PublicRoute,
} from "@/lib/site";
import type { Language } from "@/types/content";

type SitemapEntry = MetadataRoute.Sitemap[number];

// Een bron levert sitemap-entries (synchroon of asynchroon). Blogposts worden
// later één extra bron in SITEMAP_SOURCES.
type SitemapSource = () => SitemapEntry[] | Promise<SitemapEntry[]>;

// Eén entry per taalversie. lastModified, changeFrequency en priority komen uit
// de route en zijn dus gelijk voor NL en EN: het is dezelfde pagina, even vaak
// gewijzigd en even belangrijk. De hreflang-links komen uit dezelfde helper als
// de <head> (lib/pageMetadata.ts), zodat ze niet uit elkaar kunnen lopen.
function localizedEntry(route: PublicRoute, language: Language): SitemapEntry {
  return {
    url: absoluteUrl(localizedPath(route.path, language)),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: hreflangAlternates({ basePath: route.path, language }),
    },
  };
}

// Machinebestanden (/cv.pdf, /cv.json) bestaan in één versie: geen alternates.
function singleEntry(route: PublicRoute): SitemapEntry {
  return {
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

function publicRouteToEntries(route: PublicRoute): SitemapEntry[] {
  if (!route.localized) return [singleEntry(route)];
  return [localizedEntry(route, "nl"), localizedEntry(route, "en")];
}

const publicRoutesSource: SitemapSource = () =>
  PUBLIC_ROUTES.flatMap(publicRouteToEntries);

const SITEMAP_SOURCES: readonly SitemapSource[] = [publicRoutesSource];

// Voegt alle bronnen samen; bij een dubbele URL wint de eerste bron.
function mergeEntries(entryLists: SitemapEntry[][]): MetadataRoute.Sitemap {
  const seenUrls = new Set<string>();
  return entryLists.flat().filter((entry) => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entryLists = await Promise.all(
    SITEMAP_SOURCES.map((source) => source()),
  );
  return mergeEntries(entryLists);
}
