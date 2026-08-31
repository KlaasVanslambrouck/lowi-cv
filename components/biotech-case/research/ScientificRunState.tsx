import type { RunState } from "@/lib/biotech-case/types";
import styles from "./Research.module.css";

interface ScientificStep {
  label: string;
  tool: string;
  count: string;
}

interface ScientificRunStateProps {
  state: RunState;
  steps: ScientificStep[];
  activeStep: number;
}

export default function ScientificRunState({ state, steps, activeStep }: ScientificRunStateProps) {
  const running = state !== "idle" && state !== "completed" && state !== "error";
  const elapsed = state === "idle" ? "—" : state === "completed" ? "02:14 simulated" : `00:${String((activeStep + 1) * 11).padStart(2, "0")} simulated`;

  return (
    <section className={styles.scientificRun} aria-live="polite">
      <header>
        <div>
          <span className={`${styles.runPulse} ${running ? styles.runPulseActive : ""}`} aria-hidden="true" />
          <strong>{state === "completed" ? "Review workspace ready" : state === "idle" ? "Investigation ready" : "Investigation running"}</strong>
        </div>
        <span>{elapsed}</span>
      </header>
      <ol>
        {steps.map((step, index) => {
          const done = state === "completed" || index < activeStep;
          const active = running && index === activeStep;
          return (
            <li key={step.label} className={`${done ? styles.scientificStepDone : ""} ${active ? styles.scientificStepActive : ""}`}>
              <span className={styles.scientificStepMarker}>{done ? "✓" : active ? "●" : "○"}</span>
              <p><strong>{step.label}</strong><small>{step.tool}</small></p>
              <span>{done || active ? step.count : "waiting"}</span>
            </li>
          );
        })}
      </ol>
      <footer>
        <span>Current action</span>
        <strong>{state === "completed" ? "Awaiting scientist review" : state === "idle" ? "No tools invoked" : steps[activeStep]?.label}</strong>
        <small>{state === "completed" ? "2 unresolved contradictions · 3 knowledge gaps" : "Source counts reflect this deterministic simulation."}</small>
      </footer>
    </section>
  );
}
