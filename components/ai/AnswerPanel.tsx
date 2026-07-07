"use client";

import type { Language } from "@/context/LanguageContext";
import type { GroundedAnswer } from "@/lib/ai/answers";
import type { KnowledgeChunk } from "@/lib/ai/types";
import styles from "./AIEngineeringPlayground.module.css";

interface AnswerPanelProps {
  answer: GroundedAnswer;
  chunksById: Map<string, KnowledgeChunk>;
  language: Language;
  onSourceSelect: (chunkId: string) => void;
}

const responseTypeLabels = {
  "pre-authored": {
    nl: "Pre-authored grounded response - vooraf opgesteld, brongebonden antwoord",
    en: "Pre-authored grounded response",
  },
  template: {
    nl: "Template-based response - samengesteld uit bronfragmenten",
    en: "Template-based response",
  },
};

export default function AnswerPanel({
  answer,
  chunksById,
  language,
  onSourceSelect,
}: AnswerPanelProps) {
  return (
    <div className={styles.answerPanel}>
      <span className={styles.responseType}>
        {responseTypeLabels[answer.responseType][language]}
      </span>

      <p className={styles.answerText}>{answer.text[language]}</p>

      <div className={styles.sourceButtons}>
        {answer.sourceChunkIds.map((chunkId) => {
          const chunk = chunksById.get(chunkId);
          return (
            <button
              key={chunkId}
              type="button"
              className={styles.sourceButton}
              onClick={() => onSourceSelect(chunkId)}
            >
              {chunk ? chunk.title[language] : chunkId}
            </button>
          );
        })}
      </div>
    </div>
  );
}
