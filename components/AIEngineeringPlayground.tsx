"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Language } from "@/context/LanguageContext";
import { useLanguage } from "@/hooks/useLanguage";
import {
  buildTemplateAnswer,
  getPreAuthoredAnswer,
  type GroundedAnswer,
} from "@/lib/ai/answers";
import { evaluateRetrieval } from "@/lib/ai/evaluation";
import { exampleQuestions } from "@/lib/ai/exampleQuestions";
import { getKnowledgeBase } from "@/lib/ai/portfolioKnowledgeBase";
import {
  analyzeQuery,
  LocalKeywordRetrievalProvider,
} from "@/lib/ai/retrieval";
import type {
  EvaluationResult,
  KnowledgeChunk,
  QueryAnalysis,
  RetrievalMatchTier,
  RetrievalResult,
} from "@/lib/ai/types";
import AnswerPanel from "@/components/ai/AnswerPanel";
import ContextInspector from "@/components/ai/ContextInspector";
import PipelineStage from "@/components/ai/PipelineStage";
import QuestionInput from "@/components/ai/QuestionInput";
import RetrievalInspector from "@/components/ai/RetrievalInspector";
import styles from "@/components/ai/AIEngineeringPlayground.module.css";

type PipelineStageId =
  | "question"
  | "analysis"
  | "retrieval"
  | "ranking"
  | "context"
  | "answer";

interface PipelineRun {
  query: string;
  questionId: string | null;
  analysis: QueryAnalysis;
  results: RetrievalResult[];
  evaluation: EvaluationResult;
  contextChunks: KnowledgeChunk[];
  answer: GroundedAnswer;
  durationMs: number;
}

const RETRIEVAL_LIMIT = 5;

const stageTitles: Record<PipelineStageId, string> = {
  question: "Question",
  analysis: "Query Analysis",
  retrieval: "Retrieval",
  ranking: "Ranking",
  context: "Context Assembly",
  answer: "Answer",
};

const tierLabels: Record<RetrievalMatchTier, { nl: string; en: string }> = {
  title: { nl: "titel-match", en: "title match" },
  keyword: { nl: "keyword-overlap", en: "keyword overlap" },
  tag: { nl: "tag-overlap", en: "tag overlap" },
  content: { nl: "tekst-overlap", en: "body overlap" },
};

function estimateContextSize(chunks: KnowledgeChunk[], language: Language) {
  const assembled = chunks
    .map((chunk) => `${chunk.title[language]}\n${chunk.content[language]}`)
    .join("\n\n");
  return {
    characters: assembled.length,
    words: assembled.split(/\s+/).filter(Boolean).length,
  };
}

function assembleContextChunks(
  answer: GroundedAnswer,
  results: RetrievalResult[],
  chunksById: Map<string, KnowledgeChunk>
): KnowledgeChunk[] {
  const orderedIds = [
    ...answer.sourceChunkIds,
    ...results.map((result) => result.chunkId),
  ];
  const seen = new Set<string>();
  const chunks: KnowledgeChunk[] = [];

  for (const chunkId of orderedIds) {
    if (seen.has(chunkId)) continue;
    seen.add(chunkId);
    const chunk = chunksById.get(chunkId);
    if (chunk) chunks.push(chunk);
    if (chunks.length >= Math.max(3, answer.sourceChunkIds.length)) break;
  }

  return chunks;
}

function summarizeBreakdown(
  result: RetrievalResult,
  language: Language
): string {
  const breakdown = result.matchBreakdown ?? [];
  if (breakdown.length === 0) {
    return language === "nl"
      ? "geen breakdown beschikbaar"
      : "no breakdown available";
  }

  const grouped = new Map<RetrievalMatchTier, string[]>();
  for (const match of breakdown) {
    grouped.set(match.tier, [...(grouped.get(match.tier) ?? []), match.term]);
  }

  return Array.from(grouped.entries())
    .map(([tier, terms]) => `${tierLabels[tier][language]} (${terms.join(", ")})`)
    .join("; ");
}

