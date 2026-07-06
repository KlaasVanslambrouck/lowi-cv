"use client";

import type { JarvisPlaceholderMessage, UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

interface JarvisTerminalProps {
  messages: JarvisPlaceholderMessage[];
  labels: UILabels;
}

// Placeholder-terminal. TODO: in een latere stap wordt dit een echte chat
// via de publieke, read-only endpoint van nidus-api (NEXT_PUBLIC_NIDUS_API_URL).
export default function JarvisTerminal({
  messages,
  labels,
}: JarvisTerminalProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className={styles.terminal}>
        <div className={styles.terminalHeader}>
          <div className={styles.terminalDots} aria-hidden="true">
            <span className={styles.terminalDot} />
            <span className={styles.terminalDot} />
            <span className={styles.terminalDot} />
          </div>
          <span className={styles.terminalTitle}>
            {labels.jarvisTerminalTitle}
          </span>
        </div>
        <div className={styles.terminalBody} role="log">
          {messages.map((message, index) => (
            <p
              key={index}
              className={
                message.role === "jarvis"
                  ? `${styles.terminalMessage} ${styles.terminalJarvis}`
                  : `${styles.terminalMessage} ${styles.terminalUser}`
              }
            >
              <span className={styles.terminalPromptSymbol} aria-hidden="true">
                {message.role === "jarvis" ? "⟩⟩" : "$"}
              </span>
              <span>{t(message.text)}</span>
            </p>
          ))}
        </div>
        <div className={styles.terminalInputRow}>
          <span className={styles.terminalCaret} aria-hidden="true" />
          {/* Bewust disabled: de echte chat komt pas na de nidus-api-koppeling */}
          <input
            type="text"
            className={styles.terminalInput}
            placeholder={t(labels.jarvisInputPlaceholder)}
            aria-label={t(labels.jarvisInputPlaceholder)}
            disabled
          />
        </div>
      </div>
      <p className={styles.terminalNote}>{t(labels.jarvisNote)}</p>
    </div>
  );
}
