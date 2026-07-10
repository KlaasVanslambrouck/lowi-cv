"use client";

import type { NidusIntroContent } from "@/types/nidusCaseStudy";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import styles from "@/styles/nidus.module.css";

interface NidusIntroProps {
  content: NidusIntroContent;
}

export default function NidusIntro({ content }: NidusIntroProps) {
  const { t } = useLanguage();
  const [sectionRef] = useSectionTracking<HTMLElement>("nidus-intro");

  return (
    <section
      ref={sectionRef}
      id="nidus-intro"
      data-section-id="nidus-intro"
      className={styles.introSection}
    >
      <div className={styles.introInner}>
        <h1 className={styles.introTitle}>{t(content.title)}</h1>
        <p className={styles.introSubtitle}>{t(content.subtitle)}</p>
        <p className={styles.introPitch}>{t(content.pitch)}</p>
      </div>
    </section>
  );
}
