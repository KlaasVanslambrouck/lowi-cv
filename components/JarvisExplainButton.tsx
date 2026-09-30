"use client";

import type { Bilingual } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import styles from "@/styles/jarvisExplain.module.css";

interface JarvisExplainButtonProps {
  explanationId: string;
  label: Bilingual;
}

// Opent het vaste uitlegpaneel (JarvisExplainPanel) voor dit onderdeel; geen chat.
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
      className={styles.button}
      onClick={() => openExplanation(explanationId)}
      aria-pressed={active}
    >
      <span className={styles.buttonDot} aria-hidden="true" />
      {t(label)}
    </button>
  );
}
