import type {
  AgentTool,
  EvidenceStrength,
  ResearchStage,
  ScientificOutputType,
} from "./types";

export interface ResearchLoopStage {
  id: ResearchStage;
  label: string;
  shortLabel: string;
  index: string;
  workflow: string;
  painPoints: string[];
  dataSources: string[];
  opportunity: string;
  humanResponsibility: string;
  maturity: "Ready to explore" | "Emerging" | "Research frontier";
  complexity: "Low" | "Medium" | "High";
  agentId?: string;
}

export interface ScientificProvenance {
  id: string;
  label: string;
  source: string;
  sourceType: string;
  note: string;
}

export interface ScientificEvidenceCluster {
  id: string;
  label: string;
  claim: string;
  supportingEvidence: number;
  evidenceTypes: string[];
  modelSystems: string[];
  strength: EvidenceStrength;
  strengthReason: string;
  contradictoryEvidence: string[];
  limitations: string[];
  provenance: ScientificProvenance[];
}

export const researchLoopStages: ResearchLoopStage[] = [
  {
    id: "question",
    label: "Scientific Question",
    shortLabel: "Question",
    index: "01",
    workflow: "Frame a biological question, define relevant entities and make assumptions explicit.",
    painPoints: ["Questions span incompatible vocabularies", "Known context is rarely captured with the question"],
    dataSources: ["Research brief", "Prior experiments", "Target vocabulary"],
    opportunity: "Structure the investigation before retrieval begins.",
    humanResponsibility: "Define the scientific question and decide what would count as useful evidence.",
    maturity: "Ready to explore",
    complexity: "Low",
    agentId: "scientific-investigator",
  },
  {
    id: "evidence",
    label: "Research Intelligence",
    shortLabel: "Evidence",
    index: "02",
    workflow: "Retrieve, deduplicate, rank and organise evidence from literature, databases and internal records.",
    painPoints: ["Evidence is fragmented across tools", "Contradictions and negative findings are easy to miss"],
    dataSources: ["PubMed / Europe PMC", "UniProt / Open Targets", "GEO", "Internal records"],
    opportunity: "Compress evidence gathering while preserving a source trail.",
    humanResponsibility: "Judge relevance, model-system fit and biological meaning.",
    maturity: "Ready to explore",
    complexity: "Medium",
    agentId: "scientific-investigator",
  },
  {
    id: "experiment",
    label: "Experimental Strategy",
    shortLabel: "Strategy",
    index: "03",
    workflow: "Compare plausible strategies, readouts, controls, constraints and confounders.",
    painPoints: ["Trade-offs are discussed but not preserved", "Controls and confounders surface late"],
    dataSources: ["Evidence workspace", "Assay catalogue", "Model systems", "Previous experiments"],
    opportunity: "Make alternative experimental paths comparable and reviewable.",
    humanResponsibility: "Select, adapt or reject strategies and own the experimental design.",
    maturity: "Emerging",
    complexity: "Medium",
    agentId: "experiment-strategy",
  },
  {
    id: "wet-lab",
    label: "Wet-lab Experiment",
    shortLabel: "Wet lab",
    index: "04",
    workflow: "Execute a scientist-approved protocol and capture context, deviations and instrument outputs.",
    painPoints: ["Execution context is inconsistently captured", "Troubleshooting knowledge stays local"],
    dataSources: ["ELN", "Protocols", "Samples", "Instrument runs"],
    opportunity: "Reduce documentation friction and connect execution to institutional memory.",
    humanResponsibility: "Perform the experiment, ensure safety and assess experimental validity.",
    maturity: "Emerging",
    complexity: "High",
    agentId: "lab-memory",
  },
  {
    id: "analysis",
    label: "Computational Investigation",
    shortLabel: "Analysis",
    index: "05",
    workflow: "Inspect, quality-control and analyse data through explicit reproducible tool steps.",
    painPoints: ["Analysis setup delays scientific feedback", "Biological decisions are hidden inside pipelines"],
    dataSources: ["Sequencing data", "Microscopy", "Sample metadata", "Analysis notebooks"],
    opportunity: "Shorten the distance from biological question to reviewable analysis.",
    humanResponsibility: "Approve analytical choices and validate whether outputs are scientifically usable.",
    maturity: "Emerging",
    complexity: "High",
    agentId: "bioinformatics-investigator",
  },
  {
    id: "interpretation",
    label: "Biological Interpretation",
    shortLabel: "Interpret",
    index: "06",
    workflow: "Relate observations to prior evidence without collapsing association into mechanism.",
    painPoints: ["Observations and explanations blur together", "Uncertainty is reduced to an arbitrary score"],
    dataSources: ["Analysis outputs", "Marker evidence", "Literature", "Experimental context"],
    opportunity: "Separate observations, evidence, interpretations and hypotheses.",
    humanResponsibility: "Determine biological plausibility and limits of the interpretation.",
    maturity: "Ready to explore",
    complexity: "Medium",
    agentId: "bioinformatics-investigator",
  },
  {
    id: "next-experiment",
    label: "Next Experiment",
    shortLabel: "Next test",
    index: "07",
    workflow: "Turn unresolved questions into candidate hypotheses and update the next learning cycle.",
    painPoints: ["Rationale is lost between cycles", "Teams revisit hypotheses without prior context"],
    dataSources: ["Knowledge gaps", "Contradictions", "Prior strategy decisions", "Lab memory"],
    opportunity: "Carry evidence, uncertainty and rationale into the next cycle.",
    humanResponsibility: "Decide what is worth testing and what evidence could change the conclusion.",
    maturity: "Emerging",
    complexity: "Medium",
    agentId: "experiment-strategy",
  },
];

