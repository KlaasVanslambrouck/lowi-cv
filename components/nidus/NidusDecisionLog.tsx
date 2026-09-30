"use client";

import { useRef } from "react";
import type { NidusDecisionLogEntry } from "@/types/nidusCaseStudy";
import HighlightPhrase from "@/components/sketch/HighlightPhrase";
import { SketchScope } from "@/components/sketch/SketchScope";
import Strike from "@/components/sketch/Strike";
import {
  NIDUS_DECISION_STRIKES,
  NIDUS_HIGHLIGHTS,
} from "@/components/nidus/nidusRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import { useSketchReveal } from "@/hooks/useSketchReveal";
import styles from "@/styles/nidus.module.css";

interface NidusDecisionLogProps {
  entries: NidusDecisionLogEntry[];
}

// Elke beslissing tekent haar eigen accenten wanneer ze in beeld komt.
function DecisionEntry({ entry }: { entry: NidusDecisionLogEntry }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLLIElement>(null);
  const sketchState = useSketchReveal(ref);
  const description = t(entry.description);
  const highlight = NIDUS_HIGHLIGHTS.decisions
    .map((phrase) => t(phrase))
    .find((phrase) => description.includes(phrase));
  const strike = NIDUS_DECISION_STRIKES[entry.title.nl];

  return (
    <li ref={ref} className={styles.decision}>
      <SketchScope state={sketchState}>
        <div className={styles.decisionMeta}>
          <time className={styles.decisionDate} dateTime={entry.date}>
            {entry.date}
          </time>
          {strike ? (
            <Strike
              className={styles.decisionStrike}
              delay={2}
              to={
                <>
                  <span aria-hidden="true">→ </span>
                  {strike.to}
                </>
              }
            >
              {strike.from}
            </Strike>
          ) : null}
        </div>
        <div className={styles.decisionBody}>
          <h3 className={styles.decisionTitle}>{t(entry.title)}</h3>
          <p className={styles.decisionDescription}>
            <HighlightPhrase text={description} phrase={highlight} delay={1} />
          </p>
        </div>
      </SketchScope>
    </li>
  );
}

export default function NidusDecisionLog({ entries }: NidusDecisionLogProps) {
  return (
    <ol className={styles.decisionLog}>
      {entries.map((entry, index) => (
        // date is niet gegarandeerd uniek (meerdere beslissingen per dag),
        // dus combineren met index voor een stabiele key.
        <DecisionEntry key={`${entry.date}-${index}`} entry={entry} />
      ))}
    </ol>
  );
}
