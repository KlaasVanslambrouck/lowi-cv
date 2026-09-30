"use client";

import type { Bilingual, HeroContent } from "@/types/content";
import NidusCta from "@/components/NidusCta";
import HighlightPhrase from "@/components/sketch/HighlightPhrase";
import { SketchScope } from "@/components/sketch/SketchScope";
import Stamp from "@/components/sketch/Stamp";
import SystemSketch from "@/components/home/SystemSketch";
import { HOME_HIGHLIGHTS, homeRedesignCopy as copy } from "@/components/home/homeRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { useSketchReveal } from "@/hooks/useSketchReveal";
import styles from "@/styles/home.module.css";

interface HeroProps {
  content: HeroContent;
  nidusCtaLabel: Bilingual;
}

// Hero van het redesign: naam, rol, stelling en de systeemschets. De vroegere
// 3D-architectuurscene staat hier bewust niet meer in (HANDOFF, Beslissingen §2).
export default function Hero({ content, nidusCtaLabel }: HeroProps) {
  const { t } = useLanguage();
  const [heroRef] = useSectionTracking<HTMLElement>("hero");
  const sketchState = useSketchReveal(heroRef);
  const [firstName, ...lastNames] = content.name.split(" ");

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      data-section-id="hero"
      aria-labelledby="hero-naam"
    >
      <SketchScope state={sketchState}>
        <div className={styles.heroText}>
          <p className={styles.heroRoles}>
            <span className={styles.eyebrow}>{t(content.currentRole)}</span>{" "}
            <span className={styles.heroTarget}>{t(content.targetRole)}</span>
          </p>
          <h1 id="hero-naam" className={styles.heroName}>
            {firstName} <br />
            {lastNames.join(" ")}
          </h1>
          <p className={styles.heroThesis}>
            <HighlightPhrase
              text={t(content.thesis)}
              phrase={t(HOME_HIGHLIGHTS.thesis)}
              delay={2}
            />
          </p>
          <div className={styles.heroActions}>
            <NidusCta interactionId="nidus_cta_hero" variant="primary" arrow>
              {t(nidusCtaLabel)}
            </NidusCta>
            <a className={styles.textLink} href="#about">
              {t(copy.aboutShort)}
            </a>
            {/* Statusbadge; null in de "current"-fase (content/role.ts). */}
            {content.liveLabel ? (
              <Stamp className={styles.heroStamp} delay={4}>
                {t(content.liveLabel)}
              </Stamp>
            ) : null}
          </div>
          <p className={`${styles.body} ${styles.heroIdentity}`}>
            {t(content.identityLine)}
          </p>
          <ul className={styles.chips} aria-label="Focus areas">
            {content.focusAreas.map((focusArea) => (
              <li key={focusArea} className={styles.chip}>
                {focusArea}
              </li>
            ))}
          </ul>
        </div>
        <SystemSketch />
      </SketchScope>
    </section>
  );
}
