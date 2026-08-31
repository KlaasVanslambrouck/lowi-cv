"use client";

import { useState } from "react";
import { bioinformaticsTools } from "@/lib/biotech-case/research";
import AgentToolchain from "./AgentToolchain";
import ScientificOutputBadge from "./ScientificOutputBadge";
import styles from "./Research.module.css";

const workflowSteps = [
  ["Dataset inspection", "Python", "complete"],
  ["Quality control", "Scanpy", "complete"],
  ["Normalization", "Scanpy", "complete"],
  ["Clustering", "Scanpy", "complete"],
  ["Cell-type annotation", "Scientist checkpoint", "review"],
  ["Differential abundance", "R", "ready"],
  ["Differential expression", "Python", "ready"],
  ["Pathway enrichment", "Pathway DB", "ready"],
  ["Literature validation", "Literature search", "ready"],
  ["Biological interpretation", "Scientist checkpoint", "blocked"],
] as const;

const clusters = [
  { x: 88, y: 84, color: "violet", label: "T cells" }, { x: 102, y: 94, color: "violet", label: "T cells" },
  { x: 78, y: 100, color: "violet", label: "T cells" }, { x: 112, y: 78, color: "violet", label: "T cells" },
  { x: 175, y: 70, color: "blue", label: "Macrophage 2" }, { x: 190, y: 82, color: "blue", label: "Macrophage 2" },
  { x: 166, y: 92, color: "blue", label: "Macrophage 2" }, { x: 205, y: 68, color: "blue", label: "Macrophage 2" },
  { x: 224, y: 137, color: "copper", label: "Cluster 7" }, { x: 242, y: 148, color: "copper", label: "Cluster 7" },
  { x: 212, y: 153, color: "copper", label: "Cluster 7" }, { x: 254, y: 128, color: "copper", label: "Cluster 7" },
  { x: 124, y: 162, color: "muted", label: "Tumour" }, { x: 142, y: 178, color: "muted", label: "Tumour" },
  { x: 105, y: 178, color: "muted", label: "Tumour" }, { x: 154, y: 151, color: "muted", label: "Tumour" },
];

