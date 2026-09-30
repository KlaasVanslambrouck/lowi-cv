"use client";

import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useTheme } from "@/hooks/useTheme";
import { trackEvent } from "@/lib/analytics/trackEvent";
import {
  controlStackToggleClasses,
  type ToggleClasses,
} from "@/components/toggleClasses";

interface ThemeToggleProps {
  labels: UILabels;
  classes?: ToggleClasses;
}

// Schakelt tussen het donkere en lichte thema.
export default function ThemeToggle({
  labels,
  classes = controlStackToggleClasses("themeToggle"),
}: ThemeToggleProps) {
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
      className={classes.root}
      onClick={handleToggleTheme}
      aria-pressed={theme === "light"}
      aria-label={t(labels.themeToggleAria)}
    >
      <span
        className={theme === "dark" ? classes.optionActive : classes.option}
      >
        {labels.themeDarkLabel}
      </span>
      <span className={classes.divider} aria-hidden="true">
        /
      </span>
      <span
        className={theme === "light" ? classes.optionActive : classes.option}
      >
        {labels.themeLightLabel}
      </span>
    </button>
  );
}
