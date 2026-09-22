import type { Metadata } from "next";
import ControlStack from "@/components/ControlStack";
import JsonLd from "@/components/JsonLd";
import LowiCelPagina from "@/components/lowi-cel/LowiCelPagina";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { pageMetadata } from "@/lib/pageMetadata";
import { pageLanguageLinks, type PageLocation } from "@/lib/site";
import {
  crisprChicknSchema,
  lowiSchema,
  personRef,
} from "@/lib/structuredData";
import type { Language } from "@/types/content";
import styles from "@/components/lowi-cel/LowiCelPagina.module.css";

// Gedeeld door app/(nl)/lowi/page.tsx en app/(en)/en/lowi/page.tsx.

function lowiPage(language: Language): PageLocation {
  return { basePath: "/lowi", language };
}

// Titel zonder naam: de template uit de root layout voegt "| Klaas Vanslambrouck" toe.
export function lowiMetadata(language: Language): Metadata {
  return pageMetadata({
    ...lowiPage(language),
    // TODO(prompt 4): definitieve description-copy volgt; nu samengesteld uit de
    // bestaande intro-tekst van de pagina (LowiCelPagina).
    title: "LOWI — Lab of Wonder and Imagination",
    description:
      "Een persoonlijk lab van Klaas Vanslambrouck. Ik onderzoek hoe dingen werken en bouw om te ontdekken wat ermee kan. AI, biologie, systemen en verhalen komen hier samen.",
    ogType: "article",
  });
}

interface LowiRouteProps {
  language: Language;
}

// Servercomponent volgens /nidus; de clientcomponent vertaalt via useLanguage().
export default function LowiRoute({ language }: LowiRouteProps) {
  const { alternatePath } = pageLanguageLinks(lowiPage(language));

  return (
    <>
      <JsonLd graph={[lowiSchema(), crisprChicknSchema(), personRef()]} />
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
