import type { NextConfig } from "next";
import {
  MARKDOWN_ACCEPT_CONDITION,
  MARKDOWN_NOT_FOUND_PATH,
  MARKDOWN_ROUTES,
  markdownDestination,
} from "./lib/markdownRoutes";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
];

if (
  process.env.VERCEL_ENV === "production" ||
  process.env.ENABLE_HSTS === "true"
) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

// Server-side env var (géén NEXT_PUBLIC): de basis-URL van nidus-api wordt
// enkel in de rewrite gebruikt, dus ze hoeft niet in de browserbundel.
const nidusApiUrl = process.env.NIDUS_API_URL?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Drie.js-gerelateerde packages worden getranspileerd door Next zelf,
  // verdere configuratie is voor deze fase niet nodig.
  reactStrictMode: true,
  // Geen dev-badge linksonder tijdens ontwikkelen/screenshots;
  // heeft geen effect op de productie-build.
  devIndicators: false,
  experimental: {
    // Twee root layouts (app/(nl) en app/(en)/en): de 404 voor onbekende URL's
    // komt uit app/global-not-found.tsx, want er is geen gedeelde layout.
    globalNotFound: true,
  },
  async rewrites() {
    // Content negotiation (lib/markdownRoutes.ts). beforeFiles, want de
    // HTML-pagina's zijn statische routes: een gewone (afterFiles) rewrite
    // komt pas aan bod nadat die al gematcht zijn, en zou dus nooit lopen.
    const markdownPages = MARKDOWN_ROUTES.map((route) => ({
      source: route.path,
      destination: markdownDestination(route),
      has: [MARKDOWN_ACCEPT_CONDITION],
    }));

    // fallback loopt pas als geen enkele route of bestand past: precies de
    // URL's die anders de HTML-404 van app/global-not-found.tsx krijgen.
    const markdownNotFound = {
      source: "/:path*",
      destination: MARKDOWN_NOT_FOUND_PATH,
      has: [MARKDOWN_ACCEPT_CONDITION],
    };

    // /cv.pdf hoort bij het eigen domein; nidus-api genereert het bestand.
    // De upstream zet zelf Content-Type: application/pdf en
    // Content-Disposition: attachment; filename="Klaas-Vanslambrouck-CV.pdf".
    if (!nidusApiUrl) {
      console.warn(
        "NIDUS_API_URL ontbreekt — /cv.pdf wordt niet doorgestuurd en geeft 404.",
      );
    }
    const cvPdf = nidusApiUrl
      ? [
          {
            source: "/cv.pdf",
            destination: `${nidusApiUrl}/api/portfolio/cv-pdf`,
          },
        ]
      : [];

    return {
      beforeFiles: markdownPages,
      afterFiles: cvPdf,
      fallback: [markdownNotFound],
    };
  },
  async redirects() {
    return [
      {
        // /cv was vroeger een duplicate van de homepage; redirect vangt
        // eventueel al gedeelde links op.
        source: "/cv",
        destination: "/",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Geen Vary: Accept voor de HTML-pagina's: Next overschrijft de Vary van
      // een app-pagina met zijn eigen RSC-waarden (build/templates/app-page.js,
      // res.setHeader). De Markdown-respons zet zelf Vary: Accept, en dat is de
      // richting die telt: een cache geeft Markdown dan nooit aan een browser.
    ];
  },
};

export default nextConfig;
