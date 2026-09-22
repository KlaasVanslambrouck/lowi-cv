import type { MetadataRoute } from "next";

// Pure bouwstenen voor scripts/indexnow.ts: geen netwerk, geen process.env,
// zodat ze los te testen zijn.

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

// Weigert elke basis-URL die niet de productiesite is: een ping voor een
// preview- of http-URL is zinloos en kan de sleutel aan het verkeerde domein koppelen.
export function assertProductionSiteUrl(siteUrl: string): URL {
  if (!siteUrl.startsWith("https://")) {
    throw new Error(
      `SITE_URL moet met https:// beginnen, maar is "${siteUrl}". Staat NEXT_PUBLIC_SITE_URL in .env.local?`,
    );
  }
  if (siteUrl.includes("vercel.app")) {
    throw new Error(
      `SITE_URL wijst nog naar Vercel ("${siteUrl}"). Zet NEXT_PUBLIC_SITE_URL=https://klaasvanslambrouck.dev in .env.local.`,
    );
  }
  return new URL(siteUrl);
}

// Dezelfde URL's als /sitemap.xml, in volgorde en zonder dubbels.
export function urlsFromSitemap(entries: MetadataRoute.Sitemap): string[] {
  return [...new Set(entries.map((entry) => entry.url))];
}

export function buildIndexNowPayload(
  siteUrl: string,
  key: string,
  urlList: readonly string[],
): IndexNowPayload {
  const site = assertProductionSiteUrl(siteUrl);

  // IndexNow weigert met 422 als een URL niet bij host hoort; liever vooraf falen.
  const foreignUrls = urlList.filter((url) => new URL(url).host !== site.host);
  if (foreignUrls.length > 0) {
    throw new Error(
      `URL's horen niet bij ${site.host}: ${foreignUrls.join(", ")}`,
    );
  }

  return {
    host: site.host,
    key,
    keyLocation: `${site.origin}/${key}.txt`,
    urlList: [...urlList],
  };
}

const STATUS_DESCRIPTIONS: Readonly<Record<number, string>> = {
  200: "ontvangen",
  202: "ontvangen (sleutelvalidatie loopt nog)",
  400: "ongeldige aanvraag",
  403: "sleutel ongeldig of niet gevonden",
  422: "URL hoort niet bij host",
  429: "te veel aanvragen",
};

export function describeIndexNowStatus(status: number): string {
  return STATUS_DESCRIPTIONS[status] ?? "onverwachte status";
}
