"use client";

import { useState } from "react";
import { imagingTools } from "@/lib/biotech-case/research";
import AgentToolchain from "./AgentToolchain";
import ScientificOutputBadge from "./ScientificOutputBadge";
import styles from "./Research.module.css";

interface ResearchConceptAgentProps {
  id: string;
}

function LabMemory() {
  const [searched, setSearched] = useState(false);
  const [activeRecord, setActiveRecord] = useState("EXP-184");
  const records = [
    { id: "EXP-184", similarity: 91, observed: "Reduced transfection efficiency", shared: ["same cell line", "same reagent", "similar confluency"], note: "Possible reagent lot issue", source: "ELN / Macrophage programme / 2025-02-14" },
    { id: "EXP-207", similarity: 84, observed: "Reduced transfection efficiency", shared: ["same reagent", "same incubation protocol"], note: "Incubation increased from 4h to 6h; efficiency restored", source: "ELN / Assay optimisation / 2025-04-09" },
    { id: "RUN-055", similarity: 72, observed: "High well-to-well variability", shared: ["same instrument", "same reagent lot"], note: "Edge-well evaporation noted by operator", source: "Instrument run / Plate imager / 2024-11-28" },
  ];
  const record = records.find((item) => item.id === activeRecord) ?? records[0];
  return <div className={styles.memoryCanvas}>
    <header><div><span>Research history retrieval</span><h3>Have we seen this loss in transfection efficiency before?</h3></div><button type="button" onClick={() => setSearched(true)}>{searched ? "Search again" : "Retrieve related history"}</button></header>
    {!searched ? <div className={styles.memorySources}>{["ELN experiments", "Protocols", "Instrument runs", "Analysis notebooks", "Internal reports", "Troubleshooting notes"].map((source, index) => <span key={source}><i>{String(index + 1).padStart(2, "0")}</i><strong>{source}</strong><small>Permission-aware source</small></span>)}</div> : <>
      <div className={styles.memorySummary}><strong>3</strong><span>potentially related experiments found</span><small>Patterns surfaced from previous records · not root-cause claims</small></div>
      <div className={styles.memoryLayout}><aside>{records.map((item) => <button key={item.id} type="button" onClick={() => setActiveRecord(item.id)} className={item.id === activeRecord ? styles.memoryRecordActive : ""}><span>{item.id}</span><strong>{item.observed}</strong><small>{item.similarity}% contextual similarity</small></button>)}</aside><article>
        <header><div><span>Retrieved record</span><h3>{record.id}</h3></div><strong>{record.similarity}%<small>similarity</small></strong></header>
        <dl><div><dt>Observed</dt><dd>{record.observed}</dd></div><div><dt>Shared context</dt><dd>{record.shared.map((item) => <span key={item}>{item}</span>)}</dd></div><div><dt>Research note</dt><dd>{record.note}</dd></div><div><dt>Provenance</dt><dd>{record.source}</dd></div></dl>
        <button type="button">Open source record ↗</button>
      </article></div>
      <section className={styles.recurringFactors}><span>Possible recurring factors</span>{["Reagent lot", "Cell confluency", "Incubation duration"].map((factor) => <strong key={factor}>{factor}</strong>)}<small>Scientist assessment required</small></section>
    </>}
  </div>;
}

