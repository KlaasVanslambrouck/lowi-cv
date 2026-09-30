"use client";

import type { ReactNode } from "react";
import { SketchScope } from "@/components/sketch/SketchScope";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { useSketchReveal } from "@/hooks/useSketchReveal";
import type { Bilingual } from "@/types/content";
import styles from "@/styles/sketchSection.module.css";

interface SketchSectionProps {
  id: string; // anker én sectie-id voor analytics (zoals CVSection)
  title: Bilingual;
  eyebrow?: Bilingual;
  // Rechts van de kop op desktop (notitie, legenda); op mobiel eronder.
  aside?: ReactNode;
  className?: string;
  children?: ReactNode;
}

// Sectie van het redesign. Anders dan CVSection verbergt deze niets tot JS
// geladen is: alleen de schetsaccenten binnenin wachten (useSketchReveal),
// en die starten samen via SketchScope.
export default function SketchSection({
  id,
  title,
  eyebrow,
  aside,
  className,
  children,
}: SketchSectionProps) {
  const [sectionRef] = useSectionTracking<HTMLElement>(id);
  const sketchState = useSketchReveal(sectionRef);
  const { t } = useLanguage();
  const titleId = `${id}-titel`;

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section-id={id}
      aria-labelledby={titleId}
      className={className ? `${styles.section} ${className}` : styles.section}
    >
      <SketchScope state={sketchState}>
        <div className={styles.head}>
          <div className={styles.heading}>
            {eyebrow ? <p className={styles.eyebrow}>{t(eyebrow)}</p> : null}
            <h2 id={titleId} className={styles.title}>
              {t(title)}
            </h2>
          </div>
          {aside ? <div className={styles.aside}>{aside}</div> : null}
        </div>
        {children}
      </SketchScope>
    </section>
  );
}