export const scientificInvestigationTools: AgentTool[] = [
  { id: "pubmed", name: "PubMed", category: "literature", status: "mock" },
  { id: "europe-pmc", name: "Europe PMC", category: "literature", status: "mock" },
  { id: "openalex", name: "OpenAlex", category: "literature", status: "mock" },
  { id: "uniprot", name: "UniProt", category: "database", status: "mock" },
  { id: "open-targets", name: "Open Targets", category: "database", status: "mock" },
  { id: "geo", name: "GEO", category: "database", status: "mock" },
  { id: "chembl", name: "ChEMBL", category: "database", status: "future" },
  { id: "eln", name: "Internal ELN", category: "internal-data", status: "future" },
];

export const bioinformaticsTools: AgentTool[] = [
  { id: "scanpy", name: "Scanpy", category: "software", status: "mock" },
  { id: "seurat", name: "Seurat", category: "software", status: "future" },
  { id: "nextflow", name: "Nextflow", category: "software", status: "mock" },
  { id: "r", name: "R", category: "analysis", status: "mock" },
  { id: "python", name: "Python", category: "analysis", status: "mock" },
  { id: "pathway", name: "Pathway DB", category: "database", status: "mock" },
  { id: "literature", name: "Literature search", category: "literature", status: "mock" },
];

export const imagingTools: AgentTool[] = [
  { id: "cellprofiler", name: "CellProfiler", category: "software", status: "mock" },
  { id: "qupath", name: "QuPath", category: "software", status: "future" },
  { id: "python-imaging", name: "Python", category: "analysis", status: "mock" },
  { id: "image-model", name: "Image analysis model", category: "analysis", status: "mock" },
  { id: "image-store", name: "Internal image store", category: "internal-data", status: "future" },
];

export const scientificRunSteps = [
  { label: "Expanding biological entities", tool: "UniProt", count: "14 entities" },
  { label: "Searching scientific literature", tool: "PubMed + Europe PMC", count: "142 candidates" },
  { label: "Retrieving structured biological evidence", tool: "Open Targets + GEO", count: "38 records" },
  { label: "Deduplicating sources", tool: "OpenAlex", count: "37 removed" },
  { label: "Ranking relevance", tool: "Evidence ranker", count: "23 retained" },
  { label: "Extracting mechanistic claims", tool: "Claim extraction", count: "31 claims" },
  { label: "Clustering evidence", tool: "Evidence graph", count: "4 clusters" },
  { label: "Detecting contradictions", tool: "Contradiction check", count: "2 unresolved" },
  { label: "Identifying knowledge gaps", tool: "Gap analysis", count: "3 gaps" },
  { label: "Synthesising investigation", tool: "Structured synthesis", count: "Review workspace" },
];

