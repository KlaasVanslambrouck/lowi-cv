"use client";

import Arrow from "@/components/sketch/Arrow";
import MarginNote from "@/components/sketch/MarginNote";
import { nidusRedesignCopy as copy } from "@/components/nidus/nidusRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/nidus.module.css";

// Rechts van de kop "Screenshots": notitie met pijl naar de embed.
export function NidusEmbedNote() {
  const { t } = useLanguage();

  return (
    <div className={styles.embedNote}>
      <MarginNote rotate={-3} delay={2}>
        {t(copy.embedNote)}
      </MarginNote>
      <Arrow shape="curveLeft" delay={3} className={styles.embedNoteArrow} />
    </div>
  );
}

// Rechts van de kop "Architectuur" (alleen desktop, waar de pijlen staan).
export function NidusArchitectureLegend() {
  const { t } = useLanguage();

  return <p className={styles.legend}>{t(copy.architectureLegend)}</p>;
}
