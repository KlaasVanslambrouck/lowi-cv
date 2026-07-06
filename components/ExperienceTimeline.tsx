"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Bilingual, ExperienceEntry } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import CareerMotifBackground from "@/components/CareerMotifBackground";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import styles from "@/styles/cv.module.css";

interface ExperienceTimelineProps {
  entries: ExperienceEntry[];
  explainButtonLabel: Bilingual;
}

// Rustige, leesbare tijdlijn — huidige rol staat bovenaan (volgorde uit
// content). Een koperkleurig bolletje schuift langs de lijn mee op basis van
// welk item in beeld is (sectie-gebaseerd via IntersectionObserver, bewust
// geen raw window.scrollY-berekeningen — zelfde aanpak als de rest van de
// pagina).
export default function ExperienceTimeline({
  entries,
  explainButtonLabel,
}: ExperienceTimelineProps) {
  const { t } = useLanguage();
  const { isExplanationActive } = useJarvisExplain();
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentExperienceExplanationId = "current-experience";

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLLIElement>("li"));
    // Het item dat de middenband van de viewport snijdt wordt "actief"
    const observer = new IntersectionObserver(
      (observedEntries) => {
        observedEntries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = items.indexOf(entry.target as HTMLLIElement);
            if (index >= 0) setActiveIndex(index);
          }
        });
      },
      { rootMargin: "-35% 0px -50% 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [entries.length]);

  // Verticale positie van het bolletje als percentage: midden van het
  // actieve item-segment. Dynamische waarde, daarom als CSS-variabele
  // doorgegeven (kan niet in statische CSS).
  const markerStyle = {
    "--timeline-progress": `${((activeIndex + 0.5) / entries.length) * 100}%`,
  } as CSSProperties;

  return (
    <div className={styles.timelineWrapper}>
      {/* Gradient-lijn + meebewegend koperen bolletje (subtiel, geen dominant element) */}
      <span className={styles.timelineTrack} aria-hidden="true" />
      <span
        className={styles.timelineMarker}
        style={markerStyle}
        aria-hidden="true"
      />
      <ol ref={listRef} className={styles.timeline}>
        {entries.map((entry) => {
          const isCurrentEntry = /heden|present/i.test(entry.period);
          const explainActive =
            isCurrentEntry &&
            isExplanationActive(currentExperienceExplanationId);

          return (
          <li
            key={`${entry.company}-${entry.period}`}
            className={styles.timelineItem}
          >
            <div
              className={
                explainActive
                  ? `${styles.timelineItemSurface} ${styles.jarvisExplainActiveOutline}`
                  : styles.timelineItemSurface
              }
            >
              <CareerMotifBackground motif={entry.motif} />
              <div className={styles.timelineItemContent}>
                <div className={styles.timelineHeader}>
                  <h3 className={styles.timelineRole}>{t(entry.role)}</h3>
                  <span className={styles.timelineCompany}>{entry.company}</span>
                </div>
                <span className={styles.timelinePeriod}>{entry.period}</span>
                <p className={styles.timelineDescription}>
                  {t(entry.description)}
                </p>
                {isCurrentEntry ? (
                  <div className={styles.jarvisExplainActionRow}>
                    <JarvisExplainButton
                      explanationId={currentExperienceExplanationId}
                      label={explainButtonLabel}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </li>
          );
        })}
      </ol>
    </div>
  );
}
