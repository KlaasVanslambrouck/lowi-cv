"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import type { Bilingual } from "@/types/content";
import styles from "./JarvisAsk.module.css";

interface JarvisAskProps {
  placement?: "floating" | "inline";
}

interface JarvisSuccessResponse {
  answer: string;
  suggestedQuestions: string[];
}

type RequestStatus = "idle" | "loading" | "success" | "error";

const JARVIS_ENDPOINT_PATH = "/api/portfolio/jarvis";

const copy = {
  openButton: {
    nl: "Vraag over mijn werk",
    en: "Ask about my work",
  },
  panelTitle: {
    nl: "Vraag Jarvis",
    en: "Ask Jarvis",
  },
  panelStatus: {
    nl: "grounded Q&A",
    en: "grounded Q&A",
  },
  starterLabel: {
    nl: "Startvragen",
    en: "Starter questions",
  },
  inputLabel: {
    nl: "Je vraag",
    en: "Your question",
  },
  inputPlaceholder: {
    nl: "Stel een vraag over ervaring, projecten of LOWI...",
    en: "Ask about experience, projects or LOWI...",
  },
  submit: {
    nl: "Vraag",
    en: "Ask",
  },
  loading: {
    nl: "Jarvis zoekt in de portfolio-context...",
    en: "Jarvis is searching the portfolio context...",
  },
  missingSession: {
    nl: "Ik kan geen tijdelijke sessie starten in deze browser. Probeer opnieuw in een normale browsersessie.",
    en: "I cannot start a temporary session in this browser. Try again in a regular browser session.",
  },
  missingConfig: {
    nl: "Jarvis is nog niet gekoppeld aan de Nidus API.",
    en: "Jarvis is not connected to the Nidus API yet.",
  },
  rateLimit: {
    nl: "Te veel vragen in korte tijd. Probeer later opnieuw.",
    en: "Too many questions in a short time. Please try again later.",
  },
  genericError: {
    nl: "Jarvis kon nu geen antwoord ophalen. Probeer straks opnieuw.",
    en: "Jarvis could not fetch an answer right now. Please try again shortly.",
  },
  invalidResponse: {
    nl: "Jarvis gaf een onverwacht antwoord terug. De koppeling moet nog even nagekeken worden.",
    en: "Jarvis returned an unexpected response. The connection needs a quick check.",
  },
  answerLabel: {
    nl: "Antwoord",
    en: "Answer",
  },
  questionLabel: {
    nl: "Vraag",
    en: "Question",
  },
  followUpLabel: {
    nl: "Verder vragen",
    en: "Follow up",
  },
  contactPrompt: {
    nl: "Vragen over een rol?",
    en: "Questions about a role?",
  },
  contactLink: {
    nl: "Contact",
    en: "Contact",
  },
  close: {
    nl: "Sluit Jarvis",
    en: "Close Jarvis",
  },
} satisfies Record<string, Bilingual>;

