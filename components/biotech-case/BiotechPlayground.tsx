"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { evidenceSources, opportunities } from "@/lib/biotech-case/opportunities";
import type { DomainId } from "@/lib/biotech-case/types";
import AgentLab from "./AgentLab";
import EvidenceBadge from "./EvidenceBadge";
import LifeSciencesMap from "./LifeSciencesMap";
import OpportunityMatrix from "./OpportunityMatrix";
import PilotDesigner from "./PilotDesigner";
import ResearchLoop from "./research/ResearchLoop";
import styles from "./BiotechPlayground.module.css";

type PlaygroundMode = "explore" | "lab" | "research" | "evaluate" | "pilot";

const modes: Array<{ id: PlaygroundMode; label: string; number: string }> = [
  { id: "explore", label: "Explore", number: "01" },
  { id: "lab", label: "Agent Lab", number: "02" },
  { id: "research", label: "Research Loop", number: "03" },
  { id: "evaluate", label: "Evaluate", number: "04" },
  { id: "pilot", label: "Design Pilot", number: "05" },
];

export default function BiotechPlayground() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<PlaygroundMode>("explore");
  const [selectedDomain, setSelectedDomain] = useState<DomainId>("discovery");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("scientific-investigator");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [thesisOpen, setThesisOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    const requestedAgent = params.get("agent");
    if (requestedMode && modes.some((item) => item.id === requestedMode)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL state is only available after hydration.
      setMode(requestedMode as PlaygroundMode);
    }
    if (requestedAgent && opportunities.some((item) => item.id === requestedAgent)) {
      setSelectedOpportunityId(requestedAgent);
      const opportunity = opportunities.find((item) => item.id === requestedAgent);
      if (opportunity) setSelectedDomain(opportunity.domain);
    }
  }, []);

  useEffect(() => {
    if (!evidenceOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEvidenceOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [evidenceOpen]);

  const selectOpportunity = (id: string) => {
    setSelectedOpportunityId(id);
    const opportunity = opportunities.find((item) => item.id === id);
    if (opportunity) setSelectedDomain(opportunity.domain);
  };

  const goToMode = (nextMode: PlaygroundMode, opportunityId?: string) => {
    if (opportunityId) selectOpportunity(opportunityId);
    setMode(nextMode);
    window.requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.appHeader}>
        <div className={styles.appHeaderInner}>
          <Link href="/" className={styles.brandLink} aria-label="Back to LOWI CV">
            <span className={styles.brandSignal} aria-hidden="true"><span /></span>
            <span>LOWI</span>
            <span className={styles.brandDivider}>/</span>
            <strong>Life Sciences Lab</strong>
          </Link>
          <div className={styles.headerStatus}>
            <span className={styles.systemStatus}><i aria-hidden="true" /> Local prototype</span>
            <button type="button" className={styles.headerButton} onClick={() => setEvidenceOpen(true)}>
              Evidence <span>3</span>
            </button>
            <button
              type="button"
              className={styles.themeButton}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <span className={theme === "dark" ? styles.themeOptionActive : ""}>Dark</span>
              <i>/</i>
              <span className={theme === "light" ? styles.themeOptionActive : ""}>Light</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.shell}>
        <section className={styles.hero} aria-labelledby="playground-title">
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}><span /> Life Sciences × Agentic AI</p>
            <h1 id="playground-title">Where could AI agents create <em>real leverage</em> in life sciences?</h1>
            <p className={styles.heroIntro}>Explore workflows, identify high-friction decisions, run agent concepts and evaluate which opportunities are actually worth piloting.</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={() => goToMode("research", "scientific-investigator")}>Enter the Research Loop <span>↓</span></button>
              <button type="button" className={styles.secondaryButton} onClick={() => goToMode("explore")}>Explore the value chain <span>↗</span></button>
            </div>
          </div>

          <aside className={styles.heroTelemetry} aria-label="Playground scope">
            <div className={styles.telemetryHeader}>
              <span>Opportunity surface</span><span className={styles.telemetryLive}>Live model</span>
            </div>
            <div className={styles.telemetryGrid}>
              <div><strong>{String(opportunities.length).padStart(2, "0")}</strong><span>agent opportunities</span></div>
              <div><strong>07</strong><span>workflow domains</span></div>
              <div><strong>{String(opportunities.filter((item) => item.status === "prototype").length).padStart(2, "0")}</strong><span>runnable prototypes</span></div>
              <div><strong>01</strong><span>human control model</span></div>
            </div>
            <div className={styles.telemetryPrinciple}>
              <span className={styles.telemetryPath} aria-hidden="true"><i /><i /><i /></span>
              <p><strong>Question → evidence → tools → scientist judgement</strong><span>The operating model is part of the product.</span></p>
            </div>
          </aside>
        </section>

        <div className={styles.playgroundFrame} ref={workspaceRef}>
          <nav className={styles.modeNavigation} aria-label="Playground modes">
            <div className={styles.modeButtons} role="tablist">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.modeButton} ${mode === item.id ? styles.modeButtonActive : ""}`}
                  onClick={() => setMode(item.id)}
                  role="tab"
                  aria-selected={mode === item.id}
                  aria-controls="playground-mode-panel"
                >
                  <span>{item.number}</span>{item.label}
                </button>
              ))}
            </div>
            <button type="button" className={styles.whyButton} onClick={() => setThesisOpen((current) => !current)} aria-expanded={thesisOpen}>
              Why this playground? <span>{thesisOpen ? "−" : "+"}</span>
            </button>
          </nav>

          {thesisOpen ? (
            <aside className={styles.thesisPanel}>
              <span className={styles.thesisIndex}>Strategic thesis / 01</span>
              <p>Life sciences is not short on AI use cases. In research, the highest-value opportunity may be compressing the scientific learning loop while preserving judgement, uncertainty and provenance.</p>
              <p>The credible near-term model is not an autonomous scientist. It is a scientist-supervised orchestration layer across literature, biological databases, computational tools and institutional knowledge.</p>
              <button type="button" onClick={() => setThesisOpen(false)} aria-label="Close strategic thesis">×</button>
            </aside>
          ) : null}

          <div id="playground-mode-panel" className={styles.modePanel} role="tabpanel">
            {mode === "explore" ? (
              <LifeSciencesMap
                selectedDomain={selectedDomain}
                onSelectDomain={(domain) => {
                  setSelectedDomain(domain);
                  const first = opportunities.find((item) => item.domain === domain);
                  if (first) setSelectedOpportunityId(first.id);
                }}
                selectedOpportunityId={selectedOpportunityId}
                onSelectOpportunity={selectOpportunity}
                onOpenAgent={(id) => goToMode("lab", id)}
                onEvaluate={(id) => goToMode("evaluate", id)}
              />
            ) : null}
            {mode === "lab" ? (
              <AgentLab
                selectedOpportunityId={selectedOpportunityId}
                onSelectOpportunity={selectOpportunity}
                onDesignPilot={(id) => goToMode("pilot", id)}
              />
            ) : null}
            {mode === "research" ? (
              <ResearchLoop
                onOpenAgent={(id) => goToMode("lab", id)}
                onEvaluate={(id) => goToMode("evaluate", id)}
              />
            ) : null}
            {mode === "evaluate" ? (
              <OpportunityMatrix
                selectedOpportunityId={selectedOpportunityId}
                onSelectOpportunity={selectOpportunity}
                onDesignPilot={(id) => goToMode("pilot", id)}
              />
            ) : null}
            {mode === "pilot" ? (
              <PilotDesigner
                key={selectedOpportunityId}
                selectedOpportunityId={selectedOpportunityId}
                onSelectOpportunity={selectOpportunity}
                onOpenAgent={(id) => goToMode("lab", id)}
              />
            ) : null}
          </div>
        </div>

        <footer className={styles.pageFooter}>
          <span>LOWI / Life Sciences AI Playground</span>
          <p>Deterministic prototype data · no clinical, quality or scientific decision is automated.</p>
          <Link href="/">Return to CV ↗</Link>
        </footer>
      </div>

      {evidenceOpen ? (
        <div className={styles.drawerLayer} role="presentation">
          <button type="button" className={styles.drawerScrim} onClick={() => setEvidenceOpen(false)} aria-label="Close evidence drawer" />
          <aside className={styles.evidenceDrawer} role="dialog" aria-modal="true" aria-labelledby="evidence-drawer-title">
            <header>
              <div><span className={styles.panelLabel}>Evidence register</span><h2 id="evidence-drawer-title">Claims need provenance.</h2></div>
              <button type="button" onClick={() => setEvidenceOpen(false)} aria-label="Close evidence drawer">×</button>
            </header>
            <p className={styles.drawerIntro}>The opportunity model currently uses local hypotheses and synthetic demonstration data. Citation slots are explicit so public evidence can be added without blurring what is known and what is proposed.</p>
            <div className={styles.evidenceSourceList}>
              {evidenceSources.map((source, index) => (
                <article key={source.id}>
                  <span className={styles.sourceNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <div><EvidenceBadge type={source.type} /><h3>{source.title}</h3><p>{source.note}</p><span className={styles.placeholderSource}>{source.placeholder ? "Placeholder · not a citation" : "Verified source"}</span></div>
                </article>
              ))}
            </div>
            <div className={styles.drawerGuardrail}><strong>No fabricated citations</strong><p>All records shown inside the Scientific Investigation Agent are clearly identified as synthetic evidence for interaction design only.</p></div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
