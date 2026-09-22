import type { Metadata } from "next";
import ControlStack from "@/components/ControlStack";
import CVSection from "@/components/CVSection";
import JsonLd from "@/components/JsonLd";
import NidusArchitecture from "@/components/nidus/NidusArchitecture";
import NidusDecisionLog from "@/components/nidus/NidusDecisionLog";
import NidusIntro from "@/components/nidus/NidusIntro";
import NidusMockups from "@/components/nidus/NidusMockups";
import NidusPlaceholder from "@/components/nidus/NidusPlaceholder";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { pageMetadata } from "@/lib/pageMetadata";
import { pageLanguageLinks, type PageLocation } from "@/lib/site";
import { nidusSchema, personRef } from "@/lib/structuredData";
import type { Language } from "@/types/content";
import styles from "@/styles/nidus.module.css";

// Gedeeld door app/(nl)/nidus/page.tsx en app/(en)/en/nidus/page.tsx.

function nidusPage(language: Language): PageLocation {
  return { basePath: "/nidus", language };
}

// Titel zonder naam: de template uit de root layout voegt "| Klaas Vanslambrouck" toe.
export function nidusMetadata(language: Language): Metadata {
  return pageMetadata({
    ...nidusPage(language),
    // TODO(prompt 4): definitieve title/description-copy volgt.
    title: "Nidus — case study",
    description:
      "Diepere case study van Nidus: architectuur, decision log, screenshots en code.",
    ogType: "article",
  });
}

interface NidusRouteProps {
  language: Language;
}

// Server component: de content is statisch, vertaling gebeurt in de
// (client) sectiecomponenten die m.b.v. useLanguage() vertalen.
export default function NidusRoute({ language }: NidusRouteProps) {
  const content = nidusCaseStudy;
  const { alternatePath } = pageLanguageLinks(nidusPage(language));

  return (
    <>
      <JsonLd graph={[nidusSchema(), personRef()]} />
      <TranslationProvider alternatePath={alternatePath}>
        <ThemeProvider>
          <SessionInsightProvider>
            <main className={styles.page}>
              <ControlStack
                labels={placeholderContent.uiLabels}
                showXray={false}
              />

              <NidusIntro content={content.intro} />

              <CVSection
                id="nidus-architectuur"
                title={content.sectionTitles.architecture}
              >
                <NidusArchitecture
                  components={content.architecture}
                  principles={content.principles}
                />
              </CVSection>

              <CVSection
                id="nidus-decision-log"
                title={content.sectionTitles.decisionLog}
              >
                <NidusDecisionLog entries={content.decisionLog} />
              </CVSection>

              <CVSection
                id="nidus-screenshots"
                title={content.sectionTitles.screenshots}
              >
                <NidusMockups
                  mockups={content.mockups}
                  sidebarItems={content.sidebarItems}
                  dashboardDetail={content.dashboardDetail}
                  energyDetail={content.energyDetail}
                  note={content.mockupNote}
                />
              </CVSection>

              <CVSection id="nidus-code" title={content.sectionTitles.code}>
                <NidusPlaceholder text={content.placeholderNote} />
              </CVSection>

              <JarvisAsk />
            </main>
          </SessionInsightProvider>
        </ThemeProvider>
      </TranslationProvider>
    </>
  );
}
