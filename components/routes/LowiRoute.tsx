import ControlStack from "@/components/ControlStack";
import JsonLd from "@/components/JsonLd";
import LowiCelPagina from "@/components/lowi-cel/LowiCelPagina";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { lowiPage } from "@/lib/localizedPages";
import { pageLanguageLinks } from "@/lib/site";
import { lowiGraph } from "@/lib/structuredData";
import type { Language } from "@/types/content";
import styles from "@/components/lowi-cel/LowiCelPagina.module.css";

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
            <main className={styles.page}>
              <ControlStack labels={placeholderContent.uiLabels} showXray={false} />
              <LowiCelPagina projects={placeholderContent.lowi.projects.map(({ name, status, tagline }) => ({ name, status, tagline }))} />
            </main>
          </SessionInsightProvider>
        </ThemeProvider>
      </TranslationProvider>
    </>
  );
}
