import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Interne routes: beheer-login + dashboard en de API-route handlers.
// /cases/* staat hier bewust niet: die pagina's hebben noindex, en een
// crawler moet ze kunnen ophalen om die noindex te kunnen lezen.
const DISALLOWED_PATHS = ["/beheer", "/api/"];

// Zoekmachines en AI-crawlers die expliciet toegelaten worden.
const EXPLICITLY_ALLOWED_BOTS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
      // Een crawler volgt enkel de meest specifieke groep die op hem past en
      // negeert dan "*". Daarom herhaalt elke groep de disallow-regels.
      ...EXPLICITLY_ALLOWED_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
