"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type {
  LinguixCriterionKey,
  LinguixCriterionScore,
  LinguixEscalationCode,
  LinguixExamplesResponse,
  LinguixProvisionalJudgement,
  LinguixScoreRequest,
  LinguixScoreResponse,
} from "@/types/linguix";
import styles from "./SchrijfScorer.module.css";

const baseUrl = process.env.NEXT_PUBLIC_NIDUS_API_URL?.trim();
const apiBaseUrl = baseUrl?.replace(/\/+$/, "") ?? "";
const examplesEndpoint = `${apiBaseUrl}/api/portfolio/linguix/voorbeelden`;
const scoreEndpoint = `${apiBaseUrl}/api/portfolio/linguix/score`;

const criterionKeys: readonly LinguixCriterionKey[] = [
  "taakvervulling",
  "samenhang",
  "woordenschat",
  "grammatica",
  "spelling",
];

const rubricScores = ["0", "1", "2", "3", "4"] as const;

const escalationCodes: readonly LinguixEscalationCode[] = [
  "ONZEKERHEIDSMARGE",
  "SPREIDING",
  "LENGTE_BUITEN_BEREIK",
  "DEKKINGSREGEL_GERAAKT",
  "CRITERIUM_NIET_TOEPASBAAR",
];

const provisionalJudgementLabels: Readonly<
  Record<LinguixProvisionalJudgement, string>
> = {
  geslaagd: "Geslaagd",
  nietGeslaagd: "Niet geslaagd",
  onbeslist: "Onbeslist",
};

type ExamplesStatus = "loading" | "ready" | "error";
type ScoreStatus = "idle" | "loading" | "success" | "error";

interface EvidenceRange {
  start: number;
  end: number;
  criterionKey: LinguixCriterionKey;
  explanation: string;
}

interface CandidateTextSegment {
  start: number;
  end: number;
  text: string;
  criterionKeys: readonly LinguixCriterionKey[];
  explanations: readonly string[];
}

interface SchrijfScorerProps {
  /**
   * Presentatiemodus: een derde minder padding en marge, geen eigen kop of
   * omkadering, de examentaak inklapbaar, en kandidaattekst en resultaat naast
   * elkaar met elk een eigen interne scroll — die tekst is de inhoud die de
   * spreker doorloopt, dus daar is scrollen wél gewenst.
   */
  compact?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return isUnknownArray(value) && value.every((item) => typeof item === "string");
}

function isDescriptorRecord(
  value: unknown,
): value is Readonly<Record<(typeof rubricScores)[number], string>> {
  return (
    isRecord(value) &&
    rubricScores.every((score) => typeof value[score] === "string")
  );
}

function isCriterionKey(value: unknown): value is LinguixCriterionKey {
  return (
    typeof value === "string" &&
    criterionKeys.includes(value as LinguixCriterionKey)
  );
}

function isEscalationCode(value: unknown): value is LinguixEscalationCode {
  return (
    typeof value === "string" &&
    escalationCodes.includes(value as LinguixEscalationCode)
  );
}

function isProvisionalJudgement(
  value: unknown,
): value is LinguixProvisionalJudgement {
  return (
    value === "geslaagd" || value === "nietGeslaagd" || value === "onbeslist"
  );
}

function hasStringProperties(
  value: Record<string, unknown>,
  properties: readonly string[],
): boolean {
  return properties.every((property) => typeof value[property] === "string");
}

