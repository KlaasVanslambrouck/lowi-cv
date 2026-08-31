export function runScientificInvestigation() {
  return {
    steps: [
      "Expanded ADAMDEC1 biological entities",
      "Retrieved 142 candidate publications",
      "Ranked 23 highly relevant sources",
      "Queried structured biological databases",
      "Extracted mechanistic evidence",
      "Checked contradictions and knowledge gaps",
    ],
    cluster: {
      title: "Inflammatory macrophage context",
      strength: "Moderate",
      observed: [
        "Altered ADAMDEC1 expression under inflammatory conditions",
        "Association with macrophage-related biological processes",
      ],
      limitations: ["Mostly observational evidence", "Limited direct perturbation evidence"],
    },
  };
}

export function runExperimentStrategy() {
  return {
    role: "Surfaces design gaps; never approves the experiment",
    rescueWarning: "A rescue condition may help separate an ADAMDEC1-specific phenotype from an editing-related effect.",
    primaryModelWarning: "Primary macrophages improve biological relevance but increase variability and material demand.",
  };
}

export function queryLabMemory() {
  return {
    matches: [
      {
        id: "EXP-184",
        similarity: "High",
        shared: ["same cell model", "same transfection reagent", "comparable density"],
        observed: "Efficiency dropped to 34% after a reagent lot change.",
        resolution: "Fresh reagent lot used; efficiency increased to 69%.",
      },
      {
        id: "EXP-207",
        similarity: "Moderate",
        shared: ["same cell model", "similar plate format"],
        observed: "Low efficiency with confluency above protocol range.",
        resolution: "Cell density corrected before the repeat.",
      },
    ],
    patterns: [
      { label: "Reagent lot", count: 2 },
      { label: "Cell confluency", count: 1 },
      { label: "Incubation time", count: 1 },
    ],
  };
}

export function runBioinformaticsAnalysis() {
  return {
    steps: ["Inspected metadata", "Checked sample QC", "Normalised expression data", "Compared conditions", "Ran pathway enrichment", "Checked literature context"],
    observation: "Inflammatory signalling score appears reduced in KO samples.",
    caveats: ["Effect size is modest", "One replicate deviates", "Sample count is limited"],
  };
}

export function runImagingAnalysis() {
  return {
    steps: ["Image quality check", "Cell segmentation", "Feature extraction", "Phenotype clustering", "Condition comparison"],
    cluster: "Phenotype cluster 3",
    enrichment: "+21% KO enrichment",
    features: [
      { label: "Cell area", value: "+16%" },
      { label: "Circularity", value: "−9%" },
      { label: "Protrusions", value: "+18%" },
    ],
  };
}