function ExperimentStrategy() {
  const [active, setActive] = useState("genetic");
  const strategies = [
    { id: "genetic", label: "A · Genetic perturbation", mechanism: "ADAMDEC1 is required for inflammatory response.", approach: "CRISPR knockout or knockdown", readouts: ["Cytokine secretion", "Transcriptional response", "Morphology", "Pathway activation"], controls: ["Wild type", "Non-targeting guide", "Rescue condition"], confounders: ["Differentiation state", "Editing efficiency", "Clonal effects"], scores: [9, 7, 5, 7, 8, 9] },
    { id: "correlation", label: "B · Expression correlation", mechanism: "ADAMDEC1 expression tracks inflammatory macrophage state.", approach: "Cross-dataset expression and phenotype analysis", readouts: ["State abundance", "Co-expression", "Disease association"], controls: ["Composition adjustment", "Independent cohort"], confounders: ["Batch effects", "Cell-state confounding"], scores: [6, 4, 3, 3, 5, 6] },
    { id: "pathway", label: "C · Pathway perturbation", mechanism: "An ADAMDEC1-adjacent pathway changes inflammatory response.", approach: "Pharmacological or pathway perturbation", readouts: ["Cytokines", "Pathway activation", "Viability"], controls: ["Vehicle", "Dose response", "Orthogonal inhibitor"], confounders: ["Off-target effects", "Compound toxicity"], scores: [7, 6, 4, 6, 6, 7] },
  ];
  const strategy = strategies.find((item) => item.id === active) ?? strategies[0];
  const dimensions = ["Scientific value", "Execution complexity", "Time", "Cost", "Evidence strength", "Interpretability"];
  return <div className={styles.strategyCanvas}>
    <header><span>Explore experimental strategies</span><h3>How could we test whether ADAMDEC1 influences macrophage inflammatory signalling?</h3><p>Three possible strategies · evidence and constraints combined · no strategy selected by AI</p></header>
    <div className={styles.strategyTabs}>{strategies.map((item) => <button key={item.id} type="button" className={active === item.id ? styles.strategyTabActive : ""} onClick={() => setActive(item.id)}>{item.label}</button>)}</div>
    <div className={styles.strategyLayout}><article>
      <ScientificOutputBadge type="hypothesis" /><h3>{strategy.mechanism}</h3><div className={styles.possibleApproach}><span>Possible approach</span><strong>{strategy.approach}</strong></div>
      <div className={styles.strategyColumns}><div><span>Potential readouts</span>{strategy.readouts.map((item) => <p key={item}>+ {item}</p>)}</div><div><span>Critical controls</span>{strategy.controls.map((item) => <p key={item}>+ {item}</p>)}</div><div><span>Known confounders</span>{strategy.confounders.map((item) => <p key={item}>! {item}</p>)}</div></div>
    </article><aside><span>Trade-off profile</span>{dimensions.map((dimension, index) => <div key={dimension}><p><span>{dimension}</span><strong>{strategy.scores[index]}/10</strong></p><i><span style={{ width: `${strategy.scores[index] * 10}%` }} /></i></div>)}</aside></div>
    <footer><div><span>Scientist decision required</span><p>Compare these strategies against local expertise, safety, feasibility and the evidence needed to change the scientific conclusion.</p></div><button type="button">Add scientist rationale</button></footer>
  </div>;
}

function ImagingInvestigator() {
  const [cluster, setCluster] = useState(3);
  return <div className={styles.imagingCanvas}>
    <header><div><span>Synthetic microscopy demonstration</span><h3>Compare control and ADAMDEC1-KO macrophage morphology.</h3></div><strong>Scientist validation required</strong></header>
    <div className={styles.imagingWorkflow}>{["Inspect", "Segment", "Features", "QC", "Compare", "Cluster", "Investigate", "Hypotheses"].map((step, index) => <span key={step} className={index < 6 ? styles.imagingStepDone : ""}><i>{index < 6 ? "✓" : index + 1}</i>{step}</span>)}</div>
    <AgentToolchain tools={imagingTools} compact />
    <div className={styles.imageGrid}><section><header><span>Control · synthetic field</span><small>replicate 2 / 4</small></header><div className={styles.microscopyField}>{Array.from({ length: 11 }).map((_, index) => <i key={index} className={styles[`cell_${(index % 4) + 1}`]} />)}</div></section><section><header><span>KO · synthetic field</span><small>replicate 2 / 4</small></header><div className={`${styles.microscopyField} ${styles.microscopyKo}`}>{Array.from({ length: 10 }).map((_, index) => <i key={index} className={styles[`cell_${((index + 2) % 4) + 1}`]} />)}</div></section></div>
    <div className={styles.phenotypeLayout}><aside>{[1, 2, 3, 4].map((item) => <button key={item} type="button" onClick={() => setCluster(item)} className={cluster === item ? styles.phenotypeActive : ""}><span>Phenotype {item}</span><strong>{item === 3 ? "KO ↑" : item === 2 ? "Control ↑" : "Mixed"}</strong></button>)}</aside><article>
      <header><div><ScientificOutputBadge type="observation" /><h3>Phenotype cluster {cluster}</h3></div><span>{cluster === 3 ? "KO condition ↑" : "Mixed conditions"}</span></header>
      {cluster === 3 ? <><div className={styles.metricRows}>{[["Cell area", "+18%"], ["Circularity", "−11%"], ["Protrusion count", "+23%"], ["Texture", "+9%"]].map(([name, value]) => <p key={name}><span>{name}</span><strong>{value}</strong></p>)}</div><p className={styles.replicateNote}>Observed across <strong>3 / 4</strong> synthetic experimental replicates</p><div className={styles.imageInterpretation}><ScientificOutputBadge type="interpretation" /><p>Potential change in activation or adhesion phenotype.</p><strong>Evidence: Moderate</strong><small>Pattern detection does not establish biological causality.</small></div></> : <p className={styles.emptyPhenotype}>This synthetic cluster shows no consistent condition-specific shift. Inspect representative masks before interpreting it.</p>}
    </article></div>
  </div>;
}

