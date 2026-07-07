import { describe, expect, it } from "vitest";
import { checkEvalCase } from "./evalCheck";
import { exampleQuestions } from "./exampleQuestions";
import type { EvalCase, RetrievalResult } from "./types";

function result(chunkId: string): RetrievalResult {
  return {
    chunkId,
    score: 0.8,
    matchedTerms: ["term"],
    reason: {
      nl: "testreden",
      en: "test reason",
    },
  };
}

describe("checkEvalCase", () => {
  it("calculates hit rate, expected-source presence, and missing source ids", () => {
    const evalCase: EvalCase = {
      id: "fixture-case",
      question: {
        nl: "Fixturevraag",
        en: "Fixture question",
      },
      expectedSourceIds: ["source-a", "source-b", "source-c"],
    };

    const check = checkEvalCase(evalCase, [
      result("source-a"),
      result("unrelated-source"),
    ]);

    expect(check.hitCount).toBe(1);
    expect(check.hitRate).toBeCloseTo(1 / 3, 5);
    expect(check.hasExpectedSource).toBe(true);
    expect(check.missingSourceIds).toEqual(["source-b", "source-c"]);
  });

  it("documents the Phase 1 1/3 hit rate for the English classic analyst question", () => {
    const evalCase = exampleQuestions.find(
      (question) => question.id === "beyond-classic-analyst"
    );
    if (evalCase === undefined) {
      throw new Error("Missing beyond-classic-analyst eval case");
    }

    const check = checkEvalCase(evalCase, [
      result("system-about-me"),
      result("project-jarvis"),
      result("skill-functional-analysis"),
    ]);

    expect(evalCase.question.en).toBe(
      "What sets him apart from a classic functional analyst?"
    );
    expect(check.hitCount).toBe(1);
    expect(check.hitRate).toBeCloseTo(1 / 3, 5);
    expect(check.hasExpectedSource).toBe(true);
    expect(check.missingSourceIds).toEqual([
      "system-lowi-intro",
      "experience-egov-vzw",
    ]);
  });
});
