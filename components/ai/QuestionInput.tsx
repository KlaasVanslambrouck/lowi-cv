"use client";

import type { FormEvent } from "react";
import type { EvalCase } from "@/lib/ai/types";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "./AIEngineeringPlayground.module.css";

interface QuestionInputProps {
  questions: EvalCase[];
  selectedQuestionId: string | null;
  customQuestion: string;
  isRunning: boolean;
  onExampleSelect: (questionId: string) => void;
  onCustomQuestionChange: (question: string) => void;
  onCustomSubmit: (question: string) => void;
}

const labels = {
  examples: {
    nl: "Voorbeeldvragen",
    en: "Example questions",
  },
  custom: {
    nl: "Eigen vraag",
    en: "Custom question",
  },
  placeholder: {
    nl: "Stel een vraag over deze portfolio...",
    en: "Ask a question about this portfolio...",
  },
  run: {
    nl: "Zoek",
    en: "Run",
  },
};

export default function QuestionInput({
  questions,
  selectedQuestionId,
  customQuestion,
  isRunning,
  onExampleSelect,
  onCustomQuestionChange,
  onCustomSubmit,
}: QuestionInputProps) {
  const { t } = useLanguage();
  const trimmedQuestion = customQuestion.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedQuestion.length === 0 || isRunning) return;
    onCustomSubmit(trimmedQuestion);
  }

  return (
    <form className={styles.questionForm} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <span className={styles.label}>{t(labels.examples)}</span>
        <div className={styles.exampleGrid}>
          {questions.map((question) => {
            const isActive = selectedQuestionId === question.id;
            return (
              <button
                key={question.id}
                type="button"
                className={
                  isActive
                    ? `${styles.exampleButton} ${styles.exampleButtonActive}`
                    : styles.exampleButton
                }
                aria-pressed={isActive}
                onClick={() => onExampleSelect(question.id)}
                disabled={isRunning}
              >
                {t(question.question)}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="ai-custom-question">
          {t(labels.custom)}
        </label>
        <span className={styles.customRow}>
          <input
            id="ai-custom-question"
            className={styles.customInput}
            type="text"
            value={customQuestion}
            placeholder={t(labels.placeholder)}
            onChange={(event) => onCustomQuestionChange(event.target.value)}
            disabled={isRunning}
          />
          <button
            type="submit"
            className={styles.submitButton}
            disabled={trimmedQuestion.length === 0 || isRunning}
          >
            {t(labels.run)}
          </button>
        </span>
      </div>
    </form>
  );
}
