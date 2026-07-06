"use client";

import { useEffect, useId, useRef } from "react";
import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useJarvisExplain } from "@/app/cv/hooks/useJarvisExplain";
import styles from "@/styles/cv.module.css";

interface JarvisExplainPanelProps {
  labels: UILabels;
}

export default function JarvisExplainPanel({ labels }: JarvisExplainPanelProps) {
  const { t } = useLanguage();
  const { activeExplanation, closeExplanation } = useJarvisExplain();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeExplanation) return;
    closeButtonRef.current?.focus();
  }, [activeExplanation]);

  useEffect(() => {
    if (!activeExplanation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExplanation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeExplanation, closeExplanation]);

  if (!activeExplanation) return null;

  return (
    <>
      <button
        type="button"
        className={styles.jarvisExplainScrim}
        onClick={closeExplanation}
        aria-label={t(labels.jarvisExplainClose)}
      />
      <aside
        className={styles.jarvisExplainPanel}
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className={styles.jarvisExplainPanelHeader}>
          <p className={styles.jarvisExplainStatus}>
            {t(labels.jarvisExplainStatus)}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.jarvisExplainClose}
            onClick={closeExplanation}
            aria-label={t(labels.jarvisExplainClose)}
          >
            x
          </button>
        </div>

        <p className={styles.jarvisExplainContext}>
          {t(activeExplanation.contextLabel)}
        </p>
        <h2 id={titleId} className={styles.jarvisExplainTitle}>
          {t(activeExplanation.title)}
        </h2>
        <p className={styles.jarvisExplainSummary}>
          {t(activeExplanation.summary)}
        </p>

        <ul className={styles.jarvisExplainSignals}>
          {activeExplanation.signals.map((signal) => (
            <li key={signal.en}>{t(signal)}</li>
          ))}
        </ul>

        <div className={styles.jarvisExplainRelevance}>
          <p className={styles.jarvisExplainRelevanceLabel}>
            {t(labels.jarvisExplainRelevanceLabel)}
          </p>
          <p>{t(activeExplanation.relevance)}</p>
        </div>
      </aside>
    </>
  );
}
