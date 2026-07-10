import type { Metadata } from "next";
import ControlStack from "@/components/ControlStack";
import CVSection from "@/components/CVSection";
import NidusArchitecture from "@/components/nidus/NidusArchitecture";
import NidusDecisionLog from "@/components/nidus/NidusDecisionLog";
import NidusIntro from "@/components/nidus/NidusIntro";
import NidusMockups from "@/components/nidus/NidusMockups";
import NidusPlaceholder from "@/components/nidus/NidusPlaceholder";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import styles from "@/styles/nidus.module.css";

export const metadata: Metadata = {
  title: "Nidus — case study | Klaas Van Slambrouck",
  description:
    "Diepere case study van Nidus: architectuur, decision log, screenshots en code.",
};

// Server component: de content is statisch, vertaling gebeurt in de
// (client) sectiecomponenten die m.b.v. useLanguage() vertalen.
export default function NidusPage() {
  const content = nidusCaseStudy;

  return (
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
        </main>
      </SessionInsightProvider>
    </ThemeProvider>
  );
}
