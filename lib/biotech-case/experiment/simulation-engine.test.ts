import { describe, expect, it } from "vitest";
import { deriveExperimentReview, experimentReducer, initialExperimentState } from "./simulation-engine";

function choose(state: typeof initialExperimentState, optionId: string) {
  return experimentReducer(state, { type: "CHOOSE", optionId });
}

describe("experiment simulation engine", () => {
  it("keeps the scenario deterministic and records provenance", () => {
    let state = choose(initialExperimentState, "start-investigation");
    state = choose(state, "agent-investigation");
    state = choose(state, "test-loss");
    state = experimentReducer(state, { type: "APPROVE_DESIGN" });
    state = choose(state, "initiate-experiment");
    state = choose(state, "ask-lab-memory");
    state = choose(state, "repeat-fresh-reagent");

    expect(state.eventId).toBe("synthetic-data");
    expect(state.flags.labMemoryViewed).toBe(true);
    expect(state.flags.repeatedExperiment).toBe(true);
    expect(state.log.some((entry) => entry.title.includes("fresh reagent"))).toBe(true);
  });

  it("tracks unsupported inference when AI output is accepted blindly", () => {
    const analysisState = {
      ...initialExperimentState,
      eventId: "analysis-result",
      phase: "analysis" as const,
    };
    const accepted = choose(analysisState, "accept-mechanism");
    expect(accepted.unsupportedInferenceRisk).toBe(1);
    expect(accepted.flags.mechanismReviewed).toBe(false);
  });

  it("requires acknowledgement when a key control is omitted", () => {
    const designState = {
      ...initialExperimentState,
      eventId: "experiment-design",
      phase: "experiment-design" as const,
      design: { ...initialExperimentState.design, rescue: false },
    };
    const warned = experimentReducer(designState, { type: "APPROVE_DESIGN" });
    expect(warned.eventId).toBe("experiment-design");
    expect(warned.designWarningOpen).toBe(true);

    const continued = experimentReducer(warned, { type: "APPROVE_DESIGN", acknowledgeWarning: true });
    expect(continued.eventId).toBe("wet-lab");
  });

  it("builds a scientific review rather than a points score", () => {
    const review = deriveExperimentReview({
      ...initialExperimentState,
      phase: "completed",
      eventId: "completed",
      unsupportedInferenceRisk: 1,
    });
    expect(review.unsupportedClaims).toBe(1);
    expect(["Strong", "Moderate", "Weak"]).toContain(review.evidenceQuality);
  });
});