function buildRankingExplanations(
  results: RetrievalResult[],
  chunksById: Map<string, KnowledgeChunk>,
  language: Language
) {
  return results.map((result, index) => {
    const currentChunk = chunksById.get(result.chunkId);
    const next = results[index + 1];
    const nextChunk = next ? chunksById.get(next.chunkId) : null;
    const currentTitle = currentChunk?.title[language] ?? result.chunkId;
    const currentEvidence = summarizeBreakdown(result, language);

    if (!next) {
      return {
        id: result.chunkId,
        text:
          language === "nl"
            ? `${currentTitle} sluit de top-k af met ${currentEvidence}.`
            : `${currentTitle} closes the top-k with ${currentEvidence}.`,
      };
    }

    const nextTitle = nextChunk?.title[language] ?? next.chunkId;
    const nextEvidence = summarizeBreakdown(next, language);

    if (result.score === next.score) {
      return {
        id: result.chunkId,
        text:
          language === "nl"
            ? `${currentTitle} en ${nextTitle} hebben dezelfde berekende score; de deterministische chunk-id volgorde beslist. Dit resultaat matcht via ${currentEvidence}.`
            : `${currentTitle} and ${nextTitle} have the same computed score; deterministic chunk-id order decides. This result matches through ${currentEvidence}.`,
      };
    }

    return {
      id: result.chunkId,
      text:
        language === "nl"
          ? `${currentTitle} staat boven ${nextTitle} omdat de berekende score hoger is (${String(result.score)} tegenover ${String(next.score)}). Dit resultaat matcht via ${currentEvidence}; het volgende via ${nextEvidence}.`
          : `${currentTitle} ranks above ${nextTitle} because its computed score is higher (${String(result.score)} versus ${String(next.score)}). This result matches through ${currentEvidence}; the next one through ${nextEvidence}.`,
    };
  });
}

