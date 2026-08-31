"use client";

import Link from "next/link";
import type { Dispatch } from "react";
import {
  queryLabMemory,
  runBioinformaticsAnalysis,
  runExperimentStrategy,
  runImagingAnalysis,
  runScientificInvestigation,
} from "@/lib/biotech-case/experiment/agent-results";
import { eventById, EXPERIMENT_QUESTION } from "@/lib/biotech-case/experiment/scenario";
import { deriveExperimentReview } from "@/lib/biotech-case/experiment/simulation-engine";
import type { DecisionOption, ExperimentAction, ExperimentState, Observation } from "@/lib/biotech-case/experiment/experiment-types";
import styles from "./Experiment.module.css";

function ObservationGrid({ observations }: { observations: Observation[] }) {
  return (
    <div className={styles.observationGrid}>
      {observations.map((observation) => (
        <div key={observation.label} data-tone={observation.tone ?? "neutral"}>
          <span>{observation.label}</span>
          <strong>{observation.value}</strong>
        </div>
      ))}
    </div>
  );
}

function DecisionList({ decisions, onChoose }: { decisions: DecisionOption[]; onChoose: (id: string) => void }) {
  return (
    <div className={styles.decisionList}>
      {decisions.map((decision, index) => (
        <button key={decision.id} type="button" className={styles.decisionCard} onClick={() => onChoose(decision.id)}>
          <span className={styles.decisionIndex}>{String.fromCharCode(65 + index)}</span>
          <span className={styles.decisionCopy}>
            <strong>{decision.label}</strong>
            <small>{decision.description}</small>
            {decision.meta ? <em>{decision.meta}</em> : null}
          </span>
          <span className={styles.decisionArrow} aria-hidden="true">↗</span>
        </button>
      ))}
    </div>
  );
}

function AgentSteps({ label, steps }: { label: string; steps: string[] }) {
  return (
    <section className={styles.agentRun}>
      <header><span><i /> {label}</span><strong>Review ready</strong></header>
      <ol>
        {steps.map((step) => <li key={step}><span>✓</span><p>{step}</p></li>)}
      </ol>
      <footer>Deterministic simulation · no live model invoked</footer>
    </section>
  );
}

function BriefingView() {
  return (
    <div className={styles.briefingView}>
      <span className={styles.questionLabel}>Question</span>
      <blockquote>{EXPERIMENT_QUESTION}</blockquote>
      <div className={styles.briefingBoundary}>
        <span>Human authority</span>
        <p>Agents can investigate, compare and surface context. You select the hypothesis, approve the experiment and own the interpretation.</p>
      </div>
    </div>
  );
}

function ResearchFindings({ state }: { state: ExperimentState }) {
  const investigation = runScientificInvestigation();
  return (
    <>
      {state.flags.usedResearchAgent ? (
        <AgentSteps label="Scientific Investigation Agent" steps={investigation.steps} />
      ) : (
        <section className={styles.manualReview}>
          <span>Manual review completed</span>
          <strong>23 sources retained from a structured search</strong>
          <p>Close researcher control was preserved at the cost of substantially more attention.</p>
        </section>
      )}
      <section className={styles.evidenceCluster}>
        <header><span>Evidence cluster</span><strong>{investigation.cluster.strength} support</strong></header>
        <h3>{investigation.cluster.title}</h3>
        <div><span>Observed</span>{investigation.cluster.observed.map((item) => <p key={item}>+ {item}</p>)}</div>
        <div><span>Limitations</span>{investigation.cluster.limitations.map((item) => <p key={item}>− {item}</p>)}</div>
      </section>
      <h3 className={styles.decisionPrompt}>What do you investigate?</h3>
    </>
  );
}

