"use client";

import { useEffect, useId, useRef } from "react";
import type { UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import styles from "@/styles/jarvisExplain.module.css";

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
        className={styles.scrim}
        onClick={closeExplanation}
        aria-label={t(labels.jarvisExplainClose)}
      />
      <aside
        className={styles.panel}
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <p className={styles.status}>
            {t(labels.jarvisExplainStatus)}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.close}
            onClick={closeExplanation}
            aria-label={t(labels.jarvisExplainClose)}
          >
            <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
              <path d="M2 2 L12 12 M12 2 L2 12" />
            </svg>
          </button>
        </div>

        <p className={styles.context}>
          {t(activeExplanation.contextLabel)}
        </p>
        <h2 id={titleId} className={styles.title}>
          {t(activeExplanation.title)}
        </h2>
        <p className={styles.summary}>
          {t(activeExplanation.summary)}
        </p>

        <ul className={styles.signals}>
          {activeExplanation.signals.map((signal) => (
            <li key={signal.en}>
              <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                <path d="M3 9 L7 13 L15 3" />
              </svg>
              {t(signal)}
            </li>
          ))}
        </ul>

        <div className={styles.relevance}>
          <p className={styles.relevanceLabel}>
            {t(labels.jarvisExplainRelevanceLabel)}
          </p>
          <p>{t(activeExplanation.relevance)}</p>
        </div>
      </aside>
    </>
  );
}
