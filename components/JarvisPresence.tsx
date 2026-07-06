"use client";

import { useEffect, useMemo, useState } from "react";
import type { JarvisObservation } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

interface JarvisPresenceProps {
  observations: JarvisObservation[];
  label: string; // taalonafhankelijke prefix, bv. "jarvis"
}

// Subtiel, vast paneel rechtsonder dat een "systeem-observatie" toont voor de
// sectie die momenteel in beeld is. Leest dezelfde data-section-id-attributen
// die CVSection/Hero/ContactFooter al zetten — er is dus één bron van
// sectie-identiteit, geen dubbele observer-configuratie per component.
export default function JarvisPresence({
  observations,
  label,
}: JarvisPresenceProps) {
  const { t } = useLanguage();
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

  // Niet tonen zonder observatie, en ook niet wanneer de JarvisTerminal
  // zelf in beeld is — geen twee Jarvis-uitingen tegelijk
  if (!activeObservation || activeSectionId === "jarvis") return null;

  return (
    <div className={styles.jarvisPresence} role="status" aria-live="polite">
      <span className={styles.jarvisPresenceLabel}>{label}</span>
      {/* key forceert de korte fade bij elke sectie-wissel */}
      <span
        key={activeObservation.sectionId}
        className={styles.jarvisPresenceText}
      >
        {t(activeObservation.text)}
      </span>
    </div>
  );
}
