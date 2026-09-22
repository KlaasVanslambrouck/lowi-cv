import { buildResume } from "@/lib/cvResume";

// Statisch: de inhoud komt volledig uit de content, dus ze wordt één keer
// tijdens de build gegenereerd.
export const dynamic = "force-static";

export function GET() {
  const body = `${JSON.stringify(buildResume(), null, 2)}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
