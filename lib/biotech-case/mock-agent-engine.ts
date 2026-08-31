import type {
  DeviationInvestigationResult,
  ProtocolPassage,
  ProtocolReviewResult,
  ResearchInvestigationResult,
} from "./types";

export const protocolPassages: ProtocolPassage[] = [
  {
    id: "objective",
    number: "2.1",
    section: "Study objective",
    text: "Evaluate the efficacy and safety of LX-201 in adolescents and adults with moderate inflammatory disease.",
  },
  {
    id: "population",
    number: "3.1",
    section: "Population",
    text: "Approximately 180 participants aged 16–75 years with confirmed moderate inflammatory disease will be randomised.",
  },
  {
    id: "inclusion",
    number: "4.2",
    section: "Inclusion criteria",
    text: "Participants must be 18–75 years of age at screening and have an IASI score of at least 12.",
  },
  {
    id: "exclusion",
    number: "4.3",
    section: "Exclusion criteria",
    text: "Exclude participants with ALT above 2.5 × ULN. Appendix B lists an exclusion threshold above 3 × ULN.",
  },
  {
    id: "primary-endpoint",
    number: "6.1",
    section: "Primary endpoint",
    text: "Proportion of participants achieving IASI-50 response at Week 24 compared with baseline.",
  },
  {
    id: "secondary-endpoint",
    number: "6.2",
    section: "Secondary endpoints",
    text: "Change from baseline in total IASI response score at Week 24 and patient-reported symptom improvement.",
  },
  {
    id: "visit-schedule",
    number: "7.1",
    section: "Visit schedule",
    text: "Efficacy assessments occur at Weeks 4, 8, 16 and 24. Table 7-2 assigns the final assessment to Week 22.",
  },
  {
    id: "safety",
    number: "8.4",
    section: "Safety monitoring",
    text: "AESIs will be reviewed by the independent monitoring committee within 72 hours of notification.",
  },
];

const protocolResult: ProtocolReviewResult = {
  protocolId: "LX-201-02 / draft 0.7",
  reviewedAt: "Deterministic simulation",
  checksCompleted: 32,
  findings: [
    {
      id: "age-mismatch",
      title: "Potential eligibility inconsistency",
      severity: "High",
      confidence: 94,
      explanation: "Section 4.2 requires participants to be at least 18 while the population definition includes participants from age 16.",
      affectedSections: ["3.1 Population", "4.2 Inclusion criteria"],
      passageIds: ["population", "inclusion"],
      whyItMatters: "Sites could interpret the eligible age range differently, affecting recruitment and protocol compliance.",
      suggestedResolution: "Confirm the intended lower age boundary and align the population statement and inclusion criterion.",
      humanValidation: true,
    },
    {
      id: "endpoint-wording",
      title: "Endpoint construct differs",
      severity: "Medium",
      confidence: 88,
      explanation: "The primary endpoint defines a responder proportion, while the secondary section refers to a total response score without defining that construct.",
      affectedSections: ["6.1 Primary endpoint", "6.2 Secondary endpoints"],
      passageIds: ["primary-endpoint", "secondary-endpoint"],
      whyItMatters: "Ambiguous endpoint language can create inconsistent analysis and interpretation downstream.",
      suggestedResolution: "Define the total response score or align the wording with the validated IASI measure.",
      humanValidation: true,
    },
    {
      id: "visit-week",
      title: "Visit week discrepancy",
      severity: "High",
      confidence: 97,
      explanation: "Narrative schedule assigns the final efficacy assessment to Week 24; referenced Table 7-2 assigns Week 22.",
      affectedSections: ["7.1 Visit schedule", "Table 7-2"],
      passageIds: ["visit-schedule"],
      whyItMatters: "A schedule conflict can affect site execution, data capture and endpoint timing.",
      suggestedResolution: "Reconcile Table 7-2 with the intended final efficacy assessment week.",
      humanValidation: true,
    },
    {
      id: "undefined-term",
      title: "Undefined safety abbreviation",
      severity: "Low",
      confidence: 91,
      explanation: "AESI is used in the safety section but is absent from the protocol abbreviation list.",
      affectedSections: ["8.4 Safety monitoring", "1.4 Abbreviations"],
      passageIds: ["safety"],
      whyItMatters: "Undefined safety terminology creates avoidable interpretation friction for sites and reviewers.",
      suggestedResolution: "Add ‘adverse event of special interest (AESI)’ at first use and to the abbreviation list.",
      humanValidation: true,
    },
  ],
};

