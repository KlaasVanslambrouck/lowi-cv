import type { Metadata } from "next";
import ControlStack from "@/components/ControlStack";
import JsonLd from "@/components/JsonLd";
import LowiCelPagina from "@/components/lowi-cel/LowiCelPagina";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SHARED_OPEN_GRAPH, absoluteUrl, localizedPath } from "@/lib/site";
import {
  crisprChicknSchema,
  lowiSchema,
  personRef,
} from "@/lib/structuredData";
import type { Language } from "@/types/content";
import styles from "@/components/lowi-cel/LowiCelPagina.module.css";

// Gedeeld door app/(nl)/lowi/page.tsx en app/(en)/en/lowi/page.tsx.
// Titel zonder naam: de template uit de root layout voegt "| Klaas Vanslambrouck" toe.
export function lowiMetadata(language: Language): Metadata {
  return {
    // TODO(prompt 4): definitieve description-copy volgt; nu samengesteld uit de
    // bestaande intro-tekst van de pagina (LowiCelPagina).
    title: "LOWI — Lab of Wonder and Imagination",
    description:
      "Een persoonlijk lab van Klaas Vanslambrouck. Ik onderzoek hoe dingen werken en bouw om te ontdekken wat ermee kan. AI, biologie, systemen en verhalen komen hier samen.",
    alternates: {
      canonical: absoluteUrl(localizedPath("/lowi", language)),
    },
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      type: "article",
    },
  };
}

// Servercomponent volgens /nidus; de clientcomponent vertaalt via useLanguage().
export default function LowiRoute() {
  return (
    <>
      <JsonLd graph={[lowiSchema(), crisprChicknSchema(), personRef()]} />
      <ThemeProvider>
        <SessionInsightProvider>
          <main className={styles.page}>
            <ControlStack labels={placeholderContent.uiLabels} showXray={false} />
            <LowiCelPagina projects={placeholderContent.lowi.projects.map(({ name, status, tagline }) => ({ name, status, tagline }))} />
          </main>
        </SessionInsightProvider>
      </ThemeProvider>
    </>
  );
}
