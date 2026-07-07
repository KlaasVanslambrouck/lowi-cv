// Deterministische evaluatie van retrieval-resultaten. Alle metrics hier zijn
// afgeleid van de echte retrieval-scores — er wordt nergens een confidence of
// percentage hardcoded dat niet uit een berekening volgt.

import type { Bilingual } from "@/types/content";
import type { EvaluationResult, RetrievalResult } from "./types";

// Drempel waarboven een resultaat als "relevant genoeg" telt. Retrieval-scores
// liggen in [0, 1] (zie de formule in retrieval.ts); onder 0.25 is een match
// doorgaans één losse term in de lopende tekst.
export const RELEVANCE_THRESHOLD = 0.25;

// Onder dit aantal resultaten is de antwoordbasis smal en waarschuwen we.
const MIN_RESULTS_FOR_BROAD_BASE = 2;

// Confidence-drempels (bewust simpel en expliciet):
//   high   : sourceCoverage ≥ 0.6  én  groundedness ≥ 0.45
//   medium : sourceCoverage ≥ 1/3  én  groundedness ≥ 0.25
//   low    : al het overige
const HIGH_COVERAGE = 0.6;
const HIGH_GROUNDEDNESS = 0.45;
const MEDIUM_COVERAGE = 1 / 3;
const MEDIUM_GROUNDEDNESS = 0.25;

export function evaluateRetrieval(results: RetrievalResult[]): EvaluationResult {
  const warnings: Bilingual[] = [];

  if (results.length === 0) {
    warnings.push({
      nl: "Geen bronnen gevonden voor deze vraag — het antwoord kan niet op portfolio-content gebaseerd worden.",
      en: "No sources found for this question — the answer cannot be grounded in portfolio content.",
    });
    return {
      groundedness: 0,
      sourceCoverage: 0,
      confidence: "low",
      warnings,
    };
  }

  const scores = results.map((result) => result.score);
  const maxScore = Math.max(...scores);
  const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Groundedness is hier een PROXY-metric: het gemiddelde van de hoogste en
  // de gemiddelde retrieval-score. Dat is afleidbaar uit echte berekeningen,
  // maar het is géén gevalideerde ML-metric voor feitelijke onderbouwing —
  // het zegt alleen hoe sterk de gevonden bronnen lexicaal bij de vraag passen.
  const groundedness = (maxScore + meanScore) / 2;

  // Aandeel van de top-k resultaten dat boven de relevantiedrempel scoort.
  const aboveThreshold = results.filter(
    (result) => result.score >= RELEVANCE_THRESHOLD
  ).length;
  const sourceCoverage = aboveThreshold / results.length;

  if (aboveThreshold === 0) {
    warnings.push({
      nl: `Alle gevonden bronnen scoren onder de relevantiedrempel (${RELEVANCE_THRESHOLD}) — de match is oppervlakkig.`,
      en: `All retrieved sources score below the relevance threshold (${RELEVANCE_THRESHOLD}) — the match is superficial.`,
    });
  }

  if (results.length < MIN_RESULTS_FOR_BROAD_BASE) {
    warnings.push({
      nl: "Minder dan twee bronnen gematcht — de antwoordbasis is smal.",
      en: "Fewer than two sources matched — the answer rests on a narrow base.",
    });
  }

  let confidence: EvaluationResult["confidence"] = "low";
  if (sourceCoverage >= HIGH_COVERAGE && groundedness >= HIGH_GROUNDEDNESS) {
    confidence = "high";
  } else if (
    sourceCoverage >= MEDIUM_COVERAGE &&
    groundedness >= MEDIUM_GROUNDEDNESS
  ) {
    confidence = "medium";
  }

  return { groundedness, sourceCoverage, confidence, warnings };
}

// Voorbereidend werk voor de evaluatie-UI in Run 2: een klein, puur,
// deterministisch label bovenop EvaluationResult.
export type RetrievalVerdict = "PASS" | "REVIEW" | "INSUFFICIENT_CONTEXT";

// Regels (exact, deterministisch):
//   INSUFFICIENT_CONTEXT : geen enkel resultaat boven de relevantiedrempel
//   PASS                 : confidence "high"
//   REVIEW               : al het overige (er is context, maar niet sterk genoeg)
export function verdictFor(evaluation: EvaluationResult): RetrievalVerdict {
  if (evaluation.sourceCoverage === 0) return "INSUFFICIENT_CONTEXT";
  if (evaluation.confidence === "high") return "PASS";
  return "REVIEW";
}