const researchResult: ResearchInvestigationResult = {
  query: "What evidence links ADAMDEC1 to inflammatory disease?",
  searchedAt: "Local evidence simulation",
  papersFound: 23,
  highlyRelevant: 11,
  contradictions: 2,
  clusters: [
    {
      id: "macrophage",
      label: "Macrophage biology",
      paperCount: 7,
      strength: 82,
      summary: "Repeated association with macrophage-rich tissue and immune-cell differentiation contexts.",
    },
    {
      id: "matrix",
      label: "Extracellular matrix remodelling",
      paperCount: 5,
      strength: 71,
      summary: "Protease activity is linked to tissue remodelling, but causal disease evidence remains limited.",
    },
    {
      id: "signalling",
      label: "Inflammatory signalling",
      paperCount: 6,
      strength: 63,
      summary: "Expression correlates with inflammatory pathways; directionality differs across models.",
    },
    {
      id: "expression",
      label: "Disease-specific expression",
      paperCount: 5,
      strength: 58,
      summary: "Elevated expression appears in selected inflammatory tissue datasets, with cohort variability.",
    },
  ],
  sources: [
    {
      id: "mock-paper-01",
      title: "Macrophage-associated metalloprotease expression in inflamed intestinal tissue",
      sourceLabel: "Synthetic literature record",
      year: 2022,
      cluster: "Macrophage biology",
      evidenceStrength: 86,
      direction: "supporting",
      claim: "Reports higher ADAMDEC1 expression in macrophage-rich inflamed tissue samples.",
      provenance: "Mock record · replace with PubMed/Europe PMC identifier",
    },
    {
      id: "mock-paper-02",
      title: "Tissue remodelling signatures across chronic inflammatory cohorts",
      sourceLabel: "Synthetic literature record",
      year: 2021,
      cluster: "Extracellular matrix remodelling",
      evidenceStrength: 72,
      direction: "supporting",
      claim: "Associates ADAMDEC1 with a wider matrix-remodelling gene signature.",
      provenance: "Mock record · replace with verified citation",
    },
    {
      id: "mock-paper-03",
      title: "Context-dependent myeloid expression in inflammatory models",
      sourceLabel: "Synthetic literature record",
      year: 2023,
      cluster: "Inflammatory signalling",
      evidenceStrength: 61,
      direction: "mixed",
      claim: "Finds model-specific expression and does not support a consistent pro-inflammatory direction.",
      provenance: "Mock record · contradicting signal placeholder",
    },
    {
      id: "mock-paper-04",
      title: "Cross-cohort expression analysis of candidate inflammation markers",
      sourceLabel: "Synthetic literature record",
      year: 2020,
      cluster: "Disease-specific expression",
      evidenceStrength: 44,
      direction: "weak",
      claim: "Shows inconsistent association after adjustment for immune-cell composition.",
      provenance: "Mock record · weak evidence placeholder",
    },
  ],
  knowledgeGaps: [
    "Is ADAMDEC1 a driver of inflammation or a marker of macrophage state?",
    "Which disease contexts reproduce the association across independent cohorts?",
    "Does perturbation alter inflammatory outcomes without confounding tissue effects?",
  ],
  suggestedInvestigations: [
    "Compare cell-type-adjusted expression across independent disease cohorts.",
    "Review perturbation studies separately from observational expression evidence.",
    "Define evidence needed to distinguish causal mechanism from correlated marker.",
  ],
};

const deviationResult: DeviationInvestigationResult = {
  deviationId: "DEV-24A-017",
  investigatedAt: "Synthetic batch simulation",
  sourcesReviewed: 6,
  causes: [
    {
      id: "temperature",
      label: "Temperature excursion",
      strength: 84,
      status: "prioritise",
      evidence: [
        { label: "Reactor temperature exceeded the validated operating band for 17 minutes.", source: "Equipment historian · R-204", supports: true },
        { label: "Comparable excursion in Batch 19C preceded a 12% yield decrease.", source: "Historical deviation · DEV-19C-004", supports: true },
        { label: "Sample timestamp occurs 38 minutes after the excursion.", source: "Batch record · step 8.4", supports: false },
      ],
      nextCheck: "Verify control-loop output and independently reconstruct the temperature profile around step 8.4.",
    },
    {
      id: "material",
      label: "Raw material variability",
      strength: 61,
      status: "open",
      evidence: [
        { label: "Supplier lot changed from RM-4471 to RM-4520 for Batch 24A.", source: "Material genealogy", supports: true },
        { label: "Incoming quality attributes were within release specification.", source: "Certificate of analysis", supports: false },
      ],
      nextCheck: "Compare critical material attributes against recent high-yield batches, not release limits alone.",
    },
    {
      id: "operator",
      label: "Operator execution",
      strength: 24,
      status: "lower-priority",
      evidence: [
        { label: "All manual steps were completed within procedural windows.", source: "Electronic batch record", supports: false },
        { label: "Operator note records no intervention during the affected phase.", source: "Operator notes", supports: false },
      ],
      nextCheck: "Confirm audit-trail timestamps; deprioritise unless new evidence emerges.",
    },
    {
      id: "sensor",
      label: "Sensor calibration",
      strength: 33,
      status: "lower-priority",
      evidence: [
        { label: "Probe calibration was completed 11 days before the batch.", source: "Calibration system", supports: false },
        { label: "Secondary probe differed by 0.4°C during the excursion.", source: "Equipment historian · T-204B", supports: true },
      ],
      nextCheck: "Run a targeted two-probe comparison before excluding measurement error.",
    },
  ],
  recommendedPath: [
    "Reconstruct the temperature control-loop behavior during step 8.4.",
    "Compare raw-material critical attributes with the last five conforming batches.",
    "Review the two hypotheses with the process expert before assigning laboratory checks.",
  ],
};

export interface BiotechAgentService {
  runProtocolReview(): Promise<ProtocolReviewResult>;
  runResearchInvestigation(query: string): Promise<ResearchInvestigationResult>;
  runDeviationInvestigation(): Promise<DeviationInvestigationResult>;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const mockBiotechAgentService: BiotechAgentService = {
  async runProtocolReview() {
    return clone(protocolResult);
  },
  async runResearchInvestigation(query) {
    return { ...clone(researchResult), query };
  },
  async runDeviationInvestigation() {
    return clone(deviationResult);
  },
};