export default function BioinformaticsInvestigator() {
  const [running, setRunning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [annotation, setAnnotation] = useState<"pending" | "accepted" | "override">("pending");
  const [markersOpen, setMarkersOpen] = useState(false);

  async function runAnalysis() {
    setRunning(true);
    setHasResult(false);
    await new Promise((resolve) => window.setTimeout(resolve, 1250));
    setHasResult(true);
    setRunning(false);
    setAnnotation("pending");
  }

  return (
    <div className={styles.bioinformaticsCanvas}>
      <header className={styles.bioQuestion}>
        <div><span>Research question</span><h3>Which macrophage populations change after treatment, and which pathways may explain the difference?</h3><p>scRNA-seq · treated vs untreated mouse tumour samples</p></div>
        <button type="button" onClick={runAnalysis} disabled={running}>{running ? "Running analysis…" : hasResult ? "Restart analysis" : "Start investigation"}</button>
      </header>

      <div className={styles.syntheticBanner}><span>Synthetic demonstration dataset</span><p>All cells, markers and results below are fabricated to demonstrate workflow interaction—not experimental claims.</p></div>

      <div className={styles.bioWorkflowLayout}>
        <aside className={styles.pipelineRail}>
          <header><span>Analysis plan</span><strong>10 explicit steps</strong></header>
          <ol>{workflowSteps.map(([label, tool, state], index) => {
            const status = !hasResult ? (running && index < 4 ? "running" : "waiting") : state;
            return <li key={label} className={styles[`pipeline_${status}`]}><span>{status === "complete" ? "✓" : status === "review" ? "!" : String(index + 1).padStart(2, "0")}</span><p><strong>{label}</strong><small>{tool}</small></p></li>;
          })}</ol>
          <AgentToolchain tools={bioinformaticsTools} compact />
        </aside>

        <section className={styles.bioWorkspace}>
          {!hasResult ? (
            <div className={styles.bioReadyState}>
              <div className={styles.datasetStats}><span><strong>8</strong> samples</span><span><strong>24,610</strong> cells</span><span><strong>2</strong> conditions</span><span><strong>4</strong> replicates</span></div>
              <div className={styles.pipelinePreview}><span /> <i /> <span /> <i /> <span /> <i /> <span /></div>
              <h3>{running ? "Inspecting dataset and constructing a reproducible analysis…" : "Analysis plan ready for review."}</h3>
              <p>The agent will run computational steps, but pause before cell-type labels and biological interpretation are accepted.</p>
            </div>
          ) : (
            <>
              <div className={styles.bioTopGrid}>
                <article className={styles.umapCard}>
                  <header><div><ScientificOutputBadge type="observation" /><strong>Cell-state map</strong></div><span>UMAP-like projection</span></header>
                  <svg viewBox="0 0 320 225" role="img" aria-label="Synthetic UMAP-like visualization of cell clusters">
                    <line x1="28" y1="198" x2="298" y2="198" /><line x1="28" y1="198" x2="28" y2="20" />
                    {clusters.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={index % 3 === 0 ? 7 : 5} className={styles[`umap_${point.color}`]}><title>{point.label}</title></circle>)}
                    <text x="214" y="184">Cluster 7 ↑ treated</text><text x="248" y="215">UMAP 1</text><text x="8" y="36" transform="rotate(-90 8 36)">UMAP 2</text>
                  </svg>
                  <footer><span><i className={styles.umap_violet} /> T cells</span><span><i className={styles.umap_blue} /> resident macrophage</span><span><i className={styles.umap_copper} /> cluster 7</span><span><i className={styles.umap_muted} /> tumour</span></footer>
                </article>

                <article className={styles.annotationCheckpoint}>
                  <header><span>Human checkpoint / cell type annotation</span><strong className={styles[`annotation_${annotation}`]}>{annotation}</strong></header>
                  <h3>Cluster 7 → inflammatory macrophage</h3>
                  <p className={styles.qualitativeConfidence}><strong>Evidence strength: Moderate</strong><span>Marker pattern is coherent, but the state may overlap with activated monocytes.</span></p>
                  <div className={styles.markerStrip}>{[["Lyz2", "+2.8"], ["Csf1r", "+2.2"], ["Lgals3", "+3.1"], ["Apoe", "+1.9"]].map(([marker, value]) => <span key={marker}><strong>{marker} ↑</strong><small>{value} logFC</small></span>)}</div>
                  {markersOpen ? <div className={styles.markerDetail}>Also inspected: Adgre1, Itgam, Fcgr3, S100a8. Ambiguity remains between an inflammatory state and infiltrating monocytes.</div> : null}
                  <div className={styles.checkpointActions}><button type="button" onClick={() => setAnnotation("accepted")}>Accept label</button><button type="button" onClick={() => setMarkersOpen((current) => !current)}>Inspect markers</button><button type="button" onClick={() => setAnnotation("override")}>Override</button></div>
                </article>
              </div>

              <div className={styles.bioResultGrid}>
                <article><header><ScientificOutputBadge type="observation" /><strong>Population shift</strong></header><p><strong>Cluster 7</strong> is more frequent in the treated condition across 3 of 4 synthetic replicates.</p><span className={styles.populationBar}><i style={{ width: "34%" }} /><i style={{ width: "57%" }} /></span><small>Untreated 8.4% · Treated 14.1%</small></article>
                <article><header><ScientificOutputBadge type="evidence" /><strong>Differential expression</strong></header><table><tbody>{[["Lgals3", "+3.1", "q 0.004"], ["Il1b", "+2.4", "q 0.012"], ["Apoe", "+1.9", "q 0.018"]].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></article>
                <article><header><ScientificOutputBadge type="interpretation" /><strong>Pathways to inspect</strong></header><ul><li>TNF signalling <span>moderate</span></li><li>Phagosome maturation <span>moderate</span></li><li>Lipid metabolism <span>weak</span></li></ul></article>
              </div>

              <section className={styles.bioInterpretation}>
                <ScientificOutputBadge type="interpretation" />
                <div><h3>A treatment-associated inflammatory macrophage state may be enriched.</h3><p>Why “may”? The sample count is limited, annotation remains scientist-controlled, and differential abundance does not establish mechanism.</p></div>
                <button type="button" disabled={annotation === "pending"}>{annotation === "pending" ? "Approve annotation first" : "Continue to interpretation review"}</button>
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
