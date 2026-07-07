"use client";

import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useXray } from "@/hooks/useXray";
import { trackEvent } from "@/lib/analytics/trackEvent";
import styles from "@/styles/cv.module.css";

interface XrayToggleProps {
  labels: UILabels;
}

// Knop in de control-stack: schakelt de globale X-ray modus.
export default function XrayToggle({ labels }: XrayToggleProps) {
  const { t } = useLanguage();
  const { xrayActive, toggleXray } = useXray();
  const sessionId = useAnalyticsSession();

  function handleToggleXray() {
    const nextXrayActive = !xrayActive;
    toggleXray();

    if (sessionId) {
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "xray_toggle",
          value: nextXrayActive ? "on" : "off",
        },
      });
    }
  }

  return (
    <button
      type="button"
      className={styles.xrayToggle}
      onClick={handleToggleXray}
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