function isExamplesResponse(value: unknown): value is LinguixExamplesResponse {
  if (!isRecord(value)) return false;

  const examTask = value.examentaak;
  const rubric = value.beoordelingswijzer;
  const examples = value.voorbeelden;

  if (!isRecord(examTask) || !isRecord(rubric) || !isUnknownArray(examples)) {
    return false;
  }

  if (
    !hasStringProperties(examTask, [
      "taakId",
      "niveau",
      "type",
      "situatie",
      "opdracht",
      "slotinstructie",
    ]) ||
    !isFiniteNumber(examTask.tijdMinuten) ||
    !isStringArray(examTask.deelopdrachten) ||
    !isRecord(examTask.richtlengte) ||
    !isFiniteNumber(examTask.richtlengte.minimumWoorden) ||
    !isFiniteNumber(examTask.richtlengte.maximumWoorden)
  ) {
    return false;
  }

  if (
    typeof rubric.id !== "string" ||
    !isFiniteNumber(rubric.maxScore) ||
    !isFiniteNumber(rubric.slaaggrens) ||
    !isUnknownArray(rubric.criteria) ||
    !isRecord(rubric.dekkingsregel) ||
    !isCriterionKey(rubric.dekkingsregel.criterium) ||
    !isFiniteNumber(rubric.dekkingsregel.minimumScore) ||
    rubric.dekkingsregel.oordeelBijLagereScore !== "nietGeslaagd" ||
    typeof rubric.dekkingsregel.toelichting !== "string" ||
    !isUnknownArray(rubric.escalatieCodes) ||
    !rubric.escalatieCodes.every(isEscalationCode) ||
    !isRecord(rubric.escalatiedrempels)
  ) {
    return false;
  }

  const thresholds = rubric.escalatiedrempels;
  if (
    !isRecord(thresholds.onzekerheidsmarge) ||
    !isFiniteNumber(thresholds.onzekerheidsmarge.minimumGewogenScore) ||
    !isFiniteNumber(thresholds.onzekerheidsmarge.maximumGewogenScore) ||
    !isRecord(thresholds.spreiding) ||
    !isFiniteNumber(thresholds.spreiding.minimumVerschil) ||
    !isRecord(thresholds.lengte) ||
    !isFiniteNumber(thresholds.lengte.minimumWoorden) ||
    !isFiniteNumber(thresholds.lengte.maximumWoorden) ||
    !isRecord(thresholds.dekkingsregelGeraakt) ||
    !isFiniteNumber(
      thresholds.dekkingsregelGeraakt.maximumTaakvervullingScore,
    )
  ) {
    return false;
  }

  const hasValidCriteria = rubric.criteria.every(
    (criterion) =>
      isRecord(criterion) &&
      isCriterionKey(criterion.sleutel) &&
      typeof criterion.label === "string" &&
      isFiniteNumber(criterion.gewicht) &&
      isDescriptorRecord(criterion.descriptoren),
  );

  const hasValidExamples = examples.every(
    (example) =>
      isRecord(example) &&
      hasStringProperties(example, [
        "id",
        "label",
        "kandidaat",
        "kandidaatTekst",
      ]) &&
      isFiniteNumber(example.verwachtAantalWoorden),
  );

  return hasValidCriteria && examples.length >= 2 && hasValidExamples;
}

function isCriterionScore(value: unknown): value is LinguixCriterionScore {
  if (!isRecord(value) || !isUnknownArray(value.bewijs)) return false;

  return (
    isCriterionKey(value.sleutel) &&
    hasStringProperties(value, ["label", "motivering"]) &&
    isFiniteNumber(value.score) &&
    isFiniteNumber(value.maxScore) &&
    isFiniteNumber(value.gewicht) &&
    value.bewijs.every(
      (evidence) =>
        isRecord(evidence) &&
        hasStringProperties(evidence, ["fragment", "toelichting"]),
    )
  );
}

function isScoreResponse(value: unknown): value is LinguixScoreResponse {
  if (!isRecord(value) || !isUnknownArray(value.criteria)) return false;

  return (
    typeof value.taakId === "string" &&
    isFiniteNumber(value.aantalWoorden) &&
    value.criteria.every(isCriterionScore) &&
    isFiniteNumber(value.gewogenScore) &&
    isFiniteNumber(value.slaaggrens) &&
    isProvisionalJudgement(value.voorlopigOordeel) &&
    isFiniteNumber(value.confidence) &&
    typeof value.menselijkeReviewVereist === "boolean" &&
    isUnknownArray(value.escalatieRedenen) &&
    value.escalatieRedenen.every(
      (reason) =>
        isRecord(reason) &&
        isEscalationCode(reason.code) &&
        typeof reason.toelichting === "string",
    )
  );
}

