import type { RunState } from "@/lib/biotech-case/types";
import styles from "./BiotechPlayground.module.css";

interface AgentRunStateProps {
  state: RunState;
  steps: string[];
  activeStep: number;
}

const stateLabels: Record<RunState, string> = {
  idle: "Ready",
  preparing: "Preparing",
  investigating: "Investigating",
  synthesising: "Synthesising",
  completed: "Review ready",
  error: "Run interrupted",
};

export default function AgentRunState({
  state,
  steps,
  activeStep,
}: AgentRunStateProps) {
  const progress =
    state === "completed"
      ? 100
      : state === "idle"
        ? 0
        : Math.round(((activeStep + 1) / steps.length) * 88);

  return (
    <div className={styles.runState} aria-live="polite">
      <div className={styles.runStateHeader}>
        <span className={styles.liveLabel}>
          <span
            className={`${styles.liveDot} ${state !== "idle" && state !== "completed" ? styles.liveDotActive : ""}`}
            aria-hidden="true"
          />
          {stateLabels[state]}
        </span>
        <span className={styles.progressValue}>{progress}%</span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Agent run progress"
      >
        <span className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <ol className={styles.runSteps}>
        {steps.map((step, index) => {
          const done = state === "completed" || index < activeStep;
          const active =
            state !== "idle" && state !== "completed" && index === activeStep;

          return (
            <li
              key={step}
              className={`${styles.runStep} ${done ? styles.runStepDone : ""} ${active ? styles.runStepActive : ""}`}
            >
              <span className={styles.runStepMarker} aria-hidden="true">
                {done ? "✓" : String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
