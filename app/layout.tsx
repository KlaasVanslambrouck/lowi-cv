import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { XrayProvider } from "@/context/XrayContext";
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

export const metadata: Metadata = {
  title: "Klaas Van Slambrouck — CV",
  description:
    "Functioneel Analist op weg naar AI Business Engineer. CV en portfolio met live inkijk in het LOWI-platform.",
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