const starterQuestions: Bilingual[] = [
  {
    nl: "Wat bouwde Klaas in Nidus?",
    en: "What did Klaas build in Nidus?",
  },
  {
    nl: "Is hij open voor nieuwe rollen?",
    en: "Is he open to new roles?",
  },
  {
    nl: "Vat zijn ervaring samen.",
    en: "Summarize his experience.",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readAnswer(payload: Record<string, unknown>): string | null {
  const answer = payload.answer;
  if (typeof answer === "string") return answer;

  if (isRecord(answer) && typeof answer.text === "string") {
    return answer.text;
  }

  return null;
}

function readSuggestedQuestions(payload: Record<string, unknown>): string[] {
  const suggestions = payload.suggestedQuestions;
  if (!Array.isArray(suggestions)) return [];

  return suggestions.filter(
    (suggestion): suggestion is string =>
      typeof suggestion === "string" && suggestion.trim().length > 0
  );
}

function parseJarvisResponse(payload: unknown): JarvisSuccessResponse | null {
  if (!isRecord(payload)) return null;

  const answer = readAnswer(payload);
  if (answer === null) return null;

  return {
    answer,
    suggestedQuestions: readSuggestedQuestions(payload),
  };
}

function jarvisEndpoint(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_NIDUS_API_URL?.trim();
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/+$/, "")}${JARVIS_ENDPOINT_PATH}`;
}

export default function JarvisAsk({ placement = "floating" }: JarvisAskProps) {
  const { t } = useLanguage();
  const sessionId = useAnalyticsSession();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function askJarvis(question: string) {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || status === "loading") return;

    const endpoint = jarvisEndpoint();
    if (endpoint === null) {
      setStatus("error");
      setAnswer(null);
      setSuggestedQuestions([]);
      setErrorMessage(t(copy.missingConfig));
      return;
    }

    if (sessionId === null) {
      setStatus("error");
      setAnswer(null);
      setSuggestedQuestions([]);
      setErrorMessage(t(copy.missingSession));
      return;
    }

    setStatus("loading");
    setLastQuestion(normalizedQuestion);
    setAnswer(null);
    setSuggestedQuestions([]);
    setErrorMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: normalizedQuestion,
          sessionId,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          response.status === 429 ? t(copy.rateLimit) : t(copy.genericError)
        );
        return;
      }

      const payload: unknown = await response.json();
      const parsed = parseJarvisResponse(payload);
      if (parsed === null) {
        setStatus("error");
        setErrorMessage(t(copy.invalidResponse));
        return;
      }

      setAnswer(parsed.answer);
      setSuggestedQuestions(parsed.suggestedQuestions);
      setInput("");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(t(copy.genericError));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askJarvis(input);
  }

  function handleQuestionChip(question: string) {
    setInput(question);
    void askJarvis(question);
  }

  const rootClassName =
    placement === "floating"
      ? `${styles.root} ${styles.rootFloating}`
      : `${styles.root} ${styles.rootInline}`;
  const questions =
    suggestedQuestions.length > 0
      ? suggestedQuestions
      : starterQuestions.map((question) => t(question));

  return (
    <div className={rootClassName}>
      <button
        type="button"
        className={styles.openButton}
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
      >
        <span className={styles.openButtonDot} aria-hidden="true" />
        {t(copy.openButton)}
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className={styles.scrim}
            onClick={() => setIsOpen(false)}
            aria-label={t(copy.close)}
          />
          <aside className={styles.panel} role="dialog" aria-labelledby={titleId}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelStatus}>{t(copy.panelStatus)}</p>
                <h2 id={titleId} className={styles.panelTitle}>
                  {t(copy.panelTitle)}
                </h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label={t(copy.close)}
              >
                x
              </button>
            </div>

            <div className={styles.questionChips} aria-label={t(copy.starterLabel)}>
              {questions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className={styles.questionChip}
                  onClick={() => handleQuestionChip(question)}
                  disabled={status === "loading"}
                >
                  {question}
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.inputLabel} htmlFor={`${titleId}-input`}>
                {t(copy.inputLabel)}
              </label>
              <div className={styles.inputRow}>
                <input
                  ref={inputRef}
                  id={`${titleId}-input`}
                  className={styles.input}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t(copy.inputPlaceholder)}
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={status === "loading" || input.trim().length === 0}
                >
                  {t(copy.submit)}
                </button>
              </div>
            </form>

            <div className={styles.answerArea} aria-live="polite">
              {status === "idle" ? null : (
                <>
                  {lastQuestion ? (
                    <div className={styles.questionBlock}>
                      <p className={styles.blockLabel}>{t(copy.questionLabel)}</p>
                      <p>{lastQuestion}</p>
                    </div>
                  ) : null}

                  {status === "loading" ? (
                    <p className={styles.loadingText}>{t(copy.loading)}</p>
                  ) : null}

                  {status === "error" && errorMessage ? (
                    <p className={styles.errorText}>{errorMessage}</p>
                  ) : null}

                  {status === "success" && answer ? (
                    <div className={styles.answerBlock}>
                      <p className={styles.blockLabel}>{t(copy.answerLabel)}</p>
                      <p>{answer}</p>
                    </div>
                  ) : null}

                  {status === "success" && suggestedQuestions.length > 0 ? (
                    <div className={styles.followUpBlock}>
                      <p className={styles.blockLabel}>{t(copy.followUpLabel)}</p>
                      <div className={styles.followUpChips}>
                        {suggestedQuestions.map((question) => (
                          <button
                            key={question}
                            type="button"
                            className={styles.followUpChip}
                            onClick={() => handleQuestionChip(question)}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <p className={styles.contactPrompt}>
                    {t(copy.contactPrompt)}{" "}
                    <a
                      className={styles.contactLink}
                      href="#contact"
                      onClick={() => setIsOpen(false)}
                    >
                      {t(copy.contactLink)}
                    </a>
                  </p>
                </>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
