"use client";

import { useState } from "react";
import AgentRunState from "./AgentRunState";
import { mockBiotechAgentService } from "@/lib/biotech-case/mock-agent-engine";
import type { DeviationInvestigationResult, RunState } from "@/lib/biotech-case/types";
import styles from "./BiotechPlayground.module.css";

const steps = [
  "Loading batch genealogy",
  "Aligning equipment readings",
  "Checking SOP references",
  "Comparing historical deviations",
  "Testing competing hypotheses",
  "Building investigation path",
];

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

export default function DeviationInvestigator() {
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<DeviationInvestigationResult | null>(null);
  const [activeCause, setActiveCause] = useState<string | null>(null);

  async function handleRun() {
    setResult(null);
    setRunState("preparing");
    for (let index = 0; index < steps.length; index += 1) {
      setActiveStep(index);
      setRunState(index === 0 ? "preparing" : index === steps.length - 1 ? "synthesising" : "investigating");
      await wait(410);
    }
    const investigation = await mockBiotechAgentService.runDeviationInvestigation();
    setResult(investigation);
    setActiveCause(investigation.causes[0]?.id ?? null);
    setRunState("completed");
  }

  const selectedCause = result?.causes.find((cause) => cause.id === activeCause);

  return (
    <div className={styles.deviationCanvas}>
      <header className={styles.deviationHeader}>
        <div>
          <span className={styles.panelLabel}>DEV-24A-017 · open investigation</span>
          <h3>Batch 24A shows an unexpected 18% decrease in process yield.</h3>
        </div>
        <button
          type="button"
          className={styles.runButton}
          onClick={handleRun}
          disabled={runState !== "idle" && runState !== "completed"}
        >
          <span className={styles.runButtonIcon} aria-hidden="true">◇</span>
          {runState === "completed" ? "Restart investigation" : "Start investigation"}
        </button>
      </header>

      {!result ? (
        <div className={styles.deviationIdle}>
          <div className={styles.dataSourceGrid}>
            {["Batch record", "Equipment readings", "SOP references", "Operator notes", "Environmental monitoring", "Historical deviations"].map((source, index) => (
              <div key={source}><span>0{index + 1}</span><strong>{source}</strong><small>Synthetic source ready</small></div>
            ))}
          </div>
          <AgentRunState state={runState} steps={steps} activeStep={activeStep} />
        </div>
      ) : (
        <div className={styles.deviationResults}>
          <section className={styles.causalTree} aria-label="Causal investigation tree">
            <div className={styles.rootCauseNode}>
              <span>Observed event</span><strong>18% yield decrease</strong><small>Batch 24A · Step 8.4</small>
            </div>
            <span className={styles.treeTrunk} aria-hidden="true" />
            <div className={styles.causeNodes}>
              {result.causes.map((cause) => (
                <button
                  key={cause.id}
                  type="button"
                  className={`${styles.causeNode} ${cause.id === activeCause ? styles.causeNodeActive : ""}`}
                  onClick={() => setActiveCause(cause.id)}
                  aria-pressed={cause.id === activeCause}
                >
                  <span className={styles.causeNodeStatus}>{cause.status.replace("-", " ")}</span>
                  <strong>{cause.label}</strong>
                  <span className={styles.causeStrength}><span style={{ width: `${cause.strength}%` }} /></span>
                  <small>{cause.strength}% evidence strength</small>
                </button>
              ))}
            </div>
          </section>

          <div className={styles.causalDetailGrid}>
            {selectedCause ? (
              <section className={styles.causeEvidence}>
                <div className={styles.panelHeading}>
                  <div><span className={styles.panelLabel}>Competing hypothesis</span><h3>{selectedCause.label}</h3></div>
                  <strong className={styles.causeScore}>{selectedCause.strength}%</strong>
                </div>
                <div className={styles.evidenceRows}>
                  {selectedCause.evidence.map((evidence) => (
                    <div key={evidence.label}>
                      <span className={evidence.supports ? styles.supportIcon : styles.contradictIcon} aria-label={evidence.supports ? "Supporting" : "Contradicting"}>{evidence.supports ? "+" : "−"}</span>
                      <p><strong>{evidence.label}</strong><small>{evidence.source}</small></p>
                    </div>
                  ))}
                </div>
                <div className={styles.nextCheck}><span>Recommended next check</span><p>{selectedCause.nextCheck}</p></div>
              </section>
            ) : null}

            <section className={styles.recommendedPath}>
              <span className={styles.panelLabel}>Recommended investigation path</span>
              <ol>{result.recommendedPath.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
              <div className={styles.humanGuardrail}>
                <strong>QA decision boundary</strong>
                <p>Root-cause determination remains the responsibility of the qualified investigation and QA team.</p>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
