"use client";

import { useRef, type ReactNode } from "react";
import { useSketchState } from "./SketchScope";
import { sketchClassName, type SketchDelay } from "./sketchClasses";
import styles from "./sketch.module.css";

interface StrikeProps {
  children: ReactNode; // wat doorgehaald wordt
  to: ReactNode; // de correctie in handschrift
  delay?: SketchDelay;
  className?: string;
}

// Doorhaling (380 ms) met correctie erna (+120 ms). Alleen voor redactionele
// copy of een echt verworpen keuze. <del>/<ins> zodat een screenreader beide
// leest; de getekende streep zelf is decoratie.
export default function Strike({ children, to, delay, className }: StrikeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useSketchState(ref);

  return (
    <span
      ref={ref}
      className={sketchClassName("", state, { tone: "accent", delay, className })}
    >
      <del className={styles.struck}>
        {children}
        <svg
          className={styles.strikeSvg}
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path className={styles.strikeLine} d="M2 12 C 50 6, 120 14, 198 5" />
        </svg>
      </del>{" "}
      <ins className={`${styles.correction} ${styles.write}`}>{to}</ins>
    </span>
  );
}
