import type {
  AgentOpportunity,
  OpportunityScores,
  SuitabilityResult,
} from "./types";

export const scoresFromOpportunity = (
  opportunity: AgentOpportunity,
): OpportunityScores => ({
  value: opportunity.value,
  feasibility: opportunity.feasibility,
  dataReadiness: opportunity.dataReadiness,
  regulatoryExposure: opportunity.regulatoryExposure,
  humanOversight: opportunity.humanOversight,
  decisionCriticality: opportunity.decisionCriticality,
  timeToValue: opportunity.timeToValue,
});

export function calculateSuitability(
  scores: OpportunityScores,
): SuitabilityResult {
  const positiveContribution =
    scores.value * 2.9 +
    scores.feasibility * 2.6 +
    scores.dataReadiness * 2.2 +
    scores.timeToValue * 1.5 +
    scores.humanOversight * 0.8;

  const exposure =
    scores.regulatoryExposure * 1.25 + scores.decisionCriticality * 1.15;
  const oversightProtection = scores.humanOversight * 0.8;
  const riskModifier = Math.max(0, exposure - oversightProtection);
  const score = Math.max(
    0,
    Math.min(100, Math.round(positiveContribution - riskModifier)),
  );

  const operatingModel =
    scores.decisionCriticality >= 8 || scores.regulatoryExposure >= 8
      ? "Human-supervised investigator"
      : scores.humanOversight >= 7
        ? "Review-before-action copilot"
        : "Bounded workflow assistant";

  const pilotScope =
    score >= 76 && scores.feasibility >= 7
      ? "Bounded workflow"
      : score >= 58
        ? "Narrow proof of value"
        : "Discovery and data-readiness sprint";

  const horizon =
    scores.timeToValue >= 8 && scores.feasibility >= 7
      ? "6–8 weeks"
      : scores.timeToValue >= 5
        ? "8–12 weeks"
        : "12+ weeks / staged discovery";

  return {
    score,
    operatingModel,
    pilotScope,
    horizon,
    positiveContribution: Math.round(positiveContribution),
    riskModifier: Math.round(riskModifier),
  };
}
