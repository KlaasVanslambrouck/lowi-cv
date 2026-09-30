import HomePage from "@/components/HomePage";
import JsonLd from "@/components/JsonLd";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { TranslationProvider } from "@/context/TranslationContext";
import { homePage } from "@/lib/localizedPages";
import { nidusLayerTree } from "@/lib/nidusLayers";
import { pageLanguageLinks } from "@/lib/site";
import { homeGraph } from "@/lib/structuredData";
import type { Language } from "@/types/content";

// Gedeeld door app/(nl)/page.tsx en app/(en)/en/page.tsx. De metadata staat
// in lib/localizedPages.ts, zodat de tests ze zonder JSX kunnen importeren.

interface HomeRouteProps {
  language: Language;
}

// Servercomponent: rendert de JSON-LD en de (client) CV-pagina.
export default function HomeRoute({ language }: HomeRouteProps) {
  const { alternatePath } = pageLanguageLinks(homePage(language));

  return (
    <>
      <JsonLd graph={homeGraph(language)} />
      <TranslationProvider alternatePath={alternatePath}>
        {/* Server-side, zodat de case-study-content niet in de homepage-bundle zit. */}
        <HomePage nidusLayerTree={nidusLayerTree(nidusCaseStudy.architecture)} />
      </TranslationProvider>
    </>
  );
}