function TechnologyScout() {
  const [active, setActive] = useState("Multiplex imaging");
  const technologies = [
    ["Multiplex imaging", "Commercial", "Moderate", "Medium", "Single-cell", "High", "High"],
    ["Imaging mass cytometry", "Established", "Strong", "Low", "Single-cell", "High", "Medium"],
    ["Spatial barcoding", "Emerging", "Moderate", "High", "Near-cellular", "Medium", "High"],
    ["In situ sequencing", "Research-stage", "Weak", "Low", "Subcellular", "Very high", "Medium"],
  ];
  const selected = technologies.find((item) => item[0] === active) ?? technologies[0];
  return <div className={styles.scoutCanvas}>
    <header><div><span>Technology watch / 12-month horizon</span><h3>Which emerging spatial proteomics technologies might be worth evaluating?</h3></div><button type="button">Refresh scout</button></header>
    <div className={styles.scoutMetrics}>{[[427, "sources scanned"], [18, "technologies"], [9, "commercial"], [5, "emerging"], [4, "research-stage"]].map(([value, label]) => <span key={label}><strong>{value}</strong><small>{label}</small></span>)}</div>
    <div className={styles.scoutMatrix}><table><thead><tr>{["Technology", "Maturity", "Evidence", "Throughput", "Resolution", "Integration", "Strategic fit"].map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{technologies.map((row) => <tr key={row[0]} className={row[0] === active ? styles.scoutRowActive : ""} onClick={() => setActive(row[0])}>{row.map((cell, index) => <td key={`${row[0]}-${cell}`}>{index === 0 ? <button type="button">{cell}</button> : cell}</td>)}</tr>)}</tbody></table></div>
    <article className={styles.technologyDetail}><header><div><span>Potential technology to benchmark</span><h3>{selected[0]}</h3></div><strong>{selected[6]} strategic fit</strong></header><div><section><span>Mechanism</span><p>Spatially resolves multiplexed protein targets while preserving tissue context.</p></section><section><span>Maturity signals</span><p>{selected[1]} availability · {selected[2]} comparative evidence.</p></section><section><span>Infrastructure</span><p>Specialist imaging, panel design, image analysis and data-storage capacity.</p></section><section><span>Limitations</span><p>Panel constraints, batch effects, segmentation complexity and non-trivial integration.</p></section></div><footer><ScientificOutputBadge type="hypothesis" /><p>Benchmark question: does the platform add biologically useful spatial resolution beyond current imaging workflows?</p></footer></article>
  </div>;
}

export default function ResearchConceptAgent({ id }: ResearchConceptAgentProps) {
  if (id === "lab-memory") return <LabMemory />;
  if (id === "experiment-strategy") return <ExperimentStrategy />;
  if (id === "imaging-investigator") return <ImagingInvestigator />;
  if (id === "technology-scout") return <TechnologyScout />;
  return null;
}
