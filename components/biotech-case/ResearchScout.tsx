"use client";

import { useState } from "react";
import AgentRunState from "./AgentRunState";
import { mockBiotechAgentService } from "@/lib/biotech-case/mock-agent-engine";
import type { ResearchInvestigationResult, RunState } from "@/lib/biotech-case/types";
import styles from "./BiotechPlayground.module.css";

const steps = [
  "Searching scientific literature",
  "Deduplicating sources",
  "Ranking relevance",
  "Extracting mechanistic claims",
  "Clustering evidence",
  "Detecting contradictions",
  "Mapping knowledge gaps",
];

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

export default function ResearchScout() {
  const [query, setQuery] = useState("What evidence links ADAMDEC1 to inflammatory disease?");
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ResearchInvestigationResult | null>(null);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  async function handleRun() {
    if (!query.trim()) return;
    setResult(null);
    setRunState("preparing");
    for (let index = 0; index < steps.length; index += 1) {
      setActiveStep(index);
      setRunState(index === 0 ? "preparing" : index === steps.length - 1 ? "synthesising" : "investigating");
      await wait(360);
    }
    const investigation = await mockBiotechAgentService.runResearchInvestigation(query);
    setResult(investigation);
    setActiveCluster(investigation.clusters[0]?.id ?? null);
    setRunState("completed");
  }

  const visibleSources = result?.sources.filter((source) => {
    if (!activeCluster) return true;
    const label = result.clusters.find((cluster) => cluster.id === activeCluster)?.label;
    return source.cluster === label;
  });

  return (
    <div className={styles.researchCanvas}>
      <div className={styles.researchQueryBar}>
        <label htmlFor="research-question">
          <span className={styles.panelLabel}>Research question</span>
          <input
            id="research-question"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={runState !== "idle" && runState !== "completed"}
          />
        </label>
        <button
          type="button"
          className={styles.runButton}
          onClick={handleRun}
          disabled={!query.trim() || (runState !== "idle" && runState !== "completed")}
        >
          <span className={styles.runButtonIcon} aria-hidden="true">⌁</span>
          {runState === "completed" ? "Run again" : "Run investigation"}
        </button>
      </div>

      {!result ? (
        <div className={styles.researchIdleGrid}>
          <div className={styles.researchIntent}>
            <span className={styles.agentGlyph} aria-hidden="true">RS</span>
            <h3>Evidence before answers</h3>
            <p>Scout is configured to retrieve, cluster and challenge evidence. It does not turn association into causality.</p>
            <div className={styles.sourcePills}>
              <span>PubMed-ready</span><span>Europe PMC-ready</span><span>OpenAlex-ready</span>
            </div>
          </div>
          <AgentRunState state={runState} steps={steps} activeStep={activeStep} />
        </div>
      ) : (
        <div className={styles.researchResults}>
          <div className={styles.evidenceMetrics}>
            {[
              [result.papersFound, "papers found"],
              [result.highlyRelevant, "highly relevant"],
              [result.clusters.length, "evidence clusters"],
              [result.contradictions, "contradictions"],
              [result.knowledgeGaps.length, "knowledge gaps"],
            ].map(([value, label]) => (
              <div key={String(label)}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>

          <div className={styles.evidenceWorkspace}>
            <section className={styles.clusterPanel}>
              <div className={styles.panelHeading}>
                <div><span className={styles.panelLabel}>Evidence map</span><h3>Four recurring clusters</h3></div>
                <span className={styles.mockBadge}>Synthetic records</span>
              </div>
              <div className={styles.clusterList}>
                {result.clusters.map((cluster) => (
                  <button
                    type="button"
                    key={cluster.id}
                    className={`${styles.clusterCard} ${cluster.id === activeCluster ? styles.clusterCardActive : ""}`}
                    onClick={() => setActiveCluster(cluster.id === activeCluster ? null : cluster.id)}
                    aria-pressed={cluster.id === activeCluster}
                  >
                    <span className={styles.clusterCount}>{cluster.paperCount} papers</span>
                    <strong>{cluster.label}</strong>
                    <p>{cluster.summary}</p>
                    <span className={styles.strengthBar}>
                      <span style={{ width: `${cluster.strength}%` }} />
                    </span>
                    <small>Evidence strength {cluster.strength}%</small>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.sourcesPanel}>
              <div className={styles.panelHeading}>
                <div><span className={styles.panelLabel}>Source-level evidence</span><h3>{activeCluster ? "Filtered evidence" : "All evidence"}</h3></div>
                {activeCluster ? <button type="button" className={styles.textButton} onClick={() => setActiveCluster(null)}>Clear filter</button> : null}
              </div>
              <div className={styles.sourceList}>
                {visibleSources?.map((source) => (
                  <article key={source.id} className={styles.sourceCard}>
                    <div className={styles.sourceCardMeta}>
                      <span className={`${styles.directionBadge} ${styles[`direction_${source.direction}`]}`}>{source.direction}</span>
                      <span>{source.year}</span><span>{source.cluster}</span>
                    </div>
                    <h4>{source.title}</h4>
                    <p>{source.claim}</p>
                    <div className={styles.sourceFooter}>
                      <span>{source.provenance}</span><strong>{source.evidenceStrength}%</strong>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.researchBottomGrid}>
            <section className={styles.gapPanel}>
              <span className={styles.panelLabel}>Unresolved / knowledge gaps</span>
              <ol>{result.knowledgeGaps.map((gap, index) => <li key={gap}><span>0{index + 1}</span>{gap}</li>)}</ol>
            </section>
            <section className={styles.hypothesisPanel}>
              <span className={styles.panelLabel}>Suggested next investigations</span>
              <p>Research hypotheses for scientist review — not automatic experiment instructions.</p>
              <ul>{result.suggestedInvestigations.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
