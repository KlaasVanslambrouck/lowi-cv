"use client";

import { useRef } from "react";
import { useSketchState } from "./SketchScope";
import {
  sketchClassName,
  type SketchDelay,
  type SketchTone,
} from "./sketchClasses";
import styles from "./sketch.module.css";

interface ConnectorProps {
  tone?: SketchTone;
  delay?: SketchDelay;
  className?: string;
}

// Lange verbindingslijn met twee eindpunten (2,4 s over de hele lengte).
// Voor chronologie, architectuur en deling → projecten. Puur decoratief.
export default function Connector({
  tone = "teal",
  delay,
  className,
}: ConnectorProps) {
  const ref = useRef<SVGSVGElement>(null);
  const state = useSketchState(ref);

  return (
    <svg
      ref={ref}
      className={sketchClassName(styles.connector, state, {
        tone,
        delay,
        className,
      })}
      viewBox="0 0 260 90"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className={styles.longLine}
        pathLength={1}
        d="M10 70 C 60 70, 70 20, 130 20 S 200 70, 250 60"
      />
      <circle className={styles.connectorStart} cx="10" cy="70" r="8" />
      <circle className={styles.connectorEnd} cx="250" cy="60" r="8" />
    </svg>
  );
}
