"use client";

import type { Bilingual, LiveStat } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import styles from "@/styles/cv.module.css";

interface LiveStatBadgeProps {
  stat: LiveStat;
  xrayDetail: Bilingual; // extra technische regel in X-ray modus
}

// Cyaan is voorbehouden aan live/actieve data-indicatoren zoals deze badge.
export default function LiveStatBadge({ stat, xrayDetail }: LiveStatBadgeProps) {
  const { t } = useLanguage();
  const { xrayActive } = useXray();

  return (
    <div className={styles.statBadge}>
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
    </div>
  );
}
