// Content negotiation: een verzoek met "Accept: text/markdown" krijgt op
// dezelfde URL een Markdown-versie van de pagina (rewrites in next.config.ts,
// route handlers onder app/markdown). Browsers en zoekmachines sturen geen
// text/markdown mee en krijgen dus gewoon de HTML.
//
// GEEN "@/"-imports in dit bestand: next.config.ts importeert het, en de
// config wordt buiten de gewone padresolutie geladen. De paden staan hier dus
// uitgeschreven; lib/markdownRoutes.test.ts bewaakt dat ze gelijk blijven aan
// PUBLIC_ROUTES en localizedPath() uit lib/site.ts.

export type MarkdownPageSlug = "home" | "nidus" | "lowi";
export type MarkdownLanguage = "nl" | "en";

export interface MarkdownRoute {
  /** Publieke URL van de HTML-pagina. */
  path: `/${string}`;
  /** NL-basispad, zoals in PUBLIC_ROUTES. */
  basePath: `/${string}`;
  language: MarkdownLanguage;
  slug: MarkdownPageSlug;
}

export const MARKDOWN_ROUTES: readonly MarkdownRoute[] = [
  { path: "/", basePath: "/", language: "nl", slug: "home" },
  { path: "/en", basePath: "/", language: "en", slug: "home" },
  { path: "/nidus", basePath: "/nidus", language: "nl", slug: "nidus" },
  { path: "/en/nidus", basePath: "/nidus", language: "en", slug: "nidus" },
  { path: "/lowi", basePath: "/lowi", language: "nl", slug: "lowi" },
  { path: "/en/lowi", basePath: "/lowi", language: "en", slug: "lowi" },
];

// Interne route handlers; nooit rechtstreeks gelinkt.
export function markdownDestination(route: MarkdownRoute): string {
  return `/markdown/${route.language}/${route.slug}`;
}

export const MARKDOWN_NOT_FOUND_PATH = "/markdown/missing";

// Zelfde patroon als de content-negotiation-guide in de Next-docs: elke
// Accept-header die text/markdown noemt, ongeacht q-waarden. Een agent die
// Markdown vraagt, wil Markdown; een browser noemt text/markdown nooit.
export const MARKDOWN_ACCEPT_CONDITION = {
  type: "header",
  key: "accept",
  value: "(.*)text/markdown(.*)",
} as const;
