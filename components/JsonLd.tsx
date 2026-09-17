import "server-only";
import type { StructuredDataNode } from "@/lib/structuredData";

interface JsonLdGraphDocument {
  "@context": "https://schema.org";
  "@graph": readonly StructuredDataNode[];
}

interface JsonLdProps {
  graph: readonly StructuredDataNode[];
}

// Rendert een Schema.org @graph als <script type="application/ld+json">.
// "<" wordt ge-escaped naar < zodat een waarde als "</script>" de tag
// niet kan afsluiten (zelfde aanpak als de Next.js JSON-LD-guide).
export default function JsonLd({ graph }: JsonLdProps) {
  const payload: JsonLdGraphDocument = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
