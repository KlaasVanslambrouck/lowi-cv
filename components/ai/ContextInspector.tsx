"use client";

import type { Language } from "@/context/LanguageContext";
import type { KnowledgeChunk } from "@/lib/ai/types";
import styles from "./AIEngineeringPlayground.module.css";

interface ContextInspectorProps {
  chunks: KnowledgeChunk[];
  language: Language;
}

function estimateSize(chunks: KnowledgeChunk[], language: Language) {
  const assembled = chunks
    .map((chunk) => `${chunk.title[language]}\n${chunk.content[language]}`)
    .join("\n\n");
  const words = assembled.split(/\s+/).filter(Boolean).length;
  return { characters: assembled.length, words };
}

export default function ContextInspector({
  chunks,
  language,
}: ContextInspectorProps) {
  const size = estimateSize(chunks, language);

  if (chunks.length === 0) {
    return (
      <p className={styles.emptyState}>
        {language === "nl"
          ? "Geen context geselecteerd."
          : "No context selected."}
      </p>
    );
  }

  return (
    <div className={styles.contextWindow}>
      <p className={styles.contextSize}>
        {language === "nl"
          ? `Geschatte grootte: ${size.characters} tekens / ${size.words} woorden (benadering).`
          : `Estimated size: ${size.characters} characters / ${size.words} words (approximation).`}
      </p>
      <ol className={styles.contextList}>
        {chunks.map((chunk, index) => (
          <li key={chunk.id} className={styles.contextItem}>
            <div className={styles.contextHeader}>
              <h4 className={styles.contextTitle}>
                {String(index + 1).padStart(2, "0")} {chunk.title[language]}
              </h4>
              <span className={styles.sourceType}>{chunk.sourceType}</span>
            </div>
            <p className={styles.contextContent}>{chunk.content[language]}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
