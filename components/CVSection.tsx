"use client";

import type { ReactNode } from "react";
import type { Bilingual } from "@/types/content";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

interface CVSectionProps {
  id: string; // sectie-id: ankerpunt én bron voor JarvisPresence (data-section-id)
  title: Bilingual;
  children: ReactNode;
}

// Sectie-wrapper met titel en scroll-reveal (fade + kleine translate-y).
export default function CVSection({ id, title, children }: CVSectionProps) {
  const [sectionRef, isVisible] = useInViewOnce<HTMLElement>();
  const { t } = useLanguage();

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section-id={id}
      className={
        isVisible
          ? `${styles.section} ${styles.reveal} ${styles.revealVisible}`
          : `${styles.section} ${styles.reveal}`
      }
    >
      <h2 className={styles.sectionTitle}>{t(title)}</h2>
      {children}
    </section>
  );
}
