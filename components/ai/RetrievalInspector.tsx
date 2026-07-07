"use client";

import { useEffect, useRef } from "react";
import type { Language } from "@/context/LanguageContext";
import type {
  KnowledgeChunk,
  KnowledgeSourceType,
  RetrievalResult,
} from "@/lib/ai/types";
import styles from "./AIEngineeringPlayground.module.css";

interface RetrievalInspectorProps {
  results: RetrievalResult[];
  chunksById: Map<string, KnowledgeChunk>;
  language: Language;
  highlightedChunkId: string | null;
}

const sourceTypeLabels: Record<
  KnowledgeSourceType,
  { nl: string; en: string }
> = {
  experience: { nl: "ervaring", en: "experience" },
  project: { nl: "project", en: "project" },
  skill: { nl: "skill", en: "skill" },
  education: { nl: "opleiding", en: "education" },
  architecture: { nl: "architectuur", en: "architecture" },
  system: { nl: "systeem", en: "system" },
};

export default function RetrievalInspector({
  results,
  chunksById,
  language,
  highlightedChunkId,
}: RetrievalInspectorProps) {
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!highlightedChunkId) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    itemRefs.current[highlightedChunkId]?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [highlightedChunkId]);

  if (results.length === 0) {
    return (
      <p className={styles.emptyState}>
        {language === "nl"
          ? "Geen resultaten gevonden met keyword-gebaseerde lokale retrieval."
          : "No results found with keyword-based local retrieval."}
      </p>
    );
  }

  return (
    <div className={styles.resultList}>
      {results.map((result, index) => {
        const chunk = chunksById.get(result.chunkId);
        if (!chunk) return null;

        const tierSummary =
          result.matchBreakdown
            ?.map((match) => `${match.tier}:${match.term}`)
            .join(", ") ?? "-";

        return (
          <article
            key={result.chunkId}
            ref={(element) => {
              itemRefs.current[result.chunkId] = element;
            }}
            className={
              highlightedChunkId === result.chunkId
                ? `${styles.resultItem} ${styles.resultItemHighlighted}`
                : styles.resultItem
            }
          >
            <div className={styles.resultHeader}>
              <div>
                <span className={styles.rankBadge}>#{index + 1}</span>
                <h4 className={styles.resultTitle}>{chunk.title[language]}</h4>
              </div>
              <span className={styles.sourceType}>
                {sourceTypeLabels[chunk.sourceType][language]}
              </span>
            </div>

            <div className={styles.scoreGrid}>
              <span className={styles.metric}>
                <span className={styles.metricLabel}>
                  {language === "nl" ? "Berekende score" : "Computed score"}
                </span>
                <span className={styles.metricValue}>
                  {String(result.score)}
                </span>
              </span>
              <span className={styles.metric}>
                <span className={styles.metricLabel}>
                  {language === "nl" ? "Matched terms" : "Matched terms"}
                </span>
                <span className={styles.metricValue}>
                  {result.matchedTerms.length}
                </span>
              </span>
              <span className={styles.metric}>
                <span className={styles.metricLabel}>
                  {language === "nl" ? "Score-breakdown" : "Score breakdown"}
                </span>
                <span className={styles.metricValue}>{tierSummary}</span>
              </span>
            </div>

            <div
              className={styles.chipList}
              aria-label={
                language === "nl" ? "gematchte termen" : "matched terms"
              }
            >
              {result.matchedTerms.map((term) => (
                <span key={term} className={styles.matchedTerm}>
                  {term}
                </span>
              ))}
            </div>

            <p className={styles.reason}>{result.reason[language]}</p>
          </article>
        );
      })}
    </div>
  );
}
