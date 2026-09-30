"use client";

import CtaLink from "@/components/CtaLink";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import type { LowiContent, UILabels } from "@/types/content";
import styles from "@/styles/home.module.css";

interface HomeDuoProps {
  lowi: LowiContent;
  labels: UILabels;
}

// "Werk in twee luiken": Nidus | LOWI, direct na de hero (Home.dc.html).
// Alle tekst komt uit de bestaande LOWI-content.
export default function HomeDuo({ lowi, labels }: HomeDuoProps) {
  const { t } = useLanguage();
  const [sectionRef] = useSectionTracking<HTMLElement>("duo");
  const nidus = lowi.projects.find((project) => project.caseStudyPath === "/nidus");

  return (
    <section
      ref={sectionRef}
      className={styles.duo}
      data-section-id="duo"
      aria-label="Nidus · LOWI"
    >
      {nidus ? (
        <article className={styles.duoItem}>
          <h2 className={styles.duoTitle}>{nidus.name}</h2>
          <p className={styles.duoText}>{t(nidus.tagline)}</p>
          <CtaLink
            href="/nidus"
            interactionId="nidus_cta_duo"
            variant="link"
            arrow
          >
            {t(nidus.caseStudyLinkLabel ?? labels.caseStudyLinkLabel)}
          </CtaLink>
        </article>
      ) : null}
      <article className={styles.duoItem}>
        <h2 className={styles.duoTitle}>LOWI</h2>
        {/* De naam voluit, zoals in de LOWI-intro */}
        <p className={styles.duoText}>Lab of Wonder and Imagination</p>
        <CtaLink
          href={lowi.celPath}
          interactionId="lowi_cta_duo"
          variant="link"
          arrow
        >
          {t(lowi.celLinkLabel)}
        </CtaLink>
      </article>
    </section>
  );
}