export const scientificEvidenceClusters: ScientificEvidenceCluster[] = [
  {
    id: "macrophage",
    label: "Macrophage biology",
    claim: "ADAMDEC1 is repeatedly associated with macrophage-rich contexts and differentiated myeloid states.",
    supportingEvidence: 7,
    evidenceTypes: ["Expression", "Cell-state association", "Protein annotation"],
    modelSystems: ["Human tissue", "Mouse", "Primary macrophages"],
    strength: "moderate",
    strengthReason: "The association recurs across evidence types, but direct perturbation evidence is limited.",
    contradictoryEvidence: ["One synthetic cross-cohort record loses significance after adjustment for immune-cell composition."],
    limitations: ["Mostly observational evidence", "Cell-state and causal effects are not separated", "Limited perturbation evidence"],
    provenance: [
      { id: "src-01", label: "Myeloid expression record", source: "Synthetic literature record 01", sourceType: "Mock paper", note: "Realistic placeholder; no external citation is asserted." },
      { id: "src-02", label: "Protein function annotation", source: "Mock UniProt retrieval", sourceType: "Database", note: "Demonstrates a future structured database connection." },
      { id: "src-03", label: "Inflamed tissue expression", source: "Synthetic GEO-like dataset 17", sourceType: "Dataset", note: "Synthetic observation for product demonstration only." },
    ],
  },
  {
    id: "signalling",
    label: "Inflammatory signalling",
    claim: "ADAMDEC1 expression co-occurs with inflammatory signalling signatures, but the direction of effect differs by model.",
    supportingEvidence: 6,
    evidenceTypes: ["Pathway correlation", "Expression", "Perturbation"],
    modelSystems: ["Mouse tumour", "Human intestinal tissue", "Cell line"],
    strength: "conflicting",
    strengthReason: "Human and mouse signals do not consistently agree, and only one perturbation record was retrieved.",
    contradictoryEvidence: ["A synthetic mouse model shows no cytokine change after knockdown.", "Directionality differs between tissue and cell-line contexts."],
    limitations: ["Small sample counts", "Mixed model systems", "Mechanism remains unsupported"],
    provenance: [
      { id: "src-04", label: "Inflammatory signature analysis", source: "Synthetic dataset observation 22", sourceType: "Dataset", note: "Synthetic demonstration dataset." },
      { id: "src-05", label: "Knockdown result", source: "Synthetic internal experiment EXP-311", sourceType: "Internal experiment", note: "Mock internal record used to demonstrate provenance." },
    ],
  },
  {
    id: "matrix",
    label: "Extracellular matrix remodelling",
    claim: "Protease-related evidence suggests a possible role in tissue remodelling, without direct disease-causal support.",
    supportingEvidence: 5,
    evidenceTypes: ["Protein annotation", "Tissue association", "Pathway context"],
    modelSystems: ["Human tissue", "In vitro"],
    strength: "moderate",
    strengthReason: "The functional link is plausible and recurrent, but disease-specific causal evidence is absent.",
    contradictoryEvidence: [],
    limitations: ["Functional inference from protein family", "No direct causal disease study found"],
    provenance: [
      { id: "src-06", label: "Protease function", source: "Mock UniProt retrieval", sourceType: "Database", note: "Structured annotation placeholder." },
      { id: "src-07", label: "Remodelling signature", source: "Synthetic literature record 08", sourceType: "Mock paper", note: "Not a real citation." },
    ],
  },
  {
    id: "disease-expression",
    label: "Disease-specific expression",
    claim: "Higher expression appears in selected inflammatory tissue datasets, with substantial cohort variability.",
    supportingEvidence: 5,
    evidenceTypes: ["Bulk RNA", "Single-cell RNA", "Tissue annotation"],
    modelSystems: ["Human cohorts", "Mouse"],
    strength: "weak",
    strengthReason: "The result is observational, cohort-dependent and sensitive to cell-composition adjustment.",
    contradictoryEvidence: ["Two synthetic cohorts do not reproduce the association after composition adjustment."],
    limitations: ["Observational only", "Low cohort count", "Possible cell-composition confounding"],
    provenance: [
      { id: "src-08", label: "Cross-cohort expression", source: "Synthetic GEO-like analysis 31", sourceType: "Dataset", note: "Synthetic data used for interface demonstration." },
    ],
  },
];

export const knowledgeGaps = [
  "No direct perturbation evidence was found linking ADAMDEC1 loss to macrophage cytokine response.",
  "It remains unclear whether the disease association is cell-intrinsic or reflects macrophage abundance.",
  "Human and mouse evidence has not been reconciled within a comparable disease context.",
];

export const nextInvestigations = [
  "Compare expression across inflammatory macrophage datasets.",
  "Investigate knockout and knockdown evidence separately from observational studies.",
  "Inspect disease-specific single-cell datasets with cell-composition controls.",
  "Test the hypothesis that the observed phenotype is cell-intrinsic.",
];

export const outputTypeDescriptions: Record<ScientificOutputType, string> = {
  observation: "A pattern measured in data",
  evidence: "A source-supported finding",
  interpretation: "A possible explanation",
  hypothesis: "A proposition that requires testing",
};
