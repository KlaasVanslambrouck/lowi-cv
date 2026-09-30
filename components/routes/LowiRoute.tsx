import JsonLd from "@/components/JsonLd";
import PortfolioDesign from "@/components/PortfolioDesign";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import LowiCelPagina from "@/components/lowi-cel/LowiCelPagina";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { lowiPage } from "@/lib/localizedPages";
import { pageLanguageLinks } from "@/lib/site";
import { lowiGraph } from "@/lib/structuredData";
import type { Language } from "@/types/content";

// Gedeeld door app/(nl)/lowi/page.tsx en app/(en)/en/lowi/page.tsx. De
// metadata staat in lib/localizedPages.ts.

interface LowiRouteProps {
  language: Language;
}

// Servercomponent volgens /nidus; de clientcomponent vertaalt via useLanguage().
export default function LowiRoute({ language }: LowiRouteProps) {
  const { alternatePath } = pageLanguageLinks(lowiPage(language));

  return (
    <>
      <JsonLd graph={lowiGraph(language)} />
      <TranslationProvider alternatePath={alternatePath}>
        <ThemeProvider>
          <SessionInsightProvider>
            <PortfolioDesign>
              <SiteHeader labels={placeholderContent.uiLabels} current="lowi" />
              <main>
                <LowiCelPagina
                  projects={placeholderContent.lowi.projects.map(({ name, status, tagline }) => ({ name, status, tagline }))}
                />
              </main>
              <SiteFooter current="lowi" />
              <JarvisAsk />
            </PortfolioDesign>
          </SessionInsightProvider>
        </ThemeProvider>
      </TranslationProvider>
    </>
  );
}
