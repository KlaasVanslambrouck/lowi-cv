"use client";

import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import styles from "@/styles/cv.module.css";

interface XrayToggleProps {
  labels: UILabels;
}

// Vast knopje onder de LanguageToggle: schakelt de globale X-ray modus.
export default function XrayToggle({ labels }: XrayToggleProps) {
  const { t } = useLanguage();
  const { xrayActive, toggleXray } = useXray();

  return (
    <button
      type="button"
      className={styles.xrayToggle}
      onClick={toggleXray}
      aria-pressed={xrayActive}
      aria-label={t(labels.xrayToggleAria)}
    >
      <span
        className={
          xrayActive
            ? styles.languageOption
            : `${styles.languageOption} ${styles.languageOptionActive}`
        }
      >
        {labels.xrayNormalLabel}
      </span>
      <span className={styles.languageDivider} aria-hidden="true">
        /
      </span>
      <span
        className={
          xrayActive
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        {labels.xrayActiveLabel}
      </span>
    </button>
  );
}
