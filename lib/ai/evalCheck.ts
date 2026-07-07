// Kleine, pure eval-check: hoeveel van de verwachte bronnen van een EvalCase
// zitten daadwerkelijk in de retrieval-resultaten? Bewust geen evalplatform —
// enkel deze ene functie, als voorbereiding op de eval-weergave in Run 2.

import type { EvalCase, RetrievalResult } from "./types";

export interface EvalCheckResult {
  // Aantal verwachte bron-ids dat in de resultaten (top-k) voorkomt.
  hitCount: number;
  // hitCount gedeeld door het aantal verwachte bronnen, in [0, 1].
  hitRate: number;
  // True zodra minstens één verwachte bron aanwezig is.
  hasExpectedSource: boolean;
  // De verwachte bron-ids die NIET gevonden werden (handig voor debugging).
  missingSourceIds: string[];
}

export function checkEvalCase(
  evalCase: EvalCase,
  results: RetrievalResult[]
): EvalCheckResult {
  const retrievedIds = new Set(results.map((result) => result.chunkId));
  const missingSourceIds = evalCase.expectedSourceIds.filter(
    (sourceId) => !retrievedIds.has(sourceId)
  );
  const hitCount = evalCase.expectedSourceIds.length - missingSourceIds.length;
  return {
    hitCount,
    hitRate:
      evalCase.expectedSourceIds.length === 0
        ? 0
        : hitCount / evalCase.expectedSourceIds.length,
    hasExpectedSource: hitCount > 0,
    missingSourceIds,
  };
}
