import type { Metadata, Viewport } from "next";
import { siteDescription, siteTitle } from "@/content/role";
import { SHARED_OPEN_GRAPH, SITE_NAME, SITE_URL } from "@/lib/site";

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
export const ROOT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Titel (Engels) en description (Nederlands) volgen de rolfase: content/role.ts.
  title: {
    default: siteTitle,
    template: "%s | Klaas Vanslambrouck",
  },
  description: siteDescription,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  // Geen alternates.canonical hier: die zou elke route zonder eigen canonical
  // naar de homepage laten wijzen. Canonicals staan per pagina.
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    type: "profile",
    firstName: "Klaas",
    lastName: "Vanslambrouck",
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
