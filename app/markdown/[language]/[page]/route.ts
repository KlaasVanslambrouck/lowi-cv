import { markdownFor } from "@/lib/markdownPages";
import { MARKDOWN_ROUTES } from "@/lib/markdownRoutes";
import { absoluteUrl } from "@/lib/site";

// Markdown-versie van een pagina. Niet rechtstreeks gelinkt: next.config.ts
// herschrijft /, /nidus, /lowi en hun /en-versies hierheen wanneer de
// Accept-header text/markdown noemt. Statisch: de inhoud komt volledig uit de
// content, dus alle zes varianten worden tijdens de build gegenereerd.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return MARKDOWN_ROUTES.map(({ language, slug }) => ({ language, page: slug }));
}

interface MarkdownRouteContext {
  params: Promise<{ language: string; page: string }>;
}

export async function GET(_request: Request, { params }: MarkdownRouteContext) {
  const { language, page } = await params;
  const route = MARKDOWN_ROUTES.find(
    (candidate) => candidate.language === language && candidate.slug === page,
  );

  if (!route) {
    return new Response(null, { status: 404 });
  }

  return new Response(markdownFor(route.slug, route.language), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // De body hangt af van de Accept-header: een gedeelde cache mag deze
      // Markdown niet aan een browser geven (of omgekeerd).
      Vary: "Accept",
      // De HTML-pagina blijft de canonieke versie, ook als iemand deze
      // interne URL rechtstreeks opvraagt.
      Link: `<${absoluteUrl(route.path)}>; rel="canonical"`,
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
