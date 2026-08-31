"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useReducer } from "react";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import { useTheme } from "@/hooks/useTheme";
import { eventById, experimentEvents } from "@/lib/biotech-case/experiment/scenario";
import { experimentReducer, initialExperimentState } from "@/lib/biotech-case/experiment/simulation-engine";
import type { ExperimentPhase, LabStation } from "@/lib/biotech-case/experiment/experiment-types";
import ExperimentEventPanel from "./ExperimentEventPanel";
import LabSceneFallback from "./LabSceneFallback";
import ResourceBar from "./ResourceBar";
import styles from "./Experiment.module.css";

const LabScene = dynamic(() => import("./LabScene"), { ssr: false });

const stations: Array<{ id: LabStation; label: string; short: string }> = [
  { id: "overview", label: "Lab overview", short: "Overview" },
  { id: "workstation", label: "Research workstation", short: "Research" },
  { id: "bench", label: "Wet-lab bench", short: "Wet lab" },
  { id: "incubator", label: "Incubator", short: "Culture" },
  { id: "microscope", label: "Microscope", short: "Imaging" },
  { id: "storage", label: "Sample storage", short: "Samples" },
];

const phases: Array<{ id: ExperimentPhase; label: string }> = [
  { id: "briefing", label: "Brief" },
  { id: "research", label: "Research" },
  { id: "hypothesis", label: "Hypothesis" },
  { id: "experiment-design", label: "Design" },
  { id: "wet-lab", label: "Wet lab" },
  { id: "troubleshooting", label: "Troubleshoot" },
  { id: "data-generation", label: "Data" },
  { id: "analysis", label: "Analysis" },
  { id: "interpretation", label: "Interpret" },
  { id: "completed", label: "Review" },
];

export default function ExperimentShell() {
  const [state, dispatch] = useReducer(experimentReducer, initialExperimentState);
  const support = useSceneSupport();
  const { theme, toggleTheme } = useTheme();
  const event = eventById.get(state.eventId) ?? experimentEvents[0];
  const activePhaseIndex = phases.findIndex((phase) => phase.id === state.phase);
  const issueActive = state.eventId === "low-transfection" || state.eventId === "lab-memory";
  const experimentActive = ["wet-lab", "troubleshooting", "data-generation", "analysis", "interpretation", "decision", "completed"].includes(state.phase);
  const selectedLog = state.log.find((entry) => entry.id === state.selectedLogId);
  const eventEyebrow = state.eventId === "low-transfection" ? `Day ${state.resources.day} / unexpected event` : event.eyebrow;

  const sceneStatus = useMemo(() => {
    if (!support.ready) return "Preparing scene";
    if (!support.webglOk) return "Static scene · WebGL unavailable";
    if (support.reducedMotion) return "Static scene · reduced motion";
    if (support.smallScreen) return "Simplified scene · mobile";
    return "Live 3D laboratory";
  }, [support]);

  useEffect(() => {
    if (!state.logOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch({ type: "TOGGLE_LOG" });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.logOpen]);

  return (
    <main className={styles.page}>
      <header className={styles.appHeader}>
        <Link href="/cases/biotech-case?mode=research" className={styles.brandLink} aria-label="Back to the Life Sciences AI Playground Research Loop">
          <span className={styles.brandMark} aria-hidden="true"><i /></span>
          <strong>LOWI</strong><span>/</span><b>The Experiment</b>
        </Link>
        <div className={styles.headerActions}>
          <span className={styles.sceneStatus}><i />{sceneStatus}</span>
          <button type="button" onClick={() => dispatch({ type: "TOGGLE_LOG" })}>Experiment log <span>{state.log.length}</span></button>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? "Light" : "Dark"}</button>
          <Link href="/cases/biotech-case?mode=research">Exit</Link>
        </div>
      </header>

      <ResourceBar resources={state.resources} />

      <section className={`${styles.workspace} ${state.phase === "completed" ? styles.workspaceComplete : ""}`}>
        <div className={styles.sceneRegion}>
          {support.showLiveScene ? (
            <LabScene
              activeStation={state.activeStation}
              issueActive={issueActive}
              experimentActive={experimentActive}
              rescueIncluded={state.design.rescue}
            />
          ) : (
            <LabSceneFallback activeStation={state.activeStation} issueActive={issueActive} />
          )}

          <div className={styles.sceneTitle}>
            <span>{eventEyebrow}</span>
            <strong>{stations.find((station) => station.id === state.activeStation)?.label}</strong>
          </div>

          {issueActive ? (
            <div className={styles.sceneAlert} role="status"><i>!</i><span><strong>Experiment deviation</strong>Transfection efficiency below range</span></div>
          ) : null}

          <nav className={styles.stationNav} aria-label="Lab station views">
            {stations.map((station) => (
              <button
                key={station.id}
                type="button"
                className={state.activeStation === station.id ? styles.stationActive : ""}
                onClick={() => dispatch({ type: "FOCUS_STATION", station: station.id })}
                aria-pressed={state.activeStation === station.id}
                title={station.label}
              >
                <i aria-hidden="true" />{station.short}
              </button>
            ))}
          </nav>

          <div className={styles.sceneLegend}><span>3D is spatial context</span><i /> <span>Scientific decisions live in the control surface</span></div>
        </div>

        <ExperimentEventPanel state={state} dispatch={dispatch} />
      </section>

      <footer className={styles.timeline}>
        <div className={styles.timelineObjective}><span>Current objective</span><strong>{event.objective}</strong></div>
        <ol>
          {phases.map((phase, index) => (
            <li key={phase.id} className={index < activePhaseIndex ? styles.phaseDone : index === activePhaseIndex ? styles.phaseActive : ""}>
              <i>{index < activePhaseIndex ? "✓" : String(index + 1).padStart(2, "0")}</i><span>{phase.label}</span>
            </li>
          ))}
        </ol>
      </footer>

      {state.logOpen ? (
        <div className={styles.logLayer}>
          <button type="button" className={styles.logScrim} onClick={() => dispatch({ type: "TOGGLE_LOG" })} aria-label="Close experiment log" />
          <aside className={styles.logDrawer} role="dialog" aria-modal="true" aria-labelledby="experiment-log-title">
            <header><div><span>Scientific provenance</span><h2 id="experiment-log-title">Experiment log</h2></div><button type="button" onClick={() => dispatch({ type: "TOGGLE_LOG" })} aria-label="Close experiment log">×</button></header>
            <p>Every material event, agent intervention and scientist decision remains inspectable.</p>
            <ol className={styles.logEntries}>
              {[...state.log].reverse().map((entry) => (
                <li key={entry.id}>
                  <button type="button" onClick={() => dispatch({ type: "OPEN_LOG", id: state.selectedLogId === entry.id ? null : entry.id })} aria-expanded={state.selectedLogId === entry.id}>
                    <span>Day {entry.day}</span><strong>{entry.title}</strong><i>{state.selectedLogId === entry.id ? "−" : "+"}</i>
                  </button>
                  {state.selectedLogId === entry.id ? <div><p>{entry.detail}</p><span>{entry.provenance}</span></div> : null}
                </li>
              ))}
            </ol>
            {selectedLog ? <footer><span>Selected record</span><strong>{selectedLog.provenance}</strong></footer> : null}
          </aside>
        </div>
      ) : null}
    </main>
  );
}
