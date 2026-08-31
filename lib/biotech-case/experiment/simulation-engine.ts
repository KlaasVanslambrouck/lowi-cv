import { eventById } from "./scenario";
import type {
  DecisionImpact,
  ExperimentAction,
  ExperimentLogEntry,
  ExperimentReview,
  ExperimentState,
} from "./experiment-types";

const initialLog: ExperimentLogEntry[] = [
  {
    id: "project-created",
    day: 1,
    title: "Research project created",
    detail: "ADAMDEC1 inflammatory signalling question registered as a deterministic simulation.",
    provenance: "Simulation",
  },
];

export const initialExperimentState: ExperimentState = {
  eventId: "briefing",
  phase: "briefing",
  activeStation: "overview",
  resources: { day: 1, budget: 10000, sampleMaterial: 100, researcherAttention: 100 },
  design: {
    perturbation: "CRISPR knockout",
    model: "Macrophage cell line",
    readout: "Multiple readouts",
    rescue: true,
    nonTargetingControl: true,
  },
  evidenceQuality: 20,
  unsupportedInferenceRisk: 0,
  flags: {
    usedResearchAgent: false,
    inspectedPublicData: false,
    continuedLiterature: false,
    labMemoryViewed: false,
    repeatedExperiment: false,
    continuedCompromisedPlate: false,
    mechanismReviewed: false,
    analysisStrategy: null,
    conclusionChoice: null,
  },
  decisions: [],
  log: initialLog,
  logOpen: false,
  selectedLogId: null,
  designWarningOpen: false,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function applyImpact(state: ExperimentState, impact: DecisionImpact = {}) {
  return {
    resources: {
      day: Math.max(1, state.resources.day + (impact.time ?? 0)),
      budget: Math.max(0, state.resources.budget + (impact.budget ?? 0)),
      sampleMaterial: clamp(state.resources.sampleMaterial + (impact.sampleMaterial ?? 0)),
      researcherAttention: clamp(state.resources.researcherAttention + (impact.researcherAttention ?? 0)),
    },
    evidenceQuality: clamp(state.evidenceQuality + (impact.evidenceQuality ?? 0)),
    unsupportedInferenceRisk: Math.max(0, state.unsupportedInferenceRisk + (impact.unsupportedInferenceRisk ?? 0)),
  };
}

const decisionLog: Record<string, Omit<ExperimentLogEntry, "id" | "day">> = {
  "start-investigation": { title: "Research investigation started", detail: "The preliminary observation moved into an evidence review.", provenance: "Scientist decision" },
  "manual-investigation": { title: "Manual evidence review selected", detail: "Literature and database review completed with direct researcher control.", provenance: "Scientist decision" },
  "agent-investigation": { title: "Scientific Investigation Agent consulted", detail: "Sources were retrieved, clustered and returned for scientist review.", provenance: "Agent-supported" },
  "test-loss": { title: "Hypothesis selected", detail: "Test whether ADAMDEC1 loss changes macrophage inflammatory response.", provenance: "Scientist decision" },
  "continue-literature": { title: "Evidence review extended", detail: "Adjacent mechanisms and contradictions were reviewed before experiment design.", provenance: "Scientist decision" },
  "inspect-public-data": { title: "Public transcriptomics inspected", detail: "A compatible but observational macrophage signal was found.", provenance: "Agent-supported" },
  "initiate-experiment": { title: "CRISPR perturbation initiated", detail: "Four biological replicates and the selected controls entered incubation.", provenance: "Scientist decision" },
  "repeat-immediately": { title: "Experiment repeated immediately", detail: "The protocol was repeated without historical troubleshooting.", provenance: "Scientist decision" },
  "ask-lab-memory": { title: "Lab Memory consulted", detail: "Four related experiments and their recorded resolutions were surfaced.", provenance: "Agent-supported" },
  "continue-compromised": { title: "Compromised plate continued", detail: "Downstream analysis continued with low efficiency recorded as a confound.", provenance: "Scientist decision" },
  "repeat-fresh-reagent": { title: "Experiment repeated with fresh reagent", detail: "A new lot was used based on recurring historical patterns; no root cause was asserted.", provenance: "Scientist decision" },
  "check-confluency-repeat": { title: "Confluency checked before repeat", detail: "A second plausible historical factor was verified before repeating.", provenance: "Scientist decision" },
  "memory-continue": { title: "Historical pattern recorded", detail: "The original plate continued with reagent lot and confluency retained as possible confounds.", provenance: "Scientist decision" },
  "review-data": { title: "Synthetic dataset generated", detail: "Four replicates, two conditions and the configured rescue produced a variable dataset.", provenance: "Instrument observation" },
  "analysis-basic": { title: "Basic analysis selected", detail: "A bounded group comparison was run.", provenance: "Scientist decision" },
  "analysis-bioinformatics": { title: "Bioinformatics Investigator selected", detail: "QC, normalisation, comparison and pathway enrichment were orchestrated.", provenance: "Agent-supported" },
  "analysis-imaging": { title: "Imaging Investigator selected", detail: "Synthetic microscopy was segmented and compared by condition.", provenance: "Agent-supported" },
  "analysis-combined": { title: "Combined investigation selected", detail: "Cytokine, expression and morphology signals were reviewed together.", provenance: "Scientist decision" },
  "accept-mechanism": { title: "Mechanism accepted without review", detail: "NF-κB involvement was carried forward without opening the evidence trail.", provenance: "Scientist decision" },
  "inspect-mechanism": { title: "Mechanism provenance inspected", detail: "Supporting enrichment and missing validation were reviewed.", provenance: "Scientist decision" },
  "qualify-mechanism": { title: "Mechanism retained as hypothesis", detail: "NF-κB involvement remained a possible next investigation, not a conclusion.", provenance: "Scientist decision" },
  "conclude-causal": { title: "Strong causal claim selected", detail: "The wording exceeds the direct causal evidence in this experiment.", provenance: "Scientist decision" },
  "conclude-cautious": { title: "Qualified interpretation selected", detail: "A possible role was recorded with explicit need for validation.", provenance: "Scientist decision" },
  "conclude-repeat": { title: "Independent validation run", detail: "A second perturbation and larger replicate set increased confidence.", provenance: "Scientist decision" },
  "conclude-alternatives": { title: "Alternative explanations reviewed", detail: "Editing effects, model limitations and batch factors were considered.", provenance: "Scientist decision" },
};

function updateFlags(state: ExperimentState, optionId: string): ExperimentState["flags"] {
  const flags = { ...state.flags };
  if (optionId === "agent-investigation") flags.usedResearchAgent = true;
  if (optionId === "inspect-public-data") flags.inspectedPublicData = true;
  if (optionId === "continue-literature") flags.continuedLiterature = true;
  if (optionId === "ask-lab-memory") flags.labMemoryViewed = true;
  if (["repeat-immediately", "repeat-fresh-reagent", "check-confluency-repeat"].includes(optionId)) flags.repeatedExperiment = true;
  if (["continue-compromised", "memory-continue"].includes(optionId)) flags.continuedCompromisedPlate = true;
  if (optionId === "inspect-mechanism" || optionId === "qualify-mechanism") flags.mechanismReviewed = true;
  if (optionId.startsWith("analysis-")) flags.analysisStrategy = optionId.replace("analysis-", "") as ExperimentState["flags"]["analysisStrategy"];
  if (optionId === "conclude-causal") flags.conclusionChoice = "causal";
  if (optionId === "conclude-cautious") flags.conclusionChoice = "cautious";
  if (optionId === "conclude-repeat") flags.conclusionChoice = "repeat";
  if (optionId === "conclude-alternatives") flags.conclusionChoice = "alternatives";
  return flags;
}

function choose(state: ExperimentState, optionId: string): ExperimentState {
  const event = eventById.get(state.eventId);
  const option = event?.decisions.find((candidate) => candidate.id === optionId);
  if (!event || !option) return state;

  const nextEvent = eventById.get(option.nextEventId);
  if (!nextEvent) return state;

  const changed = applyImpact(state, option.impact);
  const logDefinition = decisionLog[optionId];
  const log = logDefinition
    ? [...state.log, { ...logDefinition, id: `${optionId}-${state.decisions.length}`, day: changed.resources.day }]
    : state.log;

  return {
    ...state,
    ...changed,
    eventId: nextEvent.id,
    phase: nextEvent.phase,
    activeStation: nextEvent.station,
    flags: updateFlags(state, optionId),
    decisions: [...state.decisions, optionId],
    log,
    selectedLogId: null,
  };
}

function approveDesign(state: ExperimentState, acknowledgeWarning = false): ExperimentState {
  if ((!state.design.rescue || !state.design.nonTargetingControl) && !acknowledgeWarning) {
    return { ...state, designWarningOpen: true };
  }

  const nextEvent = eventById.get("wet-lab")!;
  const controlPenalty = (state.design.rescue ? 0 : -10) + (state.design.nonTargetingControl ? 0 : -14);
  const primaryImpact = state.design.model === "Primary macrophages"
    ? { budget: -650, sampleMaterial: -8, evidenceQuality: 6 }
    : { budget: 0, sampleMaterial: 0, evidenceQuality: 0 };
  const changed = applyImpact(state, {
    time: 1,
    budget: primaryImpact.budget,
    sampleMaterial: primaryImpact.sampleMaterial,
    researcherAttention: -5,
    evidenceQuality: 8 + controlPenalty + primaryImpact.evidenceQuality,
  });

  return {
    ...state,
    ...changed,
    eventId: nextEvent.id,
    phase: nextEvent.phase,
    activeStation: nextEvent.station,
    decisions: [...state.decisions, "approve-design"],
    designWarningOpen: false,
    log: [...state.log, {
      id: `design-approved-${state.decisions.length}`,
      day: changed.resources.day,
      title: "Experiment design approved",
      detail: `${state.design.perturbation}; ${state.design.model}; ${state.design.readout}; ${state.design.rescue ? "rescue included" : "rescue omitted"}.`,
      provenance: "Scientist decision",
    }],
  };
}

export function experimentReducer(state: ExperimentState, action: ExperimentAction): ExperimentState {
  switch (action.type) {
    case "CHOOSE":
      return choose(state, action.optionId);
    case "UPDATE_DESIGN":
      return { ...state, design: { ...state.design, [action.field]: action.value }, designWarningOpen: false };
    case "APPROVE_DESIGN":
      return approveDesign(state, action.acknowledgeWarning);
    case "FOCUS_STATION":
      return { ...state, activeStation: action.station };
    case "TOGGLE_LOG":
      return { ...state, logOpen: !state.logOpen, selectedLogId: null };
    case "OPEN_LOG":
      return { ...state, selectedLogId: action.id };
    case "DISMISS_DESIGN_WARNING":
      return { ...state, designWarningOpen: false };
    case "RESET":
      return { ...initialExperimentState, log: [...initialLog] };
    default:
      return state;
  }
}

export function deriveExperimentReview(state: ExperimentState): ExperimentReview {
  const { flags, resources } = state;
  const reproducibility = clamp(
    52 + (flags.repeatedExperiment ? 18 : 0) + (state.design.rescue ? 10 : 0) +
      (state.design.nonTargetingControl ? 8 : 0) + (flags.mechanismReviewed ? 4 : 0) -
      (flags.continuedCompromisedPlate ? 14 : 0),
  );
  const provenanceCompleteness = clamp(
    70 + (flags.labMemoryViewed ? 10 : 0) + (flags.mechanismReviewed ? 14 : 0) +
      (flags.usedResearchAgent ? 4 : 0) - state.unsupportedInferenceRisk * 16,
  );
  const evidenceQuality = state.evidenceQuality >= 76 ? "Strong" : state.evidenceQuality >= 48 ? "Moderate" : "Weak";
  const aiAssistedSteps =
    (flags.usedResearchAgent ? 2 : 0) + (flags.labMemoryViewed ? 2 : 0) +
    (["bioinformatics", "imaging"].includes(flags.analysisStrategy ?? "") ? 2 : flags.analysisStrategy === "combined" ? 4 : 1);

  let interpretation = "The simulated evidence supports a possible role for ADAMDEC1 in macrophage inflammatory signalling, but additional validation is required before a mechanistic claim.";
  if (flags.conclusionChoice === "causal") {
    interpretation = "A causal claim was selected, but the simulated evidence does not adequately support it. Direct pathway validation and independent perturbation remain missing.";
  } else if (flags.conclusionChoice === "repeat") {
    interpretation = "The simulated evidence supports a possible role for ADAMDEC1 in macrophage inflammatory signalling. Independent validation improved confidence, while the mechanism remains unresolved.";
  } else if (flags.conclusionChoice === "alternatives") {
    interpretation = "The simulated results remain compatible with an ADAMDEC1-linked phenotype, but alternative editing, model and batch explanations must remain open.";
  }

  return {
    evidenceQuality,
    reproducibility,
    provenanceCompleteness,
    unsupportedClaims: state.unsupportedInferenceRisk,
    researcherHours: Math.round((100 - resources.researcherAttention) * 0.18 * 10) / 10,
    experimentalDays: resources.day,
    budgetRemaining: resources.budget,
    aiAssistedSteps,
    humanDecisions: Math.max(6, state.decisions.filter((id) => !id.startsWith("start-") && id !== "review-data").length),
    interpretation,
    uncertainty: ["Limited sample size", "Mechanism remains unclear", "Single experimental model", "Pathway involvement not directly validated"],
  };
}
