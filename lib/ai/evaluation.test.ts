import { describe, expect, it } from "vitest";
import type { EvaluationResult, RetrievalResult } from "./types";
import {
  evaluateRetrieval,
  RELEVANCE_THRESHOLD,
  verdictFor,
} from "./evaluation";

function result(score: number, chunkId = `chunk-${score}`): RetrievalResult {
  return {
    chunkId,
    score,
    matchedTerms: ["term"],
    reason: {
      nl: "testreden",
      en: "test reason",
    },
  };
}

function results(scores: number[]): RetrievalResult[] {
  return scores.map((score, index) => result(score, `chunk-${index}`));
}

describe("evaluateRetrieval", () => {
  it("flips confidence at the documented coverage and groundedness thresholds", () => {
    const cases: Array<{
      name: string;
      scores: number[];
      expectedConfidence: EvaluationResult["confidence"];
      expectedCoverage?: number;
      expectedGroundedness?: number;
    }> = [
      {
        name: "high at coverage threshold",
        scores: [0.9, 0.9, 0.9, 0.1, 0.1],
        expectedConfidence: "high",
        expectedCoverage: 0.6,
      },
      {
        name: "medium just below high coverage threshold",
        scores: [0.9, 0.9, 0.1, 0.1, 0.1],
        expectedConfidence: "medium",
        expectedCoverage: 0.4,
      },
      {
        name: "high at groundedness threshold",
        scores: [0.45, 0.45],
        expectedConfidence: "high",
        expectedGroundedness: 0.45,
      },
      {
        name: "medium just below high groundedness threshold",
        scores: [0.44, 0.44],
        expectedConfidence: "medium",
        expectedGroundedness: 0.44,
      },
      {
        name: "medium at coverage threshold",
        scores: [0.4, 0.1, 0.1],
        expectedConfidence: "medium",
        expectedCoverage: 1 / 3,
      },
      {
        name: "low just below medium coverage threshold",
        scores: [0.9, 0.1, 0.1, 0.1],
        expectedConfidence: "low",
        expectedCoverage: 0.25,
      },
      {
        name: "medium at groundedness threshold",
        scores: [0.3, 0.2, 0.1],
        expectedConfidence: "medium",
        expectedGroundedness: 0.25,
      },
      {
        name: "low just below medium groundedness threshold",
        scores: [0.29, 0.2, 0.1],
        expectedConfidence: "low",
        expectedGroundedness: (0.29 + (0.29 + 0.2 + 0.1) / 3) / 2,
      },
    ];

    for (const testCase of cases) {
      const evaluation = evaluateRetrieval(results(testCase.scores));

      expect(evaluation.confidence, testCase.name).toBe(
        testCase.expectedConfidence
      );
      if (testCase.expectedCoverage !== undefined) {
        expect(evaluation.sourceCoverage, testCase.name).toBeCloseTo(
          testCase.expectedCoverage,
          5
        );
      }
      if (testCase.expectedGroundedness !== undefined) {
        expect(evaluation.groundedness, testCase.name).toBeCloseTo(
          testCase.expectedGroundedness,
          5
        );
      }
    }
  });

  it("counts the relevance threshold inclusively for source coverage", () => {
    const evaluation = evaluateRetrieval([
      result(RELEVANCE_THRESHOLD, "at-threshold"),
      result(RELEVANCE_THRESHOLD - 0.01, "below-threshold"),
    ]);

    expect(evaluation.sourceCoverage).toBe(0.5);
  });

  it("returns bilingual warnings for empty and weak retrieval", () => {
    const empty = evaluateRetrieval([]);
    expect(empty.warnings).toEqual([
      {
        nl: expect.stringContaining("Geen bronnen gevonden"),
        en: expect.stringContaining("No sources found"),
      },
    ]);

    const weak = evaluateRetrieval([result(RELEVANCE_THRESHOLD - 0.01)]);
    expect(weak.warnings).toEqual(
      expect.arrayContaining([
        {
          nl: expect.stringContaining("Alle gevonden bronnen scoren"),
          en: expect.stringContaining("All retrieved sources score"),
        },
        {
          nl: expect.stringContaining("Minder dan twee bronnen"),
          en: expect.stringContaining("Fewer than two sources"),
        },
      ])
    );
  });
});

describe("verdictFor", () => {
  it("returns PASS, REVIEW, and INSUFFICIENT_CONTEXT for the documented scenarios", () => {
    const baseEvaluation: EvaluationResult = {
      groundedness: 0,
      sourceCoverage: 0,
      confidence: "low",
      warnings: [],
    };

    expect(
      verdictFor({
        ...baseEvaluation,
        groundedness: 0.8,
        sourceCoverage: 1,
        confidence: "high",
      })
    ).toBe("PASS");
    expect(
      verdictFor({
        ...baseEvaluation,
        groundedness: 0.3,
        sourceCoverage: 1 / 3,
        confidence: "medium",
      })
    ).toBe("REVIEW");
    expect(
      verdictFor({
        ...baseEvaluation,
        groundedness: 0.8,
        sourceCoverage: 0,
        confidence: "high",
      })
    ).toBe("INSUFFICIENT_CONTEXT");
  });
});
