"use client";

import { useRef } from "react";
import { useSketchState } from "./SketchScope";
import {
  sketchClassName,
  type SketchDelay,
  type SketchTone,
} from "./sketchClasses";
import styles from "./sketch.module.css";

interface ArrowProps {
  tone?: SketchTone;
  delay?: SketchDelay;
  className?: string; // plaatsing, grootte of spiegeling (bv. scale: -1 1)
}

// Getekende pijl (lijn 700 ms, punt +350 ms). Verbindt een notitie met een
// echt doel: link, celonderdeel of beslissing. Puur decoratief.
export default function Arrow({ tone = "accent", delay, className }: ArrowProps) {
  const ref = useRef<SVGSVGElement>(null);
  const state = useSketchState(ref);

  return (
    <svg
      ref={ref}
      className={sketchClassName(styles.arrow, state, { tone, delay, className })}
      viewBox="0 0 120 70"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.line} d="M6 10 C 30 60, 80 64, 110 36" />
      <path
        className={`${styles.line} ${styles.arrowHead}`}
        d="M96 28 L111 36 L100 50"
      />
    </svg>
  );
}
