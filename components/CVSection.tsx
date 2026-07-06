"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Bilingual } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

interface CVSectionProps {
  id: string; // sectie-id: ankerpunt én bron voor JarvisPresence (data-section-id)
  title: Bilingual;
  children: ReactNode;
}

// Sectie-wrapper met titel en scroll-reveal (fade + kleine translate-y).
export default function CVSection({ id, title, children }: CVSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    // Bij reduced motion: meteen tonen, geen reveal-animatie
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
