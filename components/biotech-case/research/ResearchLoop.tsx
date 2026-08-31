"use client";

import Link from "next/link";
import { useState } from "react";
import { researchLoopStages } from "@/lib/biotech-case/research";
import type { ResearchStage } from "@/lib/biotech-case/types";
import ScientificOutputBadge from "./ScientificOutputBadge";
import styles from "./Research.module.css";
import shared from "../BiotechPlayground.module.css";

interface ResearchLoopProps {
  onOpenAgent: (id: string) => void;
  onEvaluate: (id: string) => void;
}

const stagePositions: Record<ResearchStage, { top: string; left: string }> = {
  question: { top: "5%", left: "50%" },
  evidence: { top: "23%", left: "78%" },
  experiment: { top: "54%", left: "84%" },
  "wet-lab": { top: "81%", left: "66%" },
  analysis: { top: "81%", left: "34%" },
  interpretation: { top: "54%", left: "16%" },
  "next-experiment": { top: "23%", left: "22%" },
};

const capabilities = [
  { label: "Lab Memory", agentId: "lab-memory", position: "topLeft" },
  { label: "Technology Scouting", agentId: "technology-scout", position: "topRight" },
  { label: "Scientific Knowledge", agentId: "scientific-investigator", position: "bottomLeft" },
  { label: "Data Stewardship", agentId: "bioinformatics-investigator", position: "bottomRight" },
];

const patterns = [
  ["Scientific Investigator", "retrieves + challenges evidence"],
  ["Computational Operator", "coordinates explicit tool steps"],
  ["Evidence Synthesiser", "structures claims + uncertainty"],
  ["Strategy Copilot", "compares possible approaches"],
  ["Institutional Memory", "recovers source-linked history"],
  ["Technology Scout", "maps maturity + strategic fit"],
];

export default function ResearchLoop({ onOpenAgent, onEvaluate }: ResearchLoopProps) {
  const [activeStageId, setActiveStageId] = useState<ResearchStage>("evidence");
  const activeStage = researchLoopStages.find((stage) => stage.id === activeStageId) ?? researchLoopStages[1];

  return (
    <section className={styles.researchLoopWorkspace} aria-labelledby="research-loop-title">
      <div className={shared.sectionHeadingRow}>
        <div><p className={shared.kicker}>Research Loop / scientific infrastructure</p><h2 id="research-loop-title" className={shared.sectionTitle}>Compress the scientific learning loop.</h2></div>
        <p className={shared.sectionNote}>AI coordinates evidence and tools. Scientists remain responsible for scientific judgement.</p>
      </div>

      <div className={styles.loopThesis}>
        <div><span>Central idea</span><p>Shorten the distance between a biological question and usable evidence—without pretending the process is autonomous.</p></div>
        <div className={styles.organisationArc}><span>Research institutes</span><i>→</i><span>Biotech</span><i>→</i><span>Pharma discovery</span></div>
      </div>

      <Link href="/cases/biotech-case/the-experiment" className={styles.experimentInvitation}>
        <span className={styles.experimentInvitationIndex}>Playable case / 01</span>
        <span className={styles.experimentInvitationCopy}>
          <strong>THE EXPERIMENT</strong>
          <small>One question. Limited time. Messy biology.</small>
        </span>
        <span className={styles.experimentInvitationPath}>Question → evidence → experiment → judgement</span>
        <span className={styles.experimentInvitationAction}>Enter simulation <i>↗</i></span>
      </Link>

      <div className={styles.loopInstrument}>
        <div className={styles.loopMap} aria-label="Interactive scientific learning loop">
          <svg viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden="true">
            <path d="M400 42 C590 42 710 145 710 280 C710 428 588 510 400 510 C212 510 90 428 90 280 C90 144 212 42 400 42 Z" />
            <path className={styles.loopFlow} d="M400 42 C590 42 710 145 710 280 C710 428 588 510 400 510 C212 510 90 428 90 280 C90 144 212 42 400 42 Z" />
          </svg>

          {researchLoopStages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              style={stagePositions[stage.id]}
              className={`${styles.loopStage} ${stage.id === activeStageId ? styles.loopStageActive : ""}`}
              onClick={() => setActiveStageId(stage.id)}
              aria-pressed={stage.id === activeStageId}
            >
              <span>{stage.index}</span><strong>{stage.label}</strong><small>{stage.shortLabel}</small>
            </button>
          ))}

          <div className={styles.loopCore}>
            <span>Scientific learning</span>
            <strong>Evidence<br />↔<br />Experiment</strong>
            <small>iterative · supervised</small>
          </div>

          {capabilities.map((capability) => (
            <button key={capability.label} type="button" className={`${styles.persistentCapability} ${styles[capability.position]}`} onClick={() => onOpenAgent(capability.agentId)}>
              <span aria-hidden="true">+</span><strong>{capability.label}</strong><small>Persistent capability</small>
            </button>
          ))}
        </div>

        <aside className={styles.loopDetail}>
          <header><span>{activeStage.index} / stage</span><h3>{activeStage.label}</h3><p>{activeStage.workflow}</p></header>
          <dl>
            <div><dt>Researcher friction</dt><dd>{activeStage.painPoints.map((point) => <span key={point}>{point}</span>)}</dd></div>
            <div><dt>Relevant sources</dt><dd>{activeStage.dataSources.map((source) => <span key={source}>{source}</span>)}</dd></div>
            <div><dt>AI opportunity</dt><dd>{activeStage.opportunity}</dd></div>
            <div className={styles.humanResponsibility}><dt>Human responsibility</dt><dd>{activeStage.humanResponsibility}</dd></div>
          </dl>
          <div className={styles.stageMeta}><span><small>Maturity</small><strong>{activeStage.maturity}</strong></span><span><small>Integration</small><strong>{activeStage.complexity}</strong></span></div>
          <div className={styles.stageActions}>
            {activeStage.agentId ? <button type="button" onClick={() => onOpenAgent(activeStage.agentId!)}>Open example agent <span>↗</span></button> : null}
            {activeStage.agentId ? <button type="button" onClick={() => onEvaluate(activeStage.agentId!)}>Evaluate opportunity</button> : null}
          </div>
        </aside>
      </div>

      <section className={styles.outputLanguage}>
        <div><span>Scientific output language</span><h3>Keep what was found separate from what it might mean.</h3></div>
        <div>
          <p><ScientificOutputBadge type="observation" /><span>Something measured in data</span></p>
          <p><ScientificOutputBadge type="evidence" /><span>Information supported by a source</span></p>
          <p><ScientificOutputBadge type="interpretation" /><span>A possible explanation</span></p>
          <p><ScientificOutputBadge type="hypothesis" /><span>Something that should be tested</span></p>
        </div>
      </section>

      <section className={styles.patternSection}>
        <header><span>Reusable agent patterns</span><h3>An “agent” is not one interface or architecture.</h3></header>
        <div>{patterns.map(([name, description], index) => <article key={name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong><p>{description}</p></article>)}</div>
      </section>

      <section className={styles.strategicInsights}>
        <article><span>01</span><p>The highest-value opportunity may be compressing the scientific learning loop—not replacing scientific judgement.</p></article>
        <article><span>02</span><p>Agents can become an orchestration layer across fragmented literature, databases, pipelines, imaging systems and institutional knowledge.</p></article>
        <article><span>03</span><p>The credible near-term model is scientist-supervised agents operating inside bounded research workflows.</p></article>
      </section>
    </section>
  );
}
