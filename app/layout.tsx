import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { XrayProvider } from "@/context/XrayContext";
import { siteDescription, siteTitle } from "@/content/role";
import { SHARED_OPEN_GRAPH, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Fraunces: naam, headline en sectietitels
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// DM Sans: lopende CV-tekst. display "optional" omdat de hero-thesis het
// LCP-element is: een late font-swap zou de LCP-meting met seconden
// verschuiven. Op normale verbindingen laadt de font ruim binnen de
// block-periode en is er geen visueel verschil.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "optional",
});

// DM Mono: labels, cijfers, terminal-tekst en code-snippets
// (gewicht 300 wordt nergens gebruikt en is bewust weggelaten — scheelt preload-bytes)
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

// viewport-fit=cover laat de pagina onder de notch/home-indicator doorlopen,
// zodat env(safe-area-inset-*) in de CSS de fixed elementen kan vrijhouden.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Let op: Next.js merget metadata ondiep. Een child-segment dat zelf
// openGraph, twitter, alternates of robots zet, vervangt dat hele object.
export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Default document-taal is Nederlands; de LanguageProvider zet het
    // lang-attribuut op een wrapper zodra de bezoeker (of browser) kiest.
    <html
      lang="nl"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <LanguageProvider>
          <XrayProvider>{children}</XrayProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
