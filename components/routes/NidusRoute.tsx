import JsonLd from "@/components/JsonLd";
import PortfolioDesign from "@/components/PortfolioDesign";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SketchSection from "@/components/SketchSection";
import NidusArchitecture from "@/components/nidus/NidusArchitecture";
import NidusDecisionLog from "@/components/nidus/NidusDecisionLog";
import NidusIntro from "@/components/nidus/NidusIntro";
import NidusMockups from "@/components/nidus/NidusMockups";
import NidusPlaceholder from "@/components/nidus/NidusPlaceholder";
import {
  NidusArchitectureLegend,
  NidusEmbedNote,
} from "@/components/nidus/NidusSectionAsides";
import {
  NIDUS_LAYER_EYEBROW,
  nidusRedesignCopy,
} from "@/components/nidus/nidusRedesignCopy";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { nidusPage } from "@/lib/localizedPages";
import { pageLanguageLinks } from "@/lib/site";
import { nidusGraph } from "@/lib/structuredData";
import type { Language } from "@/types/content";
import styles from "@/styles/nidus.module.css";

// Gedeeld door app/(nl)/nidus/page.tsx en app/(en)/en/nidus/page.tsx. De
// metadata staat in lib/localizedPages.ts.

interface NidusRouteProps {
  language: Language;
}

// Statuslabel van Nidus, zoals op de homepage (placeholderContent).
const nidusStatus = placeholderContent.lowi.projects.find(
  (project) => project.name === "Nidus",
)?.status;

// Server component: de content is statisch, vertaling gebeurt in de
// (client) sectiecomponenten die m.b.v. useLanguage() vertalen.
// Volgorde volgens het redesign: intro → interface → architectuur →
// beslissingen → code. De sectie-id's (ankers en analytics) blijven gelijk.
export default function NidusRoute({ language }: NidusRouteProps) {
  const content = nidusCaseStudy;
  const { alternatePath } = pageLanguageLinks(nidusPage(language));

  return (
    <>
      <JsonLd graph={nidusGraph(language)} />
      <TranslationProvider alternatePath={alternatePath}>
        <ThemeProvider>
          <SessionInsightProvider>
            <PortfolioDesign className={styles.page}>
              <SiteHeader labels={placeholderContent.uiLabels} current="nidus" />

              <main>
                <NidusIntro
                  content={content.intro}
                  sectionTitles={content.sectionTitles}
                  status={nidusStatus}
                />

                <SketchSection
                  id="nidus-screenshots"
                  eyebrow={nidusRedesignCopy.interface}
                  title={content.sectionTitles.screenshots}
                  aside={<NidusEmbedNote />}
                  className={styles.embedSection}
                >
                  {/* NidusMockups blijft ongewijzigd; deze houder zet alleen de
                      overerving terug zoals vóór het redesign (zie CSS). */}
                  <div className={styles.embed}>
                    <NidusMockups
                      mockups={content.mockups}
                      sidebarItems={content.sidebarItems}
                      dashboardDetail={content.dashboardDetail}
                      energyDetail={content.energyDetail}
                      note={content.mockupNote}
                    />
                  </div>
                </SketchSection>

                <SketchSection
                  id="nidus-architectuur"
                  eyebrow={NIDUS_LAYER_EYEBROW}
                  title={content.sectionTitles.architecture}
                  aside={<NidusArchitectureLegend />}
                >
                  <NidusArchitecture
                    components={content.architecture}
                    principles={content.principles}
                  />
                </SketchSection>

                <SketchSection
                  id="nidus-decision-log"
                  eyebrow={nidusRedesignCopy.decisions}
                  title={content.sectionTitles.decisionLog}
                >
                  <NidusDecisionLog entries={content.decisionLog} />
                </SketchSection>

                <SketchSection
                  id="nidus-code"
                  eyebrow={nidusRedesignCopy.comingSoon}
                  title={content.sectionTitles.code}
                  layout="split"
                  className={styles.codeSection}
                >
                  <NidusPlaceholder text={content.placeholderNote} />
                </SketchSection>
              </main>

              <SiteFooter current="nidus" />
              <JarvisAsk />
            </PortfolioDesign>
          </SessionInsightProvider>
        </ThemeProvider>
      </TranslationProvider>
    </>
  );
}