export default function AIEngineeringPlayground() {
  const { language } = useLanguage();
  const providerRef = useRef(new LocalKeywordRetrievalProvider());
  const runSequenceRef = useRef(0);
  const chunksById = useMemo(
    () => new Map(getKnowledgeBase().map((chunk) => [chunk.id, chunk])),
    []
  );
  const firstQuestionId = exampleQuestions[0]?.id ?? null;

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    firstQuestionId
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const [pipeline, setPipeline] = useState<PipelineRun | null>(null);
  const [openStage, setOpenStage] = useState<PipelineStageId>("answer");
  const [highlightedChunkId, setHighlightedChunkId] = useState<string | null>(
    null
  );
  const [isRunning, setIsRunning] = useState(false);

  const runPipeline = useCallback(
    async (query: string, questionId: string | null) => {
      const sequence = runSequenceRef.current + 1;
      runSequenceRef.current = sequence;
      setIsRunning(true);

      const analysis = analyzeQuery(query);
      const start = performance.now();
      const results = await providerRef.current.retrieve(
        query,
        language,
        RETRIEVAL_LIMIT
      );
      const durationMs = performance.now() - start;
      const evaluation = evaluateRetrieval(results);
      const answer =
        questionId !== null
          ? getPreAuthoredAnswer(questionId) ?? buildTemplateAnswer(results)
          : buildTemplateAnswer(results);
      const contextChunks = assembleContextChunks(answer, results, chunksById);

      if (runSequenceRef.current !== sequence) return;

      setPipeline({
        query,
        questionId,
        analysis,
        results,
        evaluation,
        contextChunks,
        answer,
        durationMs,
      });
      setHighlightedChunkId(null);
      setOpenStage("answer");
      setIsRunning(false);
    },
    [chunksById, language]
  );

  useEffect(() => {
    if (selectedQuestionId === null) return;
    const question = exampleQuestions.find(
      (entry) => entry.id === selectedQuestionId
    );
    if (!question) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bewust: de demo draait na mount/taalwissel met echte performance.now()-meting in de browser
    void runPipeline(question.question[language], question.id);
  }, [language, runPipeline, selectedQuestionId]);

  function handleCustomSubmit(question: string) {
    setSelectedQuestionId(null);
    void runPipeline(question, null);
  }

  function handleSourceSelect(chunkId: string) {
    setHighlightedChunkId(chunkId);
    setOpenStage("retrieval");
  }

  function toggleStage(stageId: PipelineStageId) {
    setOpenStage((current) => (current === stageId ? "question" : stageId));
  }

  const contextSize = pipeline
    ? estimateContextSize(pipeline.contextChunks, language)
    : { characters: 0, words: 0 };
  const rankingExplanations = pipeline
    ? buildRankingExplanations(pipeline.results, chunksById, language)
    : [];
  const topScore = pipeline?.results[0]?.score;
  const responseType = pipeline?.answer.responseType;

  return (
    <div className={styles.playground}>
      <p className={styles.intro}>
        {language === "nl"
          ? "Een transparante demonstratie van retrieval, contextselectie en antwoordvorming — gebouwd op de inhoud van deze portfolio."
          : "A transparent demonstration of retrieval, context selection and answer construction — built on the content of this portfolio."}
      </p>
      <p className={styles.honestyNote}>
        {language === "nl"
          ? "Deze sectie gebruikt keyword-gebaseerde lokale retrieval. Antwoorden zijn vooraf opgestelde, brongebonden antwoorden of template-based samenstellingen uit gevonden bronfragmenten; er draait hier geen LLM-generatie."
          : "This section uses keyword-based local retrieval. Answers are pre-authored grounded responses or template-based assemblies from retrieved source fragments; no LLM generation runs here."}
      </p>

      <QuestionInput
        questions={exampleQuestions}
        selectedQuestionId={selectedQuestionId}
        customQuestion={customQuestion}
        isRunning={isRunning}
        onExampleSelect={setSelectedQuestionId}
        onCustomQuestionChange={setCustomQuestion}
        onCustomSubmit={handleCustomSubmit}
      />

      <div className={styles.pipeline}>
        <PipelineStage
          id="ai-stage-question"
          index={1}
          title={stageTitles.question}
          summary={
            pipeline
              ? `${pipeline.query} (${pipeline.durationMs.toFixed(2)} ms)`
              : language === "nl"
                ? "Kies een vraag om de pipeline te starten."
                : "Choose a question to start the pipeline."
          }
          isOpen={openStage === "question"}
          onToggle={() => toggleStage("question")}
        >
          <div className={styles.queryMeta}>
            <span className={styles.metric}>
              <span className={styles.metricLabel}>
                {language === "nl" ? "Vraag" : "Question"}
              </span>
              <span className={styles.metricValue}>
                {pipeline?.query ?? "-"}
              </span>
            </span>
            <span className={styles.metric}>
              <span className={styles.metricLabel}>
                {language === "nl" ? "Retrievalduur" : "Retrieval duration"}
              </span>
              <span className={styles.metricValue}>
                {pipeline ? `${pipeline.durationMs.toFixed(2)} ms` : "-"}
              </span>
            </span>
          </div>
        </PipelineStage>

        <PipelineStage
          id="ai-stage-analysis"
          index={2}
          title={stageTitles.analysis}
          summary={
            pipeline
              ? language === "nl"
                ? `${pipeline.analysis.terms.length} query-termen voor keyword-gebaseerde lokale retrieval.`
                : `${pipeline.analysis.terms.length} query terms for keyword-based local retrieval.`
              : "-"
          }
          isOpen={openStage === "analysis"}
          onToggle={() => toggleStage("analysis")}
        >
          <div className={styles.queryMeta}>
            <span className={styles.metric}>
              <span className={styles.metricLabel}>
                {language === "nl" ? "Retrievalmodus" : "Retrieval mode"}
              </span>
              <span className={styles.metricValue}>
                {language === "nl"
                  ? "keyword-gebaseerde lokale retrieval"
                  : "keyword-based local retrieval"}
              </span>
            </span>
            <div>
              <p className={styles.label}>
                {language === "nl" ? "Genormaliseerde termen" : "Normalized terms"}
              </p>
              <div className={styles.termList}>
                {pipeline?.analysis.terms.map((term) => (
                  <span key={term.normalized} className={styles.termChip}>
                    {term.raw} = {term.normalized}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className={styles.label}>
                {language === "nl" ? "Genegeerde stopwoorden" : "Ignored stop words"}
              </p>
              <div className={styles.termList}>
                {pipeline?.analysis.ignoredTerms.map((term, index) => (
                  <span
                    key={`${term}-${index}`}
                    className={`${styles.termChip} ${styles.ignoredTerm}`}
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </PipelineStage>

        <PipelineStage
          id="ai-stage-retrieval"
          index={3}
          title={stageTitles.retrieval}
          summary={
            pipeline
              ? language === "nl"
                ? `${pipeline.results.length} resultaten, top score ${topScore === undefined ? "-" : String(topScore)}.`
                : `${pipeline.results.length} results, top score ${topScore === undefined ? "-" : String(topScore)}.`
              : "-"
          }
          isOpen={openStage === "retrieval"}
          onToggle={() => toggleStage("retrieval")}
        >
          {pipeline ? (
            <RetrievalInspector
              results={pipeline.results}
              chunksById={chunksById}
              language={language}
              highlightedChunkId={highlightedChunkId}
            />
          ) : null}
        </PipelineStage>

        <PipelineStage
          id="ai-stage-ranking"
          index={4}
          title={stageTitles.ranking}
          summary={
            language === "nl"
              ? "Sortering op berekende score uit titel-, keyword-, tag- en tekstmatches."
              : "Sorted by computed score from title, keyword, tag and body matches."
          }
          isOpen={openStage === "ranking"}
          onToggle={() => toggleStage("ranking")}
        >
          <ol className={styles.rankingList}>
            {rankingExplanations.map((explanation, index) => (
              <li key={explanation.id} className={styles.rankingItem}>
                <span className={styles.rankBadge}>#{index + 1}</span>
                <p className={styles.rankingText}>{explanation.text}</p>
              </li>
            ))}
          </ol>
        </PipelineStage>

        <PipelineStage
          id="ai-stage-context"
          index={5}
          title={stageTitles.context}
          summary={
            pipeline
              ? language === "nl"
                ? `${pipeline.contextChunks.length} chunks geselecteerd; geschatte grootte ${contextSize.characters} tekens / ${contextSize.words} woorden.`
                : `${pipeline.contextChunks.length} chunks selected; estimated size ${contextSize.characters} characters / ${contextSize.words} words.`
              : "-"
          }
          isOpen={openStage === "context"}
          onToggle={() => toggleStage("context")}
        >
          {pipeline ? (
            <ContextInspector
              chunks={pipeline.contextChunks}
              language={language}
            />
          ) : null}
        </PipelineStage>

        <PipelineStage
          id="ai-stage-answer"
          index={6}
          title={stageTitles.answer}
          summary={
            pipeline
              ? language === "nl"
                ? `${responseType === "template" ? "Template-based response" : "Pre-authored grounded response"} met ${pipeline.answer.sourceChunkIds.length} bronnen.`
                : `${responseType === "template" ? "Template-based response" : "Pre-authored grounded response"} with ${pipeline.answer.sourceChunkIds.length} sources.`
              : "-"
          }
          isOpen={openStage === "answer"}
          onToggle={() => toggleStage("answer")}
        >
          {pipeline ? (
            <AnswerPanel
              answer={pipeline.answer}
              chunksById={chunksById}
              language={language}
              onSourceSelect={handleSourceSelect}
            />
          ) : null}
        </PipelineStage>
      </div>
    </div>
  );
}
