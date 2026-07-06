"use client";

import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useTheme } from "@/hooks/useTheme";
import { trackEvent } from "@/lib/analytics/trackEvent";
import styles from "@/styles/cv.module.css";

interface ThemeToggleProps {
  labels: UILabels;
}

// Vast knopje in de toggle-kolom: schakelt tussen het donkere en lichte thema.
export default function ThemeToggle({ labels }: ThemeToggleProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const sessionId = useAnalyticsSession();

  function handleToggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggleTheme();

    if (sessionId) {
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "theme_toggle",
          value: nextTheme,
        },
      });
    }
  }

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={handleToggleTheme}
      aria-pressed={theme === "light"}
      aria-label={t(labels.themeToggleAria)}
    >
      <span
        className={
          theme === "dark"
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        {labels.themeDarkLabel}
      </span>
      <span className={styles.languageDivider} aria-hidden="true">
        /
      </span>
      <span
        className={
          theme === "light"
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        {labels.themeLightLabel}
      </span>
    </button>
  );
}
