"use client";

import type { Bilingual, LiveStat } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import styles from "@/styles/cv.module.css";

interface LiveStatBadgeProps {
  stat: LiveStat;
  xrayDetail: Bilingual; // extra technische regel in X-ray modus
  explanationId?: string;
  explainButtonLabel: Bilingual;
}

// De live-kleur (--cv-live, elektrisch blauw — per thema gedefinieerd in
// globals.css) is voorbehouden aan live/actieve data-indicatoren zoals deze badge.
export default function LiveStatBadge({
  stat,
  xrayDetail,
  explanationId,
  explainButtonLabel,
}: LiveStatBadgeProps) {
  const { t } = useLanguage();
  const { xrayActive } = useXray();
  const { isExplanationActive } = useJarvisExplain();
  const explainActive = explanationId
    ? isExplanationActive(explanationId)
    : false;

  return (
    <div
      className={
        explainActive
          ? `${styles.statBadge} ${styles.jarvisExplainActiveOutline}`
          : styles.statBadge
      }
    >
      <span className={styles.statValue}>
        <span className={styles.statDot} aria-hidden="true" />
        {stat.value}
      </span>
      <span className={styles.statLabel}>{t(stat.label)}</span>
      {xrayActive ? (
        // Placeholder-deploymentdetails, alleen zichtbaar in X-ray modus
        <span className={`${styles.statXrayDetail} ${styles.fadeSwap}`}>
          {t(xrayDetail)}
        </span>
      ) : null}
      {explanationId ? (
        <div className={styles.jarvisExplainActionRow}>
          <JarvisExplainButton
            explanationId={explanationId}
            label={explainButtonLabel}
          />
        </div>
      ) : null}
    </div>
  );
}
