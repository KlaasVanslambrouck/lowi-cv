"use client";

import type { Bilingual } from "@/types/content";
import type { NidusIntroContent, NidusSectionTitles } from "@/types/nidusCaseStudy";
import HighlightPhrase from "@/components/sketch/HighlightPhrase";
import MarginNote from "@/components/sketch/MarginNote";
import { SketchScope } from "@/components/sketch/SketchScope";
import { NIDUS_HIGHLIGHTS, nidusRedesignCopy as copy } from "@/components/nidus/nidusRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { useSketchReveal } from "@/hooks/useSketchReveal";
import styles from "@/styles/nidus.module.css";

interface NidusIntroProps {
  content: NidusIntroContent;
  sectionTitles: NidusSectionTitles;
  status?: Bilingual;
}

// "Nidus — case study" → "Nidus" groot, "— case study" klein erachter.
// De tekst zelf blijft letterlijk dezelfde.
function splitTitle(title: string): [string, string | null] {
  const index = title.indexOf(" — ");
  return index === -1 ? [title, null] : [title.slice(0, index), title.slice(index + 1)];
}

export default function NidusIntro({ content, sectionTitles, status }: NidusIntroProps) {
  const { t } = useLanguage();
  const [sectionRef] = useSectionTracking<HTMLElement>("nidus-intro");
  const sketchState = useSketchReveal(sectionRef);
  const [titleMain, titleRest] = splitTitle(t(content.title));

  return (
    <section
      ref={sectionRef}
      id="nidus-intro"
      data-section-id="nidus-intro"
      className={styles.intro}
    >
      <SketchScope state={sketchState}>
        <div className={styles.introMain}>
          <h1 className={styles.introTitle}>
            {titleMain}
            {titleRest ? (
              <>
                {" "}
                <span className={styles.introTitleRest}>{titleRest}</span>
              </>
            ) : null}
          </h1>
          <p className={styles.introSubtitle}>
            <HighlightPhrase
              text={t(content.subtitle)}
              phrase={t(NIDUS_HIGHLIGHTS.introSubtitle)}
              delay={2}
            />
          </p>
          <p className={styles.introPitch}>{t(content.pitch)}</p>
          {status ? <p className={styles.chip}>{t(status)}</p> : null}
        </div>

        <div className={styles.introSide}>
          <nav className={styles.pageNav} aria-label={t(copy.pageNav)}>
            <a href="#nidus-screenshots">{t(copy.interface)}</a>
            <a href="#nidus-architectuur">{t(sectionTitles.architecture)}</a>
            <a href="#nidus-decision-log">{t(copy.decisions)}</a>
            <a href="#nidus-code">{t(sectionTitles.code)}</a>
          </nav>
          <MarginNote as="p" rotate={-2} delay={3}>
            {t(copy.introNote)}
          </MarginNote>
        </div>
      </SketchScope>
    </section>
  );
}
