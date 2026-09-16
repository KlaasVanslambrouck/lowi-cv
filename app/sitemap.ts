import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, absoluteUrl, type PublicRoute } from "@/lib/site";

type SitemapEntry = MetadataRoute.Sitemap[number];

// Een bron levert sitemap-entries (synchroon of asynchroon). Blogposts of
// /en-routes worden later één extra bron in SITEMAP_SOURCES.
type SitemapSource = () => SitemapEntry[] | Promise<SitemapEntry[]>;

function publicRouteToEntry(route: PublicRoute): SitemapEntry {
  return {
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

const publicRoutesSource: SitemapSource = () =>
  PUBLIC_ROUTES.map(publicRouteToEntry);

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
