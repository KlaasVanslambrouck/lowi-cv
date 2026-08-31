export type DomainId =
  | "discovery"
  | "preclinical"
  | "clinical"
  | "regulatory"
  | "manufacturing"
  | "quality"
  | "post-market";

export type AgentPattern =
  | "Researcher"
  | "Reviewer"
  | "Monitor"
  | "Investigator"
  | "Knowledge navigator"
  | "Workflow coordinator"
  | "Decision-support copilot"
  | "Scientific Investigator"
  | "Computational Operator"
  | "Evidence Synthesiser"
  | "Experimental Strategy Copilot"
  | "Institutional Memory"
  | "Technology Scout";

export type ResearchStage =
  | "question"
  | "evidence"
  | "experiment"
  | "wet-lab"
  | "analysis"
  | "interpretation"
  | "next-experiment";

export type ScientificOutputType =
  | "observation"
  | "evidence"
  | "interpretation"
  | "hypothesis";

export type EvidenceStrength = "weak" | "moderate" | "strong" | "conflicting";

export interface AgentTool {
  id: string;
  name: string;
  category: "database" | "literature" | "analysis" | "internal-data" | "software";
  status: "mock" | "available" | "future";
}

export interface ScientificResearchProfile {
  researchLeverage: number;
  dataAccessibility: number;
  workflowRepeatability: number;
  scientificJudgement: number;
  toolIntegration: number;
  evidenceTraceability: number;
  reproducibilityBenefit: number;
  operatingModel: string;
}

export interface EvidenceItem {
  id: string;
  type: ScientificOutputType;
  claim: string;
  sourceIds: string[];
  strength: EvidenceStrength;
  limitations?: string[];
}

export type EvidenceType =
  | "public-evidence"
  | "inference"
  | "hypothesis";

export type PrototypeStatus = "prototype" | "concept";

export type RunState =
  | "idle"
  | "preparing"
  | "investigating"
  | "synthesising"
  | "completed"
  | "error";

export interface AgentOpportunity {
  id: string;
  name: string;
  domain: DomainId;
  workflow: string;
  problem: string;
  description: string;
  agentPattern: AgentPattern;
  humanRole: string;
  dataRequired: string;
  value: number;
  feasibility: number;
  dataReadiness: number;
  regulatoryExposure: number;
  humanOversight: number;
  decisionCriticality: number;
  timeToValue: number;
  status: PrototypeStatus;
  evidenceType: EvidenceType;
  researchFocused?: boolean;
  researchProfile?: ScientificResearchProfile;
}

export interface DomainDefinition {
  id: DomainId;
  label: string;
  shortLabel: string;
  descriptor: string;
  workflows: string[];
  frictions: string[];
  dataCharacteristics: string;
  humanDecision: string;
}

export interface ProtocolPassage {
  id: string;
  section: string;
  number: string;
  text: string;
}

export interface ProtocolFinding {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  confidence: number;
  explanation: string;
  affectedSections: string[];
  passageIds: string[];
  whyItMatters: string;
  suggestedResolution: string;
  humanValidation: boolean;
}

export interface ProtocolReviewResult {
  protocolId: string;
  reviewedAt: string;
  checksCompleted: number;
  findings: ProtocolFinding[];
}

export interface ResearchSource {
  id: string;
  title: string;
  sourceLabel: string;
  year: number;
  cluster: string;
  evidenceStrength: number;
  direction: "supporting" | "mixed" | "weak";
  claim: string;
  provenance: string;
}

export interface ResearchCluster {
  id: string;
  label: string;
  paperCount: number;
  strength: number;
  summary: string;
}

export interface ResearchInvestigationResult {
  query: string;
  searchedAt: string;
  papersFound: number;
  highlyRelevant: number;
  contradictions: number;
  clusters: ResearchCluster[];
  sources: ResearchSource[];
  knowledgeGaps: string[];
  suggestedInvestigations: string[];
}

export interface InvestigationEvidence {
  label: string;
  source: string;
  supports: boolean;
}

export interface InvestigationCause {
  id: string;
  label: string;
  strength: number;
  status: "prioritise" | "open" | "lower-priority";
  evidence: InvestigationEvidence[];
  nextCheck: string;
}

export interface DeviationInvestigationResult {
  deviationId: string;
  investigatedAt: string;
  sourcesReviewed: number;
  causes: InvestigationCause[];
  recommendedPath: string[];
}

export interface OpportunityScores {
  value: number;
  feasibility: number;
  dataReadiness: number;
  regulatoryExposure: number;
  humanOversight: number;
  decisionCriticality: number;
  timeToValue: number;
}

export interface SuitabilityResult {
  score: number;
  operatingModel: string;
  pilotScope: string;
  horizon: string;
  positiveContribution: number;
  riskModifier: number;
}

export interface EvidenceSource {
  id: string;
  title: string;
  type: EvidenceType;
  note: string;
  placeholder: boolean;
}
