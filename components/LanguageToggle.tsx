"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { trackEvent } from "@/lib/analytics/trackEvent";
import styles from "@/styles/cv.module.css";

// Vast knopje rechtsboven om tussen Nederlands en Engels te wisselen.
export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const sessionId = useAnalyticsSession();

  function handleToggleLanguage() {
    const nextLanguage = language === "nl" ? "en" : "nl";
    toggleLanguage();

    if (sessionId) {
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "language_toggle",
          value: nextLanguage,
        },
      });
    }
  }

  return (
    <button
      type="button"
      className={styles.languageToggle}
      onClick={handleToggleLanguage}
      // aria-pressed: "true" wanneer Engels actief is (NL is de default-staat)
      aria-pressed={language === "en"}
      aria-label={
        language === "nl" ? "Switch to English" : "Schakel naar Nederlands"
      }
    >
      <span
        className={
          language === "nl"
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        NL
      </span>
      <span className={styles.languageDivider} aria-hidden="true">
        /
      </span>
      <span
        className={
          language === "en"
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        EN
      </span>
    </button>
  );
}
