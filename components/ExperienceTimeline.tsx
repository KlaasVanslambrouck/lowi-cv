"use client";

import { useRef } from "react";
import type { Bilingual } from "@/types/content";
import type { TimelineExperience } from "@/lib/experience";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import MarginNote from "@/components/sketch/MarginNote";
import { useSketchState } from "@/components/sketch/SketchScope";
import { sketchClassName } from "@/components/sketch/sketchClasses";
import { homeRedesignCopy as copy } from "@/components/home/homeRedesignCopy";
import { ROLE } from "@/content/role";
import { useLanguage } from "@/hooks/useLanguage";
import sketch from "@/components/sketch/sketch.module.css";
import styles from "@/styles/home.module.css";

interface ExperienceTimelineProps {
  entries: TimelineExperience[];
  explainButtonLabel: Bilingual;
}

// De nieuwe rol uit content/role.ts (zo voegt lib/experience.ts hem toe).
function isNewRole(entry: TimelineExperience): boolean {
  return entry.company === ROLE.employer.name;
}

// Bolletje per soort functie: de nieuwe rol in markeergeel, de
// analysefuncties (motief "flowchart") in petrol, de rest open.
function dotClassName(entry: TimelineExperience): string {
  if (isNewRole(entry)) return `${styles.timelineDot} ${styles.timelineDotNext}`;
  if (entry.motif === "flowchart") return `${styles.timelineDot} ${styles.timelineDotAnalysis}`;
  return styles.timelineDot;
}

// Tijdlijn, chronologisch met de oudste functie bovenaan; lib/experience.ts
// levert die lijst (incl. de rolwissel uit content/role.ts). Een getekende
// lijn verbindt de functies.
export default function ExperienceTimeline({
  entries,
  explainButtonLabel,
}: ExperienceTimelineProps) {
  const { t } = useLanguage();
  const lineRef = useRef<SVGSVGElement>(null);
  const sketchState = useSketchState(lineRef);

  return (
    <div className={styles.timeline}>
      <svg
        ref={lineRef}
        className={sketchClassName(styles.timelineLine, sketchState, {
          tone: "teal",
          delay: 1,
        })}
        viewBox="0 0 20 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className={sketch.longLine}
          pathLength={1}
          d="M10 0 C 16 120, 4 240, 10 360 S 16 600, 10 720 S 6 900, 10 1000"
        />
      </svg>
      <ol className={styles.timelineList}>
        {entries.map((entry) => {
          // De nieuwe rol die nog moet starten: "volgende stap".
          const isNextStep = isNewRole(entry) && !entry.isCurrent;

          return (
            <li key={`${entry.company}-${entry.startDate}`} className={styles.timelineItem}>
              <span className={dotClassName(entry)} aria-hidden="true" />
              {entry.periodLabel || entry.period ? (
                <p className={`${styles.eyebrow} ${styles.timelinePeriod}`}>
                  {entry.periodLabel ? t(entry.periodLabel) : entry.period}
                </p>
              ) : null}
              <h3 className={styles.timelineRole}>{t(entry.role)}</h3>
              {/* Kwalificatie tussen haakjes achter de eigennaam. */}
              <p className={styles.timelineOrg}>
                {entry.companyNote
                  ? `${entry.company} (${t(entry.companyNote)})`
                  : entry.company}
              </p>
              <p className={`${styles.body} ${styles.timelineText}`}>
                {t(entry.description)}
              </p>
              {entry.explanationId ? (
                <div className={styles.timelineAction}>
                  <JarvisExplainButton
                    explanationId={entry.explanationId}
                    label={explainButtonLabel}
                  />
                </div>
              ) : null}
              {isNextStep ? (
                <MarginNote className={styles.timelineNote} rotate={-2}>
                  {t(copy.nextStep)}
                </MarginNote>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
