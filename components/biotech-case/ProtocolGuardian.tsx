"use client";

import { useState } from "react";
import AgentRunState from "./AgentRunState";
import {
  mockBiotechAgentService,
  protocolPassages,
} from "@/lib/biotech-case/mock-agent-engine";
import type {
  ProtocolReviewResult,
  RunState,
} from "@/lib/biotech-case/types";
import styles from "./BiotechPlayground.module.css";

const runSteps = [
  "Parsing protocol structure",
  "Mapping cross-references",
  "Comparing eligibility definitions",
  "Checking endpoint consistency",
  "Validating schedule references",
  "Detecting ambiguous terminology",
];

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

export default function ProtocolGuardian() {
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ProtocolReviewResult | null>(null);
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);

  const activeFinding = result?.findings.find(
    (finding) => finding.id === activeFindingId,
  );

  async function handleRun() {
    if (runState !== "idle" && runState !== "completed" && runState !== "error") return;
    setResult(null);
    setActiveFindingId(null);
    setRunState("preparing");
    setActiveStep(0);

    try {
      for (let index = 0; index < runSteps.length; index += 1) {
        setActiveStep(index);
        setRunState(
          index === 0
            ? "preparing"
            : index === runSteps.length - 1
              ? "synthesising"
              : "investigating",
        );
        await wait(index === 0 ? 420 : 480);
      }

      const review = await mockBiotechAgentService.runProtocolReview();
      setResult(review);
      setActiveFindingId(review.findings[0]?.id ?? null);
      setRunState("completed");
    } catch {
      setRunState("error");
    }
  }

  const passageIsHighlighted = (passageId: string) =>
    Boolean(activeFinding?.passageIds.includes(passageId));

  return (
    <div className={styles.prototypeCanvas}>
      <div className={styles.prototypeToolbar}>
        <div>
          <span className={styles.panelLabel}>Document under review</span>
          <strong>LX-201-02 · Phase II protocol</strong>
        </div>
        <div className={styles.toolbarMeta}>
          <span>Draft 0.7</span>
          <span>42 pages</span>
          <span>Local simulation</span>
        </div>
        <button
          type="button"
          className={styles.runButton}
          onClick={handleRun}
          disabled={runState !== "idle" && runState !== "completed" && runState !== "error"}
        >
          <span className={styles.runButtonIcon} aria-hidden="true">▶</span>
          {runState === "completed" ? "Run again" : "Run review"}
        </button>
      </div>

      <div className={styles.protocolSplit}>
        <section className={styles.documentViewer} aria-label="Clinical trial protocol">
          <div className={styles.documentHeader}>
            <div>
              <span className={styles.documentMark}>LX</span>
              <div>
                <strong>Clinical study protocol</strong>
                <span>LX-201 · inflammatory disease</span>
              </div>
            </div>
            <span className={styles.documentPage}>03 / 42</span>
          </div>
          <div className={styles.documentBody}>
            <div className={styles.documentTitleBlock}>
              <span>CONFIDENTIAL · WORKING DRAFT</span>
              <h3>A randomised, double-blind study of LX-201</h3>
              <p>Protocol no. LX-201-02 · Version 0.7</p>
            </div>
            {protocolPassages.map((passage) => {
              const highlighted = passageIsHighlighted(passage.id);
              return (
                <article
                  key={passage.id}
                  className={`${styles.protocolSection} ${highlighted ? styles.protocolSectionHighlighted : ""}`}
                  id={`protocol-${passage.id}`}
                >
                  <span className={styles.protocolSectionNumber}>{passage.number}</span>
                  <div>
                    <h4>{passage.section}</h4>
                    <p>{passage.text}</p>
                  </div>
                  {highlighted ? (
                    <span className={styles.annotationFlag}>Finding</span>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.investigationPanel} aria-label="Protocol review findings">
          {!result ? (
            <>
              <div className={styles.investigationIntro}>
                <span className={styles.agentGlyph} aria-hidden="true">PG</span>
                <div>
                  <span className={styles.panelLabel}>Bounded review agent</span>
                  <h3>Protocol consistency review</h3>
                </div>
              </div>
              <p className={styles.investigationCopy}>
                Runs predefined consistency checks, links each signal to source passages and leaves resolution with the study team.
              </p>
              <AgentRunState state={runState} steps={runSteps} activeStep={activeStep} />
              {runState === "idle" ? (
                <div className={styles.emptySignal}>
                  <span aria-hidden="true">⌁</span>
                  <p>No findings yet. The document remains unchanged until a human resolves a reviewed signal.</p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className={styles.resultSummary}>
                <div>
                  <span className={styles.liveLabel}>
                    <span className={styles.liveDot} aria-hidden="true" /> Review ready
                  </span>
                  <h3>{result.findings.length} findings require review</h3>
                  <p>{result.checksCompleted} checks · {result.reviewedAt}</p>
                </div>
                <button type="button" className={styles.textButton} onClick={handleRun}>Run again</button>
              </div>

              <div className={styles.findingList}>
                {result.findings.map((finding, index) => {
                  const active = finding.id === activeFindingId;
                  return (
                    <button
                      key={finding.id}
                      type="button"
                      className={`${styles.findingCard} ${active ? styles.findingCardActive : ""}`}
                      onClick={() => {
                        setActiveFindingId(finding.id);
                        document.getElementById(`protocol-${finding.passageIds[0]}`)?.scrollIntoView({
                          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                          block: "center",
                        });
                      }}
                      aria-pressed={active}
                    >
                      <span className={styles.findingIndex}>F-{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.findingCardMain}>
                        <span className={styles.findingCardHeader}>
                          <strong>{finding.title}</strong>
                          <span className={`${styles.severity} ${styles[`severity${finding.severity}`]}`}>
                            {finding.severity}
                          </span>
                        </span>
                        <small>{finding.affectedSections.join(" ↔ ")}</small>
                      </span>
                      <span className={styles.confidence}>{finding.confidence}%</span>
                    </button>
                  );
                })}
              </div>

              {activeFinding ? (
                <article className={styles.findingDetail}>
                  <div className={styles.findingDetailHeader}>
                    <div>
                      <span className={styles.panelLabel}>Agent explanation</span>
                      <h4>{activeFinding.title}</h4>
                    </div>
                    <span className={styles.reviewRequired}>Review required</span>
                  </div>
                  <p className={styles.findingExplanation}>{activeFinding.explanation}</p>
                  <dl className={styles.findingFacts}>
                    <div>
                      <dt>Why it matters</dt>
                      <dd>{activeFinding.whyItMatters}</dd>
                    </div>
                    <div>
                      <dt>Suggested resolution</dt>
                      <dd>{activeFinding.suggestedResolution}</dd>
                    </div>
                    <div>
                      <dt>Source trace</dt>
                      <dd>{activeFinding.affectedSections.join(" · ")}</dd>
                    </div>
                  </dl>
                  <div className={styles.reviewActions}>
                    <button type="button" className={styles.secondaryButton}>Accept signal</button>
                    <button type="button" className={styles.ghostButton}>Dismiss with rationale</button>
                  </div>
                </article>
              ) : null}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
