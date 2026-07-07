"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bilingual, JarvisObservation } from "@/types/content";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { useSessionInsight } from "@/hooks/useSessionInsight";
import { trackEvent } from "@/lib/analytics/trackEvent";
import styles from "@/styles/cv.module.css";

interface JarvisPresenceProps {
  observations: JarvisObservation[];
  label: string; // taalonafhankelijke prefix, bv. "jarvis"
  askLabel: Bilingual;
}

const PROACTIVE_THRESHOLD_SECONDS = 15;

// Subtiel, vast paneel rechtsonder dat een "systeem-observatie" toont voor de
// sectie die momenteel in beeld is. Leest dezelfde data-section-id-attributen
// die CVSection/Hero/ContactFooter al zetten — er is dus één bron van
// sectie-identiteit, geen dubbele observer-configuratie per component.
export default function JarvisPresence({
  observations,
  label,
  askLabel,
}: JarvisPresenceProps) {
  const { t } = useLanguage();
  const sessionId = useAnalyticsSession();
  const {
    sectionInsights,
    activeProactiveSectionId,
    hasShownProactiveSuggestion,
    markProactiveSuggestionShown,
    setActiveProactiveSuggestion,
  } = useSessionInsight();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-id]"),
    );
    if (sections.length === 0) return;

    // De sectie die de middenband van de viewport snijdt is "actief";
    // de negatieve rootMargin knijpt de observatiezone tot die band.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(
              (entry.target as HTMLElement).dataset.sectionId ?? null,
            );
          }
        });
      },
      { rootMargin: "-40% 0px -45% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const activeObservation = useMemo(
    () =>
      observations.find(
        (observation) => observation.sectionId === activeSectionId,
      ) ?? null,
    [observations, activeSectionId],
  );

  const activeInsight = useMemo(
    () =>
      sectionInsights.find((insight) => insight.sectionId === activeSectionId) ??
      null,
    [activeSectionId, sectionInsights],
  );

  useEffect(() => {
    setActiveProactiveSuggestion(null);
  }, [activeSectionId, setActiveProactiveSuggestion]);

  const shouldShowProactive =
    Boolean(activeSectionId) &&
    Boolean(activeObservation?.proactiveSuggestion) &&
    Boolean(activeObservation?.suggestedQuestion) &&
    (activeInsight?.totalSeconds ?? 0) >= PROACTIVE_THRESHOLD_SECONDS &&
    !hasShownProactiveSuggestion(activeSectionId ?? "");

  useEffect(() => {
    if (!shouldShowProactive || !activeSectionId) return;

    setActiveProactiveSuggestion(activeSectionId);
    markProactiveSuggestionShown(activeSectionId);

    if (sessionId) {
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "jarvis_proactive_shown",
          sectionId: activeSectionId,
        },
      });
    }
  }, [
    activeSectionId,
    markProactiveSuggestionShown,
    sessionId,
    setActiveProactiveSuggestion,
    shouldShowProactive,
  ]);

  function handleProactiveClick() {
    if (!activeObservation?.suggestedQuestion || !activeSectionId) return;

    const suggestedQuestion = t(activeObservation.suggestedQuestion);
    if (sessionId) {
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "jarvis_proactive_clicked",
          sectionId: activeSectionId,
          suggestedQuestion,
        },
      });
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("jarvis")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  // Niet tonen zonder observatie, en ook niet wanneer de JarvisTerminal
  // zelf in beeld is — geen twee Jarvis-uitingen tegelijk
  if (!activeObservation || activeSectionId === "jarvis") return null;

  const showProactive =
    (shouldShowProactive || activeProactiveSectionId === activeSectionId) &&
    activeObservation.proactiveSuggestion &&
    activeObservation.suggestedQuestion;
  const proactiveSuggestion = showProactive
    ? activeObservation.proactiveSuggestion
    : null;
  const suggestedQuestion = showProactive
    ? activeObservation.suggestedQuestion
    : null;

  return (
    <div
      className={
        showProactive
          ? `${styles.jarvisPresence} ${styles.jarvisPresenceProactive}`
          : styles.jarvisPresence
      }
      role="status"
      aria-live="polite"
    >
      <span className={styles.jarvisPresenceLabel}>{label}</span>
      {/* key forceert de korte fade bij elke sectie-wissel */}
      <span
        key={activeObservation.sectionId}
        className={styles.jarvisPresenceText}
      >
        {t(activeObservation.text)}
      </span>
      {proactiveSuggestion && suggestedQuestion ? (
        <span className={styles.jarvisProactive}>
          <span className={styles.jarvisProactiveText}>
            {t(proactiveSuggestion)}
          </span>
          <button
            type="button"
            className={styles.jarvisProactiveButton}
            onClick={handleProactiveClick}
          >
            {t(askLabel)}
          </button>
          <span className={styles.jarvisProactiveQuestion}>
            {t(suggestedQuestion)}
          </span>
        </span>
      ) : null}
    </div>
  );
}
