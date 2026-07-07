"use client";

import type { ReactNode } from "react";
import styles from "./AIEngineeringPlayground.module.css";

interface PipelineStageProps {
  id: string;
  index: number;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function PipelineStage({
  id,
  index,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: PipelineStageProps) {
  const detailsId = `${id}-details`;

  return (
    <section className={styles.stage}>
      <button
        type="button"
        className={styles.stageHeader}
        aria-expanded={isOpen}
        aria-controls={detailsId}
        onClick={onToggle}
      >
        <span>
          <span className={styles.stageKicker}>
            {String(index).padStart(2, "0")}
          </span>
          <span className={styles.stageTitle}>{title}</span>
        </span>
        <span className={styles.stageChevron} aria-hidden="true">
          {isOpen ? "-" : "+"}
        </span>
        <span className={styles.stageSummary}>{summary}</span>
      </button>
      {isOpen ? (
        <div id={detailsId} className={styles.stageBody}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
