import { buildLlmsTxt } from "@/lib/llmsTxt";

// Statisch: de inhoud komt volledig uit de content, dus ze wordt één keer
// tijdens de build gegenereerd.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Agents hoeven dit bestand niet bij elke vraag opnieuw op te halen.
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