function countWords(text: string): number {
  const normalizedText = text.trim();
  return normalizedText ? normalizedText.split(/\s+/u).length : 0;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("nl-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatWeight(value: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildCandidateTextSegments(
  candidateText: string,
  criteria: readonly LinguixCriterionScore[],
): readonly CandidateTextSegment[] {
  const evidenceRanges: EvidenceRange[] = [];

  criteria.forEach((criterion) => {
    criterion.bewijs.forEach((evidence) => {
      if (!evidence.fragment) return;

      const start = candidateText.indexOf(evidence.fragment);
      if (start < 0) return;

      evidenceRanges.push({
        start,
        end: start + evidence.fragment.length,
        criterionKey: criterion.sleutel,
        explanation: evidence.toelichting,
      });
    });
  });

  if (evidenceRanges.length === 0) {
    return [
      {
        start: 0,
        end: candidateText.length,
        text: candidateText,
        criterionKeys: [],
        explanations: [],
      },
    ];
  }

  const boundaries = new Set<number>([0, candidateText.length]);
  evidenceRanges.forEach((range) => {
    boundaries.add(range.start);
    boundaries.add(range.end);
  });

  const sortedBoundaries = Array.from(boundaries).sort(
    (left, right) => left - right,
  );

  return sortedBoundaries.slice(0, -1).map((start, index) => {
    const end = sortedBoundaries[index + 1];
    const matchingRanges = evidenceRanges.filter(
      (range) => range.start <= start && range.end >= end,
    );

    return {
      start,
      end,
      text: candidateText.slice(start, end),
      criterionKeys: Array.from(
        new Set(matchingRanges.map((range) => range.criterionKey)),
      ),
      explanations: Array.from(
        new Set(matchingRanges.map((range) => range.explanation)),
      ),
    };
  });
}

function TaskSkeleton() {
  return (
    <div className={styles.taskSkeleton} aria-label="Examentaak laden">
      <span className={styles.skeletonLineShort} />
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLine} />
      <span className={styles.skeletonLineMedium} />
    </div>
  );
}

function ScoreSkeleton() {
  return (
    <div className={styles.scoreSkeleton} aria-label="Beoordeling laden">
      <span className={styles.skeletonBlock} />
      {criterionKeys.map((criterionKey) => (
        <span key={criterionKey} className={styles.skeletonScoreRow} />
      ))}
      <span className={styles.skeletonSummary} />
    </div>
  );
}

