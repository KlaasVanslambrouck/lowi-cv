"use client";

import { useState } from "react";
import { opportunities } from "@/lib/biotech-case/opportunities";
import { calculateSuitability, scoresFromOpportunity } from "@/lib/biotech-case/scoring";
import styles from "./BiotechPlayground.module.css";

interface PilotDesignerProps {
  selectedOpportunityId: string;
  onSelectOpportunity: (id: string) => void;
  onOpenAgent: (id: string) => void;
}

const phases = ["Discover", "Assess", "Prioritize", "Pilot", "Validate", "Scale"];

const pilotBoundaryById: Record<string, string> = {
  "protocol-guardian": "One Phase II protocol type, four predefined consistency checks and a single clinical review team.",
  "scientific-investigator": "One disease area, a limited set of biological targets and scientist-approved evidence categories.",
  "bioinformatics-investigator": "One scRNA-seq study type, synthetic or de-identified inputs and explicit approval at annotation and interpretation checkpoints.",
  "lab-memory": "One research team, a permission-scoped ELN collection and retrieval of similar experiments only.",
  "deviation-investigator": "One upstream process step, historical batch context and hypothesis prioritisation only.",
};

export default function PilotDesigner({ selectedOpportunityId, onSelectOpportunity, onOpenAgent }: PilotDesignerProps) {
  const opportunity = opportunities.find((item) => item.id === selectedOpportunityId) ?? opportunities[3];
  const suitability = calculateSuitability(scoresFromOpportunity(opportunity));
  const [boundary, setBoundary] = useState(
    pilotBoundaryById[opportunity.id] ?? `One ${opportunity.workflow.toLowerCase()} workflow, a defined user group and review-before-action outputs.`,
  );
  const [aiResponsibility, setAiResponsibility] = useState(
    opportunity.id === "protocol-guardian"
      ? "Identify, explain and source-link potential protocol inconsistencies."
      : opportunity.id === "scientific-investigator"
        ? "Retrieve, rank, structure and compare evidence; identify contradictions and surface knowledge gaps."
      : `Retrieve, compare and surface reviewable signals for ${opportunity.workflow.toLowerCase()}.`,
  );
  const [signals, setSignals] = useState(opportunity.researchFocused ? [
    { label: "Literature review time", selected: true },
    { label: "Relevant evidence recall", selected: true },
    { label: "Unsupported claim rate", selected: true },
    { label: "Provenance completeness", selected: true },
    { label: "Researcher acceptance", selected: true },
    { label: "Useful knowledge gaps", selected: true },
  ] : [
    { label: "Cycle time reduction", selected: true },
    { label: "Relevant signals discovered", selected: true },
    { label: "False-positive rate", selected: true },
    { label: "Reviewer acceptance", selected: true },
    { label: "Evidence traceability", selected: true },
    { label: "User trust after 3 runs", selected: false },
  ]);
  const [guardrails, setGuardrails] = useState(opportunity.researchFocused ? [
    { label: "Every scientific claim is traceable", enabled: true },
    { label: "Hypotheses are separated from evidence", enabled: true },
    { label: "No autonomous experimental decisions", enabled: true },
    { label: "Uncertainty and contradictions are exposed", enabled: true },
    { label: "Scientist approval is required", enabled: true },
  ] : [
    { label: "No autonomous source modification", enabled: true },
    { label: "Every material signal links to provenance", enabled: true },
    { label: "Confidence and uncertainty remain visible", enabled: true },
    { label: "Named reviewer approval is required", enabled: true },
  ]);

  const shortlist = opportunities.filter((item) => ["scientific-investigator", "bioinformatics-investigator", "lab-memory", "protocol-guardian", "deviation-investigator", "sop-knowledge"].includes(item.id));
  const pilotTitle = opportunity.id === "scientific-investigator" ? "Scientific Evidence Investigation Pilot" : opportunity.name;

  return (
    <section className={styles.pilotWorkspace} aria-labelledby="pilot-title">
      <div className={styles.sectionHeadingRow}>
        <div><p className={styles.kicker}>Design pilot / transformation boundary</p><h2 id="pilot-title" className={styles.sectionTitle}>Turn an AI idea into a controlled experiment.</h2></div>
        <p className={styles.sectionNote}>Editable workshop draft · changes stay local to this session.</p>
      </div>

      <ol className={styles.transformationFlow} aria-label="AI transformation flow">
        {phases.map((phase, index) => (
          <li key={phase} className={phase === "Pilot" ? styles.transformationFlowActive : index < 3 ? styles.transformationFlowDone : ""}>
            <span>{index < 3 ? "✓" : String(index + 1).padStart(2, "0")}</span><strong>{phase}</strong>
          </li>
        ))}
      </ol>

      <div className={styles.pilotLayout}>
        <aside className={styles.pilotShortlist}>
          <span className={styles.panelLabel}>Opportunity shortlist</span>
          {shortlist.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelectOpportunity(item.id)} className={item.id === opportunity.id ? styles.pilotShortlistActive : ""}>
              <span><strong>{item.name}</strong><small>{item.workflow}</small></span><span>{calculateSuitability(scoresFromOpportunity(item)).score}</span>
            </button>
          ))}
        </aside>

        <div className={styles.pilotDocument}>
          <header className={styles.pilotDocumentHeader}>
            <div><span className={styles.panelLabel}>Pilot canvas · draft 01</span><h3>{pilotTitle}</h3><p>{opportunity.description}</p></div>
            <div className={styles.pilotScore}><strong>{suitability.score}</strong><span>Suitability</span></div>
          </header>

          <div className={styles.pilotCanvasGrid}>
            <section className={styles.pilotField}>
              <span className={styles.pilotFieldNumber}>01</span><div><label htmlFor="pilot-problem">Problem</label><p id="pilot-problem">{opportunity.problem}</p></div>
            </section>
            <section className={styles.pilotField}>
              <span className={styles.pilotFieldNumber}>02</span><div><label htmlFor="pilot-boundary">Pilot boundary <small>editable</small></label><textarea id="pilot-boundary" value={boundary} onChange={(event) => setBoundary(event.target.value)} rows={3} /></div>
            </section>
            <section className={styles.pilotField}>
              <span className={styles.pilotFieldNumber}>03</span><div><label htmlFor="pilot-inputs">Inputs</label><p id="pilot-inputs">{opportunity.dataRequired}</p></div>
            </section>
            <section className={styles.pilotField}>
              <span className={styles.pilotFieldNumber}>04</span><div><label htmlFor="pilot-ai">AI responsibility <small>editable</small></label><textarea id="pilot-ai" value={aiResponsibility} onChange={(event) => setAiResponsibility(event.target.value)} rows={3} /></div>
            </section>
            <section className={styles.pilotField}>
              <span className={styles.pilotFieldNumber}>05</span><div><label htmlFor="pilot-human">Human responsibility</label><p id="pilot-human">{opportunity.humanRole}</p></div>
            </section>
            <section className={`${styles.pilotField} ${styles.pilotFieldSignals}`}>
              <span className={styles.pilotFieldNumber}>06</span><div><span className={styles.fieldLabel}>Success signals <small>select what matters</small></span><div className={styles.signalChecks}>
                {signals.map((signal, index) => <label key={signal.label}><input type="checkbox" checked={signal.selected} onChange={() => setSignals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, selected: !item.selected } : item))} /><span>{signal.label}</span></label>)}
              </div></div>
            </section>
          </div>

          <section className={styles.guardrailSection}>
            <div><span className={styles.panelLabel}>Operating guardrails</span><h4>Explicit boundaries make the pilot safer to learn from.</h4></div>
            <div className={styles.guardrailList}>
              {guardrails.map((guardrail, index) => (
                <label key={guardrail.label}><input type="checkbox" checked={guardrail.enabled} onChange={() => setGuardrails((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: !item.enabled } : item))} /><span className={styles.guardrailToggle} aria-hidden="true" /><strong>{guardrail.label}</strong></label>
              ))}
            </div>
          </section>

          <section className={styles.scaleGate}>
            <span className={styles.scaleGateIcon} aria-hidden="true">◇</span>
            <div><span className={styles.panelLabel}>Scale gate</span><p>{opportunity.researchFocused ? "Only expand if provenance is reliable, unsupported claims remain acceptably low, researchers trust ranking quality and the workflow integration is useful." : "Only expand after accuracy, reviewer trust and process integration meet predefined thresholds."}</p></div>
            <div><span>Indicative horizon</span><strong>{suitability.horizon}</strong></div>
          </section>

          <footer className={styles.pilotFooter}>
            <span>Operating model · <strong>{opportunity.researchProfile?.operatingModel ?? suitability.operatingModel}</strong></span>
            <button type="button" className={styles.secondaryButton} onClick={() => onOpenAgent(opportunity.id)}>Return to agent <span>↗</span></button>
          </footer>
        </div>
      </div>
    </section>
  );
}
