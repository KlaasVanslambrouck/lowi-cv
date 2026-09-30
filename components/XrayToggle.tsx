"use client";

import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useXray } from "@/hooks/useXray";
import { trackEvent } from "@/lib/analytics/trackEvent";
import {
  controlStackToggleClasses,
  type ToggleClasses,
} from "@/components/toggleClasses";

interface XrayToggleProps {
  labels: UILabels;
  classes?: ToggleClasses;
}

// Schakelt de globale X-ray modus.
export default function XrayToggle({
  labels,
  classes = controlStackToggleClasses("xrayToggle"),
}: XrayToggleProps) {
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
      className={classes.root}
      onClick={handleToggleXray}
      aria-pressed={xrayActive}
      aria-label={t(labels.xrayToggleAria)}
    >
      <span className={xrayActive ? classes.option : classes.optionActive}>
        {labels.xrayNormalLabel}
      </span>
      <span className={classes.divider} aria-hidden="true">
        /
      </span>
      <span className={xrayActive ? classes.optionActive : classes.option}>
        {labels.xrayActiveLabel}
      </span>
    </button>
  );
}
