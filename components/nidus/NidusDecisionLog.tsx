"use client";

import type { NidusDecisionLogEntry } from "@/types/nidusCaseStudy";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/nidus.module.css";

interface NidusDecisionLogProps {
  entries: NidusDecisionLogEntry[];
}

export default function NidusDecisionLog({ entries }: NidusDecisionLogProps) {
  const { t } = useLanguage();

  return (
    <ol className={styles.decisionLog}>
      {entries.map((entry, index) => (
        // date is niet gegarandeerd uniek (meerdere beslissingen per dag),
        // dus combineren met index voor een stabiele key.
        <li key={`${entry.date}-${index}`} className={styles.decisionEntry}>
          <span className={styles.decisionMarker} aria-hidden="true" />
          <time className={styles.decisionDate} dateTime={entry.date}>
            {entry.date}
          </time>
          <h3 className={styles.decisionTitle}>{t(entry.title)}</h3>
          <p className={styles.decisionDescription}>{t(entry.description)}</p>
        </li>
      ))}
    </ol>
  );
}
