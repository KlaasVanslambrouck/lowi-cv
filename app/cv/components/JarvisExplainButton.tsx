"use client";

import type { Bilingual } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useJarvisExplain } from "@/app/cv/hooks/useJarvisExplain";
import styles from "@/styles/cv.module.css";

interface JarvisExplainButtonProps {
  explanationId: string;
  label: Bilingual;
}

export default function JarvisExplainButton({
  explanationId,
  label,
}: JarvisExplainButtonProps) {
  const { t } = useLanguage();
  const { isExplanationActive, openExplanation } = useJarvisExplain();
  const active = isExplanationActive(explanationId);

  return (
    <button
      type="button"
      className={
        active
          ? `${styles.jarvisExplainButton} ${styles.jarvisExplainButtonActive}`
          : styles.jarvisExplainButton
      }
      onClick={() => openExplanation(explanationId)}
      aria-pressed={active}
    >
      <span className={styles.jarvisExplainButtonDot} aria-hidden="true" />
      {t(label)}
    </button>
  );
}
