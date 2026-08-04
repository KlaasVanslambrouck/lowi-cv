"use client";

import LinguixContentRenderer from "@/components/linguix/LinguixContentRenderer";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import type { LinguixSectionContent } from "@/types/linguix";
import styles from "./LinguixSection.module.css";

interface LinguixSectionProps {
  section: LinguixSectionContent;
}

export default function LinguixSection({ section }: LinguixSectionProps) {
  const [sectionRef, isVisible] = useInViewOnce<HTMLElement>({
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.08,
  });
  const titleId = `${section.id}-titel`;
  const formattedNumber = String(section.nummer).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      id={section.id}
      aria-labelledby={titleId}
      className={`${styles.section} ${isVisible ? styles.sectionVisible : ""}`}
    >
      <header className={styles.header}>
        <div className={styles.metaRow}>
          <span className={styles.eyebrow}>{section.eyebrow}</span>
          <span className={styles.duration}>
            {section.spreektijdMinuten} min
          </span>
        </div>
        <div className={styles.titleRow}>
          <span className={styles.number} aria-hidden="true">
            {formattedNumber}
          </span>
          <h2 id={titleId} className={styles.title}>
            {section.titel}
          </h2>
        </div>
      </header>

      <LinguixContentRenderer blocks={section.inhoud} />
    </section>
  );
}