function ExperimentDesignView({ state, dispatch }: { state: ExperimentState; dispatch: Dispatch<ExperimentAction> }) {
  const strategy = runExperimentStrategy();
  const select = <K extends keyof ExperimentState["design"]>(field: K, value: ExperimentState["design"][K]) => {
    dispatch({ type: "UPDATE_DESIGN", field, value });
  };
  return (
    <div className={styles.designView}>
      <div className={styles.copilotBanner}><span>Experiment Strategy Copilot</span><p>{strategy.role}</p></div>
      <fieldset>
        <legend>Perturbation</legend>
        {(["CRISPR knockout", "siRNA knockdown", "Observational comparison"] as const).map((value) => (
          <button key={value} type="button" className={state.design.perturbation === value ? styles.selectedOption : ""} onClick={() => select("perturbation", value)} aria-pressed={state.design.perturbation === value}>{value}</button>
        ))}
      </fieldset>
      <fieldset>
        <legend>Model</legend>
        {(["Macrophage cell line", "Primary macrophages"] as const).map((value) => (
          <button key={value} type="button" className={state.design.model === value ? styles.selectedOption : ""} onClick={() => select("model", value)} aria-pressed={state.design.model === value}>{value}</button>
        ))}
        {state.design.model === "Primary macrophages" ? <small className={styles.fieldNote}>{strategy.primaryModelWarning}</small> : null}
      </fieldset>
      <fieldset>
        <legend>Readout</legend>
        {(["Cytokine release", "Transcriptional response", "Morphology", "Multiple readouts"] as const).map((value) => (
          <button key={value} type="button" className={state.design.readout === value ? styles.selectedOption : ""} onClick={() => select("readout", value)} aria-pressed={state.design.readout === value}>{value}</button>
        ))}
      </fieldset>
      <fieldset>
        <legend>Controls</legend>
        <button type="button" className={state.design.nonTargetingControl ? styles.selectedOption : ""} onClick={() => select("nonTargetingControl", !state.design.nonTargetingControl)} aria-pressed={state.design.nonTargetingControl}>Non-targeting control <span>{state.design.nonTargetingControl ? "Included" : "Omitted"}</span></button>
        <button type="button" className={state.design.rescue ? styles.selectedOption : ""} onClick={() => select("rescue", !state.design.rescue)} aria-pressed={state.design.rescue}>Rescue condition <span>{state.design.rescue ? "Included" : "Omitted"}</span></button>
      </fieldset>
      {!state.design.rescue ? <div className={styles.inlineWarning}><strong>Potential issue</strong><p>{strategy.rescueWarning}</p><span>Scientific judgement required.</span></div> : null}
      <button type="button" className={styles.primaryAction} onClick={() => dispatch({ type: "APPROVE_DESIGN" })}>Approve experiment design <span>→</span></button>
      {state.designWarningOpen ? (
        <div className={styles.warningDialog} role="alertdialog" aria-labelledby="design-warning-title">
          <span>Experiment Strategy Copilot</span>
          <h3 id="design-warning-title">A key control is missing.</h3>
          <p>{!state.design.rescue ? strategy.rescueWarning : "Without a non-targeting control, editing-related effects will be harder to separate from the target phenotype."}</p>
          <small>The copilot cannot approve or reject this design.</small>
          <div>
            {!state.design.rescue ? <button type="button" onClick={() => select("rescue", true)}>Add rescue</button> : null}
            {!state.design.nonTargetingControl ? <button type="button" onClick={() => select("nonTargetingControl", true)}>Add control</button> : null}
            <button type="button" onClick={() => dispatch({ type: "APPROVE_DESIGN", acknowledgeWarning: true })}>Continue without</button>
            <button type="button" onClick={() => dispatch({ type: "DISMISS_DESIGN_WARNING" })}>Inspect design</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LabMemoryView() {
  const memory = queryLabMemory();
  return (
    <div className={styles.memoryView}>
      <div className={styles.memoryHeader}><span>4 related historical experiments found</span><strong>Source-linked records</strong></div>
      <div className={styles.memoryMatches}>
        {memory.matches.map((match) => (
          <article key={match.id}>
            <header><strong>{match.id}</strong><span>Similarity · {match.similarity}</span></header>
            <div className={styles.sharedTags}>{match.shared.map((item) => <span key={item}>{item}</span>)}</div>
            <p><small>Observed</small>{match.observed}</p>
            <p><small>Resolution recorded</small>{match.resolution}</p>
          </article>
        ))}
      </div>
      <section className={styles.patternsFound}>
        <header><span>Recurring patterns</span><strong>Patterns surfaced from historical records</strong></header>
        {memory.patterns.map((pattern) => (
          <div key={pattern.label}><span>{pattern.label}</span><i><b style={{ width: `${pattern.count * 42}%` }} /></i><strong>{pattern.count} {pattern.count === 1 ? "experiment" : "experiments"}</strong></div>
        ))}
        <p>Not labelled as root cause. The researcher decides whether the pattern justifies action.</p>
      </section>
    </div>
  );
}

const replicateValues = {
  control: [88, 96, 107, 109],
  ko: [58, 69, 74, 87],
  rescue: [81, 91, 98, 106],
};

function SyntheticDataView({ rescue }: { rescue: boolean }) {
  const series = rescue ? Object.entries(replicateValues) : Object.entries(replicateValues).filter(([key]) => key !== "rescue");
  return (
    <section className={styles.syntheticData}>
      <header><span>Synthetic experimental dataset</span><strong>4 replicates · 2 conditions{rescue ? " · 1 rescue" : ""}</strong></header>
      <div className={styles.dataChart} aria-label="Synthetic cytokine response by replicate">
        <div className={styles.axisLabels}><span>120</span><span>60</span><span>0</span></div>
        {series.map(([key, values]) => (
          <div key={key} className={styles.dataSeries}>
            <div>{values.map((value, index) => <i key={index} style={{ height: `${(value / 120) * 100}%` }} className={key === "ko" && index === 3 ? styles.deviatingBar : ""}><span>{value}</span></i>)}</div>
            <strong>{key === "ko" ? "ADAMDEC1 KO" : key === "rescue" ? "Rescue" : "Control"}</strong>
          </div>
        ))}
      </div>
      <p className={styles.dataCaveat}><span>!</span> Replicate KO-04 deviates from the group. Variability remains part of the interpretation.</p>
    </section>
  );
}

function SelectedReadouts({ state }: { state: ExperimentState }) {
  const hasExpression = state.design.readout === "Transcriptional response" || state.design.readout === "Multiple readouts";
  const hasMorphology = state.design.readout === "Morphology" || state.design.readout === "Multiple readouts";
  if (!hasExpression && !hasMorphology) return null;
  return (
    <div className={styles.readoutSignals}>
      {hasExpression ? <article><span>Transcriptomic signal</span><strong>Small inflammatory pathway shift</strong><small>One KO replicate is directionally inconsistent.</small></article> : null}
      {hasMorphology ? <article><span>Morphology</span><strong>Subtle feature shift</strong><small>Condition-level clustering requires imaging review.</small></article> : null}
    </div>
  );
}

function SyntheticMicroscopy() {
  return (
    <section className={styles.microscopyView}>
      <header><span>Synthetic microscopy</span><strong>Phenotype cluster 3 · +21% KO enrichment</strong></header>
      <div className={styles.microImages}>
        {["Control", "ADAMDEC1 KO"].map((condition, group) => (
          <div key={condition}><span>{condition}</span><figure>
            {Array.from({ length: 13 }, (_, index) => <i key={index} style={{ left: `${8 + ((index * 29) % 78)}%`, top: `${10 + ((index * 37) % 72)}%`, transform: `rotate(${index * 21}deg) scale(${group ? 1.15 : 0.9})` }} />)}
          </figure></div>
        ))}
      </div>
      <dl><div><dt>Cell area</dt><dd>+16%</dd></div><div><dt>Circularity</dt><dd>−9%</dd></div><div><dt>Protrusions</dt><dd>+18%</dd></div></dl>
      <p><strong>Interpretation</strong>A morphological phenotype may be associated with the KO condition.</p>
    </section>
  );
}

function AnalysisResultView({ state }: { state: ExperimentState }) {
  const bio = runBioinformaticsAnalysis();
  const imaging = runImagingAnalysis();
  const strategy = state.flags.analysisStrategy;
  return (
    <>
      {strategy === "bioinformatics" || strategy === "combined" ? <AgentSteps label="Bioinformatics Investigator" steps={bio.steps} /> : null}
      {strategy === "imaging" || strategy === "combined" ? <AgentSteps label="Imaging Investigator" steps={imaging.steps} /> : null}
      {strategy === "imaging" || strategy === "combined" ? <SyntheticMicroscopy /> : null}
      <section className={styles.analysisSummary}>
        <span>Interpretation · not conclusion</span>
        <blockquote>{bio.observation}</blockquote>
        <div><strong>Why not strong?</strong>{bio.caveats.map((caveat) => <p key={caveat}>— {caveat}</p>)}</div>
      </section>
      <div className={styles.automationTrap}><span>AI-generated mechanism candidate</span><h3>NF-κB pathway involvement</h3><p>The phrasing is confident. The provenance may not be.</p></div>
    </>
  );
}

function MechanismEvidenceView() {
  return (
    <section className={styles.provenanceView}>
      <div><span>Evidence</span><p>✓ Pathway enrichment</p><p>✓ Two observational publications</p></div>
      <div data-missing="true"><span>Missing</span><p>○ Direct pathway perturbation</p><p>○ Protein-level validation</p></div>
      <footer><strong>Current classification</strong><span>Hypothesis · requires scientist review</span></footer>
    </section>
  );
}

function InterpretationView({ state }: { state: ExperimentState }) {
  const hasCytokine = state.design.readout === "Cytokine release" || state.design.readout === "Multiple readouts";
  const hasExpression = state.design.readout === "Transcriptional response" || state.design.readout === "Multiple readouts";
  const hasMorphology = state.design.readout === "Morphology" || state.design.readout === "Multiple readouts";
  const evidence = [
    ["Literature", state.flags.continuedLiterature || state.flags.inspectedPublicData ? "Moderate+" : "Moderate", "Contextual support"],
    ["Cytokine assay", hasCytokine ? state.flags.continuedCompromisedPlate ? "Weak" : "Moderate" : "Not collected", hasCytokine ? "Modest effect" : "Outside design"],
    ["Transcriptomics", hasExpression ? "Moderate" : "Not collected", hasExpression ? "Pathway shift" : "Outside design"],
    ["Imaging", hasMorphology ? state.flags.analysisStrategy === "imaging" || state.flags.analysisStrategy === "combined" ? "Moderate" : "Limited" : "Not collected", hasMorphology ? "Morphology differs" : "Outside design"],
    ["Rescue", state.design.rescue ? "Partial" : "Missing", state.design.rescue ? "Phenotype restored" : "Not configured"],
  ];
  return (
    <section className={styles.currentEvidence}>
      <span>Current evidence</span>
      <div>{evidence.map(([label, strength, detail]) => <article key={label}><span>{label}</span><strong>{strength}</strong><small>{detail}</small></article>)}</div>
      {state.unsupportedInferenceRisk > 0 ? <p className={styles.riskNotice}>Unsupported inference risk is already elevated because a proposed mechanism was accepted without provenance review.</p> : null}
    </section>
  );
}

function CompletedView({ state, onReset }: { state: ExperimentState; onReset: () => void }) {
  const review = deriveExperimentReview(state);
  const metrics = [
    ["Evidence quality", review.evidenceQuality],
    ["Reproducibility", `${review.reproducibility}%`],
    ["Provenance completeness", `${review.provenanceCompleteness}%`],
    ["Unsupported claims", String(review.unsupportedClaims)],
    ["Researcher time", `${review.researcherHours} hours`],
    ["Experimental time", `${review.experimentalDays} days`],
    ["Budget remaining", `€${review.budgetRemaining.toLocaleString("en-GB")}`],
    ["AI-assisted steps", String(review.aiAssistedSteps)],
    ["Human scientific decisions", String(review.humanDecisions)],
  ];
  const agents = [
    ["Scientific Investigation Agent", "evidence discovery", "scientific-investigator"],
    ["Experiment Strategy Copilot", "experimental design", "experiment-strategy"],
    ["Lab Memory", "troubleshooting", "lab-memory"],
    ["Bioinformatics Investigator", "computational analysis", "bioinformatics-investigator"],
    ["Imaging Investigator", "phenotype analysis", "imaging-investigator"],
  ];
  return (
    <div className={styles.completedView}>
      <span className={styles.simulationLabel}>Simulation outcome · not an industry benchmark</span>
      <div className={styles.reviewMetrics}>{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <section className={styles.timeComparison}>
        <span>With AI support in this simulation</span>
        <p><strong>Literature investigation</strong><b>−74% researcher time</b></p>
        <p><strong>Data analysis</strong><b>−48% researcher time</b></p>
        <p><strong>Historical troubleshooting</strong><b>−92% search time</b></p>
      </section>
      <section className={styles.finalInterpretation}>
        <span>Current interpretation</span>
        <blockquote>{review.interpretation}</blockquote>
        <div><strong>Remaining uncertainty</strong>{review.uncertainty.map((item) => <p key={item}>— {item}</p>)}</div>
        <div><strong>Possible next investigations · for scientist consideration</strong><p>Independent editing strategy · primary macrophages · pathway perturbation · larger replicate set</p></div>
      </section>
      <section className={styles.behindExperiment}>
        <span>Behind the experiment</span>
        <p>This simulation integrated the bounded agents explored elsewhere in the Life Sciences AI Playground.</p>
        <div>{agents.map(([name, role, id]) => <Link key={id} href={`/cases/biotech-case?mode=lab&agent=${id}`}><strong>{name}</strong><span>{role}</span><i>↗</i></Link>)}</div>
      </section>
      <div className={styles.completionActions}><button type="button" onClick={onReset}>Run the experiment again</button><Link href="/cases/biotech-case?mode=research">Return to Research Loop</Link></div>
    </div>
  );
}

export default function ExperimentEventPanel({ state, dispatch }: { state: ExperimentState; dispatch: Dispatch<ExperimentAction> }) {
  const event = eventById.get(state.eventId) ?? eventById.get("briefing")!;
  const choose = (optionId: string) => dispatch({ type: "CHOOSE", optionId });
  const eventEyebrow = state.eventId === "low-transfection" ? `Day ${state.resources.day} / unexpected event` : event.eyebrow;
  const observations = event.observations?.map((observation) => {
    if (state.eventId === "wet-lab" && observation.label === "Conditions") {
      return { ...observation, value: state.design.rescue ? "2 + rescue" : "2 · no rescue" };
    }
    return observation;
  });
  const decisions = state.eventId === "analysis-choice"
    ? event.decisions.filter((decision) => {
        if (state.design.readout === "Multiple readouts") return true;
        if (state.design.readout === "Morphology") return decision.id === "analysis-basic" || decision.id === "analysis-imaging";
        if (state.design.readout === "Transcriptional response") return decision.id === "analysis-basic" || decision.id === "analysis-bioinformatics";
        return decision.id === "analysis-basic";
      })
    : event.decisions;

  return (
    <aside className={`${styles.eventPanel} ${state.phase === "completed" ? styles.eventPanelComplete : ""}`} aria-live="polite" aria-labelledby="event-title">
      <header className={styles.eventHeader}>
        <div><span>{eventEyebrow}</span><small>{event.phase.replace("-", " ")}</small></div>
        <h1 id="event-title">{event.title}</h1>
        <p>{event.description}</p>
      </header>
      <div className={styles.eventBody}>
        {state.eventId === "briefing" ? <BriefingView /> : null}
        {state.eventId === "research-findings" ? <ResearchFindings state={state} /> : null}
        {state.eventId === "experiment-design" ? <ExperimentDesignView state={state} dispatch={dispatch} /> : null}
        {observations?.length ? <ObservationGrid observations={observations} /> : null}
        {state.eventId === "lab-memory" ? <LabMemoryView /> : null}
        {state.eventId === "synthetic-data" ? <><SyntheticDataView rescue={state.design.rescue} /><SelectedReadouts state={state} /></> : null}
        {state.eventId === "analysis-result" ? <AnalysisResultView state={state} /> : null}
        {state.eventId === "mechanism-evidence" ? <MechanismEvidenceView /> : null}
        {state.eventId === "interpretation" ? <InterpretationView state={state} /> : null}
        {state.eventId === "completed" ? <CompletedView state={state} onReset={() => dispatch({ type: "RESET" })} /> : null}
        {decisions.length ? <DecisionList decisions={decisions} onChoose={choose} /> : null}
      </div>
      {state.phase !== "completed" ? <footer className={styles.eventFooter}><span>Current objective</span><strong>{event.objective}</strong><small>Scientific decisions remain with you.</small></footer> : null}
    </aside>
  );
}
