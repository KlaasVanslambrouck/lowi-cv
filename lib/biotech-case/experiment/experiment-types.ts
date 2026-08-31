export type ExperimentPhase =
  | "briefing"
  | "research"
  | "hypothesis"
  | "experiment-design"
  | "wet-lab"
  | "troubleshooting"
  | "data-generation"
  | "analysis"
  | "interpretation"
  | "decision"
  | "completed";

export type LabStation =
  | "overview"
  | "workstation"
  | "bench"
  | "incubator"
  | "microscope"
  | "storage";

export interface ExperimentResources {
  day: number;
  budget: number;
  sampleMaterial: number;
  researcherAttention: number;
}

export interface ExperimentDesign {
  perturbation: "CRISPR knockout" | "siRNA knockdown" | "Observational comparison";
  model: "Macrophage cell line" | "Primary macrophages";
  readout: "Cytokine release" | "Transcriptional response" | "Morphology" | "Multiple readouts";
  rescue: boolean;
  nonTargetingControl: boolean;
}

export interface DecisionImpact {
  time?: number;
  budget?: number;
  sampleMaterial?: number;
  researcherAttention?: number;
  evidenceQuality?: number;
  unsupportedInferenceRisk?: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  meta?: string;
  impact?: DecisionImpact;
  nextEventId: string;
}

export interface Observation {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "warning";
}

export interface ExperimentEvent {
  id: string;
  phase: ExperimentPhase;
  day: number;
  eyebrow: string;
  title: string;
  description: string;
  station: LabStation;
  objective: string;
  observations?: Observation[];
  decisions: DecisionOption[];
}

export interface ExperimentLogEntry {
  id: string;
  day: number;
  title: string;
  detail: string;
  provenance: "Scientist decision" | "Agent-supported" | "Instrument observation" | "Simulation";
}

export interface ExperimentFlags {
  usedResearchAgent: boolean;
  inspectedPublicData: boolean;
  continuedLiterature: boolean;
  labMemoryViewed: boolean;
  repeatedExperiment: boolean;
  continuedCompromisedPlate: boolean;
  mechanismReviewed: boolean;
  analysisStrategy: "basic" | "bioinformatics" | "imaging" | "combined" | null;
  conclusionChoice: "causal" | "cautious" | "repeat" | "alternatives" | null;
}

export interface ExperimentState {
  eventId: string;
  phase: ExperimentPhase;
  activeStation: LabStation;
  resources: ExperimentResources;
  design: ExperimentDesign;
  evidenceQuality: number;
  unsupportedInferenceRisk: number;
  flags: ExperimentFlags;
  decisions: string[];
  log: ExperimentLogEntry[];
  logOpen: boolean;
  selectedLogId: string | null;
  designWarningOpen: boolean;
}

export type ExperimentAction =
  | { type: "CHOOSE"; optionId: string }
  | { type: "UPDATE_DESIGN"; field: keyof ExperimentDesign; value: ExperimentDesign[keyof ExperimentDesign] }
  | { type: "APPROVE_DESIGN"; acknowledgeWarning?: boolean }
  | { type: "FOCUS_STATION"; station: LabStation }
  | { type: "TOGGLE_LOG" }
  | { type: "OPEN_LOG"; id: string | null }
  | { type: "DISMISS_DESIGN_WARNING" }
  | { type: "RESET" };

export interface ExperimentReview {
  evidenceQuality: "Strong" | "Moderate" | "Weak";
  reproducibility: number;
  provenanceCompleteness: number;
  unsupportedClaims: number;
  researcherHours: number;
  experimentalDays: number;
  budgetRemaining: number;
  aiAssistedSteps: number;
  humanDecisions: number;
  interpretation: string;
  uncertainty: string[];
}
