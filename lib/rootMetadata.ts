import type { Metadata, Viewport } from "next";
import { siteDescriptionFor, siteTitleFor } from "@/content/role";
import { PROFILE_OPEN_GRAPH, sharedOpenGraph } from "@/lib/pageMetadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Language } from "@/types/content";

// Gedeeld door de root layouts van app/(nl) en app/(en)/en.

// viewport-fit=cover laat de pagina onder de notch/home-indicator doorlopen,
// zodat env(safe-area-inset-*) in de CSS de fixed elementen kan vrijhouden.
export const ROOT_VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Let op: Next.js merget metadata ondiep. Een child-segment dat zelf
// openGraph, twitter, alternates of robots zet, vervangt dat hele object.
export function rootMetadata(language: Language): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    // Titel en description volgen de taal én de rolfase: content/role.ts.
    // De homepage erft deze titel; andere pagina's vullen de template.
    title: {
      default: siteTitleFor(language),
      template: "%s | Klaas Vanslambrouck",
    },
    description: siteDescriptionFor(language),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    // Geen alternates hier: canonical en hreflang staan per pagina
    // (lib/pageMetadata.ts). Deze openGraph geldt dus alleen nog voor routes
    // zonder eigen metadata (/cases/*, /beheer/*): die hebben geen vertaling,
    // vandaar geen alternateLocale.
    openGraph: {
      ...sharedOpenGraph(language, false),
      ...PROFILE_OPEN_GRAPH,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@KVanslambrouck",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        "max-image-preview": "large",
      },
    },
  };
}
