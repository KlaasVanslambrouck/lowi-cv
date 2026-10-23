import { notFoundMarkdown } from "@/lib/markdownPages";

// 404 in Markdown voor agents. next.config.ts stuurt hier enkel verzoeken
// heen die op geen enkele route passen (fallback-rewrite) én text/markdown
// vragen; browsers krijgen app/global-not-found.tsx.
export function GET() {
  return new Response(notFoundMarkdown(), {
    status: 404,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "X-Robots-Tag": "noindex",
    },
  });
}
