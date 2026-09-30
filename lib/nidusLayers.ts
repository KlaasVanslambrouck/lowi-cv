import type {
  NidusArchitectureComponent,
  NidusArchitectureLayer,
} from "@/types/nidusCaseStudy";

const LAYER_ORDER: NidusArchitectureLayer[] = ["client", "api", "data", "edge", "ai"];

// Compacte lagenboom van de Nidus-architectuur, bv. "API     nidus-api".
// Voor de X-ray-weergave van de Nidus-kaart op de homepage; wordt server-side
// opgebouwd zodat de volledige case-study-content niet in de homepage-bundle
// belandt. Lagen zonder componenten vallen weg.
export function nidusLayerTree(components: NidusArchitectureComponent[]): string {
  return LAYER_ORDER.flatMap((layer) => {
    const names = components
      .filter((component) => component.layer === layer)
      .map((component) => component.name);
    return names.length > 0 ? [`${layer.toUpperCase().padEnd(8)}${names.join(" · ")}`] : [];
  }).join("\n");
}
