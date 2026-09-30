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
  // stacked: kop boven de inhoud, aside rechts van de kop.
  // split: kop (met aside eronder) links, inhoud rechts (.split in de artboards).
  layout?: "stacked" | "split";
  // Naast de kop (stacked) of eronder in de linkerkolom (split); op mobiel eronder.
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
  layout = "stacked",
  aside,
  className,
  children,
}: SketchSectionProps) {
  const [sectionRef] = useSectionTracking<HTMLElement>(id);
  const sketchState = useSketchReveal(sectionRef);
  const { t } = useLanguage();
  const titleId = `${id}-titel`;
  const sectionClassName = [
    styles.section,
    layout === "split" ? styles.split : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section-id={id}
      aria-labelledby={titleId}
      className={sectionClassName}
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
        {layout === "split" && children ? (
          <div className={styles.body}>{children}</div>
        ) : (
          children
        )}
      </SketchScope>
    </section>
  );
}