export default function SchrijfScorer({ compact = false }: SchrijfScorerProps) {
  const [examplesStatus, setExamplesStatus] =
    useState<ExamplesStatus>("loading");
  const [examplesData, setExamplesData] =
    useState<LinguixExamplesResponse | null>(null);
  const [candidateText, setCandidateText] = useState("");
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [scoreStatus, setScoreStatus] = useState<ScoreStatus>("idle");
  const [scoreResult, setScoreResult] = useState<LinguixScoreResponse | null>(
    null,
  );
  const [hoveredCriterionKey, setHoveredCriterionKey] =
    useState<LinguixCriterionKey | null>(null);
  const [pinnedCriterionKey, setPinnedCriterionKey] =
    useState<LinguixCriterionKey | null>(null);
  const scoreAbortControllerRef = useRef<AbortController | null>(null);
  const scoreRequestVersionRef = useRef(0);

  const loadExamples = useCallback(async (signal?: AbortSignal) => {
    setExamplesStatus("loading");

    try {
      const response = await fetch(examplesEndpoint, { signal });
      if (!response.ok) throw new Error("Examples request failed");

      const payload: unknown = await response.json();
      if (!isExamplesResponse(payload)) {
        throw new Error("Unexpected examples response");
      }

      setExamplesData(payload);
      setExamplesStatus("ready");
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      setExamplesStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadExamples(controller.signal);

    return () => controller.abort();
  }, [loadExamples]);

  useEffect(
    () => () => {
      scoreAbortControllerRef.current?.abort();
    },
    [],
  );

  const wordCount = useMemo(() => countWords(candidateText), [candidateText]);
  const activeCriterionKey = hoveredCriterionKey ?? pinnedCriterionKey;
  const candidateTextSegments = useMemo(
    () =>
      scoreResult
        ? buildCandidateTextSegments(candidateText, scoreResult.criteria)
        : [],
    [candidateText, scoreResult],
  );

  const clearScore = useCallback(() => {
    scoreRequestVersionRef.current += 1;
    scoreAbortControllerRef.current?.abort();
    scoreAbortControllerRef.current = null;
    setScoreStatus("idle");
    setScoreResult(null);
    setHoveredCriterionKey(null);
    setPinnedCriterionKey(null);
  }, []);

  const handleCandidateTextChange = (nextText: string) => {
    clearScore();
    setSelectedExampleId(null);
    setCandidateText(nextText);
  };

  const handleExampleSelect = (exampleId: string) => {
    const example = examplesData?.voorbeelden.find(
      (candidateExample) => candidateExample.id === exampleId,
    );
    if (!example) return;

    clearScore();
    setSelectedExampleId(example.id);
    setCandidateText(example.kandidaatTekst);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!examplesData || !candidateText.trim()) return;

    scoreAbortControllerRef.current?.abort();
    const controller = new AbortController();
    const requestVersion = scoreRequestVersionRef.current + 1;
    scoreAbortControllerRef.current = controller;
    scoreRequestVersionRef.current = requestVersion;
    setScoreStatus("loading");
    setScoreResult(null);
    setHoveredCriterionKey(null);
    setPinnedCriterionKey(null);

    const requestBody: LinguixScoreRequest = {
      taakId: examplesData.examentaak.taakId,
      kandidaatTekst: candidateText,
      beoordelingswijzerId: examplesData.beoordelingswijzer.id,
    };

    try {
      const response = await fetch(scoreEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Score request failed");

      const payload: unknown = await response.json();
      if (!isScoreResponse(payload)) {
        throw new Error("Unexpected score response");
      }

      if (payload.taakId !== requestBody.taakId) {
        throw new Error("Unexpected task identifier");
      }

      if (scoreRequestVersionRef.current !== requestVersion) return;
      setScoreResult(payload);
      setScoreStatus("success");
    } catch (error: unknown) {
      if (scoreRequestVersionRef.current !== requestVersion) return;
      if (error instanceof Error && error.name === "AbortError") return;
      setScoreStatus("error");
    } finally {
      if (scoreRequestVersionRef.current === requestVersion) {
        scoreAbortControllerRef.current = null;
      }
    }
  };

  const handleCriterionClick = (criterionKey: LinguixCriterionKey) => {
    setPinnedCriterionKey((currentKey) =>
      currentKey === criterionKey ? null : criterionKey,
    );
  };

  const taakKop = (
    <div className={styles.taskHeader}>
      <p className={styles.columnLabel}>Examentaak</p>
      {examplesData ? (
        <span className={styles.taskMeta}>
          {examplesData.examentaak.niveau} ·{" "}
          {examplesData.examentaak.tijdMinuten} min
        </span>
      ) : null}
    </div>
  );

  const taakInhoud =
    examplesStatus === "loading" && !examplesData ? (
      <TaskSkeleton />
    ) : examplesData ? (
      <div className={styles.taskContent}>
        <p id="exam-task-title" className={styles.taskSituation}>
          {examplesData.examentaak.situatie}
        </p>
        <p className={styles.taskInstruction}>
          {examplesData.examentaak.opdracht}
        </p>
        <ol className={styles.subtasks}>
          {examplesData.examentaak.deelopdrachten.map((subtask) => (
            <li key={subtask}>{subtask}</li>
          ))}
        </ol>
        <p className={styles.taskClosing}>
          {examplesData.examentaak.slotinstructie}
        </p>
      </div>
    ) : (
      <div className={styles.taskError} role="status">
        <p>De examentaak kon niet worden geladen.</p>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => void loadExamples()}
        >
          Opnieuw proberen
        </button>
      </div>
    );

  return (
    <section
      className={`${styles.scorer} ${compact ? styles.scorerCompact : ""}`}
      aria-labelledby={compact ? undefined : "schrijfscorer-title"}
      aria-label={compact ? "Schrijfscorer" : undefined}
    >
      {compact ? null : (
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Interactieve demonstratie</p>
            <h3 id="schrijfscorer-title" className={styles.title}>
              Schrijfscorer
            </h3>
          </div>
          <p className={styles.headerNote}>
            De beoordelingswijzer is demonstratief en niet door de klant
            gevalideerd.
          </p>
        </header>
      )}

      <div className={styles.columns}>
        <form className={styles.inputColumn} onSubmit={handleSubmit}>
          <section
            className={styles.taskCard}
            aria-labelledby={compact ? undefined : "exam-task-title"}
            aria-label={compact ? "Examentaak" : undefined}
          >
            {compact ? (
              // Ingeklapt begint de taak: de slide vertelt al waar het over
              // gaat, en de spreker klapt hem alleen open als iemand ernaar
              // vraagt.
              <details className={styles.taakInklapbaar}>
                <summary className={styles.taakSamenvatting}>{taakKop}</summary>
                {taakInhoud}
              </details>
            ) : (
              <>
                {taakKop}
                {taakInhoud}
              </>
            )}
          </section>

          <div className={styles.exampleButtons} aria-label="Voorbeeldteksten">
            {examplesData?.voorbeelden.map((example) => (
              <button
                key={example.id}
                type="button"
                className={`${styles.exampleButton} ${
                  selectedExampleId === example.id
                    ? styles.exampleButtonSelected
                    : ""
                }`}
                onClick={() => handleExampleSelect(example.id)}
              >
                {example.label}
              </button>
            ))}
            {!examplesData ? (
              <>
                <span className={styles.skeletonButton} />
                <span className={styles.skeletonButton} />
              </>
            ) : null}
          </div>

          <div className={styles.textFieldGroup}>
            <div className={styles.textFieldHeader}>
              <label className={styles.columnLabel} htmlFor="candidate-text">
                Kandidaattekst
              </label>
              <span className={styles.wordCount} aria-live="polite">
                {wordCount} {wordCount === 1 ? "woord" : "woorden"}
              </span>
            </div>

            {scoreStatus === "success" && scoreResult ? (
              <div className={styles.markedTextFrame}>
                <div
                  className={styles.markedText}
                  role="textbox"
                  aria-label="Kandidaattekst met gemarkeerde bewijsfragmenten"
                  aria-readonly="true"
                >
                  {candidateTextSegments.map((segment) => {
                    if (segment.criterionKeys.length === 0) {
                      return (
                        <span key={`${segment.start}-${segment.end}`}>
                          {segment.text}
                        </span>
                      );
                    }

                    const isActive = activeCriterionKey
                      ? segment.criterionKeys.includes(activeCriterionKey)
                      : false;
                    const isMuted = activeCriterionKey !== null && !isActive;

                    return (
                      <mark
                        key={`${segment.start}-${segment.end}`}
                        className={`${styles.evidenceMark} ${
                          isActive ? styles.evidenceMarkActive : ""
                        } ${isMuted ? styles.evidenceMarkMuted : ""}`}
                        title={segment.explanations.join(" · ")}
                      >
                        {segment.text}
                      </mark>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={clearScore}
                >
                  Tekst aanpassen
                </button>
              </div>
            ) : (
              <textarea
                id="candidate-text"
                className={styles.textarea}
                value={candidateText}
                rows={11}
                placeholder="Kies een voorbeeld of typ hier zelf een antwoord."
                onChange={(event) =>
                  handleCandidateTextChange(event.target.value)
                }
              />
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={
              !examplesData || !candidateText.trim() || scoreStatus === "loading"
            }
          >
            {scoreStatus === "loading"
              ? "Beoordeling loopt…"
              : "Beoordeel tekst"}
          </button>
        </form>

        <section
          className={styles.resultColumn}
          aria-label="Beoordelingsresultaat"
        >
          {scoreStatus === "loading" ? <ScoreSkeleton /> : null}

          {scoreStatus === "error" ? (
            <div className={styles.errorState} role="alert">
              <p className={styles.stateTitle}>
                De beoordeling kon niet worden uitgevoerd.
              </p>
              <p className={styles.stateText}>
                Controleer of de tekst volledig is en probeer het opnieuw.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={clearScore}
              >
                Terug naar de tekst
              </button>
            </div>
          ) : null}

          {scoreStatus === "idle" ? (
            <div className={styles.emptyState}>
              <p className={styles.columnLabel}>Resultaat</p>
              <p className={styles.stateTitle}>Klaar om te beoordelen</p>
              <p className={styles.stateText}>
                Kies een voorbeeld of typ zelf een tekst. De score wordt per
                criterium verankerd in letterlijke fragmenten uit het antwoord.
              </p>
            </div>
          ) : null}

          {scoreStatus === "success" && scoreResult ? (
            <div className={styles.result}>
              {scoreResult.menselijkeReviewVereist ? (
                <section
                  className={styles.reviewBlock}
                  aria-labelledby="review-title"
                >
                  <p className={styles.reviewEyebrow}>Correct eindresultaat</p>
                  <h4 id="review-title" className={styles.reviewTitle}>
                    Menselijke beoordeling vereist
                  </h4>
                  <ul className={styles.reviewReasons}>
                    {scoreResult.escalatieRedenen.map((reason) => (
                      <li key={reason.code}>
                        <span className={styles.reasonCode}>
                          {reason.code.replaceAll("_", " ")}
                        </span>
                        <span>{reason.toelichting}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className={styles.criteriaHeader}>
                <p className={styles.columnLabel}>Scores per criterium</p>
                <p className={styles.highlightHint}>
                  Beweeg over of klik op een criterium om het bewijs links te
                  zien.
                </p>
              </div>

              <div className={styles.criteriaList}>
                {scoreResult.criteria.map((criterion) => (
                  <button
                    key={criterion.sleutel}
                    type="button"
                    className={`${styles.criterionCard} ${
                      activeCriterionKey === criterion.sleutel
                        ? styles.criterionCardActive
                        : ""
                    }`}
                    aria-pressed={pinnedCriterionKey === criterion.sleutel}
                    onMouseEnter={() => setHoveredCriterionKey(criterion.sleutel)}
                    onMouseLeave={() => setHoveredCriterionKey(null)}
                    onFocus={() => setHoveredCriterionKey(criterion.sleutel)}
                    onBlur={() => setHoveredCriterionKey(null)}
                    onClick={() => handleCriterionClick(criterion.sleutel)}
                  >
                    <span className={styles.criterionHeading}>
                      <span className={styles.criterionLabel}>
                        {criterion.label}
                      </span>
                      <span className={styles.criterionNumbers}>
                        <strong>
                          {criterion.score}/{criterion.maxScore}
                        </strong>
                        <span>{formatWeight(criterion.gewicht)}</span>
                      </span>
                    </span>
                    <span className={styles.criterionMotivation}>
                      {criterion.motivering}
                    </span>
                  </button>
                ))}
              </div>

              <dl className={styles.summary}>
                <div>
                  <dt>Gewogen score</dt>
                  <dd>{formatDecimal(scoreResult.gewogenScore)}</dd>
                </div>
                <div>
                  <dt>Slaaggrens</dt>
                  <dd>{formatDecimal(scoreResult.slaaggrens)}</dd>
                </div>
                <div>
                  <dt>Voorlopig oordeel</dt>
                  <dd>
                    {provisionalJudgementLabels[scoreResult.voorlopigOordeel]}
                  </dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{formatDecimal(scoreResult.confidence)}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
