"use client";

import { useEffect, useState } from "react";
import {
  knowledgeGaps,
  nextInvestigations,
  scientificEvidenceClusters,
  scientificInvestigationTools,
  scientificRunSteps,
} from "@/lib/biotech-case/research";
import type { RunState } from "@/lib/biotech-case/types";
import AgentToolchain from "./AgentToolchain";
import EvidenceTrail from "./EvidenceTrail";
import ScientificOutputBadge from "./ScientificOutputBadge";
import ScientificRunState from "./ScientificRunState";
import styles from "./Research.module.css";

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export default function ScientificInvestigator() {
  const [question, setQuestion] = useState("What evidence links ADAMDEC1 to inflammatory disease and macrophage biology?");
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [hasResult, setHasResult] = useState(false);
  const [activeClusterId, setActiveClusterId] = useState(scientificEvidenceClusters[0].id);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const activeCluster = scientificEvidenceClusters.find((cluster) => cluster.id === activeClusterId) ?? scientificEvidenceClusters[0];

  useEffect(() => {
    if (!provenanceOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setProvenanceOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [provenanceOpen]);

  async function runInvestigation() {
    if (!question.trim()) return;
    setHasResult(false);
    setRunState("preparing");
    for (let index = 0; index < scientificRunSteps.length; index += 1) {
      setActiveStep(index);
      setRunState(index === 0 ? "preparing" : index > 7 ? "synthesising" : "investigating");
      await wait(190);
    }
    setHasResult(true);
    setRunState("completed");
  }

  return (
    <div className={styles.investigatorCanvas}>
      <header className={styles.investigatorQuery}>
        <label htmlFor="scientific-question">
          <span>Scientific question</span>
          <input id="scientific-question" value={question} onChange={(event) => setQuestion(event.target.value)} disabled={runState !== "idle" && runState !== "completed"} />
          <small>Entity-aware investigation · mock sources only</small>
        </label>
        <button type="button" onClick={runInvestigation} disabled={!question.trim() || (runState !== "idle" && runState !== "completed")}>
          <span aria-hidden="true">⌁</span>{hasResult ? "Run again" : "Run investigation"}
        </button>
      </header>

      {!hasResult ? (
        <div className={styles.investigatorReady}>
          <section className={styles.investigatorMission}>
            <span className={styles.demoLabel}>Scientific Investigation / deterministic demo</span>
            <h3>From question to inspectable evidence—not a generated answer.</h3>
            <p>The agent expands biological entities, coordinates retrieval tools, structures mechanistic claims and exposes what remains uncertain. Scientists retain judgement throughout.</p>
            <div className={styles.outputLegend}>
              {(["observation", "evidence", "interpretation", "hypothesis"] as const).map((type) => <ScientificOutputBadge key={type} type={type} />)}
            </div>
            <AgentToolchain tools={scientificInvestigationTools} activeTool={scientificRunSteps[activeStep]?.tool} />
          </section>
          <ScientificRunState state={runState} steps={scientificRunSteps} activeStep={activeStep} />
        </div>
      ) : (
        <div className={styles.investigationResults}>
          <section className={styles.investigationSummary}>
            <div><strong>23</strong><span>papers reviewed</span></div>
            <div><strong>11</strong><span>highly relevant</span></div>
            <div><strong>04</strong><span>evidence clusters</span></div>
            <div><strong>02</strong><span>contradictory findings</span></div>
            <div><strong>03</strong><span>knowledge gaps</span></div>
            <p><span className={styles.demoDot} /> Realistic mock evidence · not scientific findings</p>
          </section>

          <div className={styles.evidenceLayout}>
            <section className={styles.clusterRail}>
              <header><span>Evidence graph / clusters</span><small>Select to inspect</small></header>
              {scientificEvidenceClusters.map((cluster) => (
                <button key={cluster.id} type="button" onClick={() => setActiveClusterId(cluster.id)} className={cluster.id === activeClusterId ? styles.clusterActive : ""}>
                  <span className={`${styles.strengthSignal} ${styles[`strength_${cluster.strength}`]}`} aria-hidden="true" />
                  <span><strong>{cluster.label}</strong><small>{cluster.supportingEvidence} supporting items · {cluster.strength}</small></span>
                  <span>{cluster.contradictoryEvidence.length ? `${cluster.contradictoryEvidence.length} conflict` : "→"}</span>
                </button>
              ))}
              <AgentToolchain tools={scientificInvestigationTools} compact />
            </section>

            <section className={styles.clusterWorkspace}>
              <header className={styles.clusterWorkspaceHeader}>
                <div><span>Cluster {String(scientificEvidenceClusters.indexOf(activeCluster) + 1).padStart(2, "0")} / 04</span><h3>{activeCluster.label}</h3></div>
                <span className={`${styles.strengthPill} ${styles[`strength_${activeCluster.strength}`]}`}>{activeCluster.strength} evidence</span>
              </header>

              <article className={styles.typedFinding}>
                <ScientificOutputBadge type="evidence" />
                <p>{activeCluster.claim}</p>
                <button type="button" onClick={() => setProvenanceOpen(true)}>Inspect evidence trail <span>↗</span></button>
              </article>

              <div className={styles.clusterFacts}>
                <div><span>Supporting evidence</span><strong>{activeCluster.supportingEvidence} items</strong></div>
                <div><span>Evidence types</span><p>{activeCluster.evidenceTypes.join(" · ")}</p></div>
                <div><span>Organisms / systems</span><p>{activeCluster.modelSystems.join(" · ")}</p></div>
              </div>

              <div className={styles.uncertaintyCard}>
                <header><span>Evidence strength</span><strong>{activeCluster.strength}</strong></header>
                <h4>Why not high?</h4>
                <p>{activeCluster.strengthReason}</p>
                <ul>{activeCluster.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
              </div>

              <details className={styles.contradictionBlock} open={activeCluster.contradictoryEvidence.length > 0}>
                <summary><span>Contradictory evidence</span><strong>{activeCluster.contradictoryEvidence.length || "None found"}</strong></summary>
                {activeCluster.contradictoryEvidence.length ? (
                  <ul>{activeCluster.contradictoryEvidence.map((item) => <li key={item}><ScientificOutputBadge type="observation" /><p>{item}</p></li>)}</ul>
                ) : <p>No direct contradictory record was found in this simulated retrieval. Absence of contradiction is not confirmation.</p>}
              </details>
            </section>
          </div>

          <div className={styles.reviewGrid}>
            <section className={styles.knowledgeGapPanel}>
              <header><span>Knowledge gaps</span><strong>03 unresolved</strong></header>
              <ol>{knowledgeGaps.map((gap, index) => <li key={gap}><span>{String(index + 1).padStart(2, "0")}</span><p>{gap}</p></li>)}</ol>
            </section>
            <section className={styles.hypothesisReviewPanel}>
              <header><ScientificOutputBadge type="hypothesis" /><strong>Scientist review required</strong></header>
              <h3>Suggested next investigations</h3>
              <p>Possibilities to examine—not recommended experiments or autonomous decisions.</p>
              <ul>{nextInvestigations.map((item) => <li key={item}><span>→</span>{item}</li>)}</ul>
            </section>
          </div>

          <section className={styles.scientistBoundary}>
            <div><span>Human checkpoint</span><strong>Interpretation and next-step selection</strong></div>
            <p>The workspace can retrieve and organise evidence. A scientist must assess biological plausibility, model relevance and whether any hypothesis is worth testing.</p>
            <button type="button">Mark reviewed</button>
          </section>
        </div>
      )}

      {provenanceOpen ? <EvidenceTrail title={activeCluster.label} claim={activeCluster.claim} sources={activeCluster.provenance} onClose={() => setProvenanceOpen(false)} /> : null}
    </div>
  );
}
