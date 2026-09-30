"use client";

import Link from "next/link";
import { useContext } from "react";
import { TranslationContext } from "@/context/TranslationContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { otherLanguage } from "@/lib/site";
import {
  controlStackToggleClasses,
  type ToggleClasses,
} from "@/components/toggleClasses";

interface LanguageToggleProps {
  classes?: ToggleClasses;
}

// Link naar dezelfde pagina in de andere taal. Het doel komt uit
// TranslationContext, dus uit dezelfde bron als de hreflang-links.
// Elke taal heeft een eigen root layout: de wissel is een volledige page load.
export default function LanguageToggle({
  classes = controlStackToggleClasses("languageToggle"),
}: LanguageToggleProps) {
  const { language } = useLanguage();
  const alternatePath = useContext(TranslationContext);
  const sessionId = useAnalyticsSession();

  // Geen vertaling (NL-only routes zoals /cases/*): geen knop.
  if (alternatePath === null) return null;

  const nextLanguage = otherLanguage(language);

  function handleClick() {
    if (!sessionId) return;

    // Beacon: de page load die volgt mag het verzoek niet afbreken.
    trackEvent(
      {
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "language_toggle",
          value: nextLanguage,
        },
      },
      { preferBeacon: true },
    );
  }

  return (
    <Link
      className={classes.root}
      href={alternatePath}
      hrefLang={nextLanguage}
      onClick={handleClick}
      aria-label={
        language === "nl" ? "Switch to English" : "Schakel naar Nederlands"
      }
    >
      <span
        className={language === "nl" ? classes.optionActive : classes.option}
      >
        NL
      </span>
      <span className={classes.divider} aria-hidden="true">
        /
      </span>
      <span
        className={language === "en" ? classes.optionActive : classes.option}
      >
        EN
      </span>
    </Link>
  );
}
