"use client";

import { useRef } from "react";
import { useSketchState } from "./SketchScope";
import {
  sketchClassName,
  type SketchDelay,
  type SketchTone,
} from "./sketchClasses";
import styles from "./sketch.module.css";

// Vaste vormen uit de artboards (paden verschoven naar hun eigen viewBox).
const SHAPES = {
  // Stijl.dc.html · 05: van een notitie naar een doel rechts
  curve: {
    width: 120,
    height: 70,
    line: "M6 10 C 30 60, 80 64, 110 36",
    head: "M96 28 L111 36 L100 50",
  },
  // Nidus.dc.html · screenshots: van de notitie naar de embed linksonder
  curveLeft: {
    width: 90,
    height: 60,
    line: "M70 4 C 72 26, 50 46, 14 52",
    head: "M26 42 L12 52 L27 60",
  },
  // Nidus.dc.html · architectuur: tussen twee lagen, recht naar beneden
  down: {
    width: 22,
    height: 56,
    line: "M11 2 C 4 20, 18 38, 11 54",
    head: "M1 42 L11 55 L22 42",
  },
} as const;

export type ArrowShape = keyof typeof SHAPES;

interface ArrowProps {
  shape?: ArrowShape;
  tone?: SketchTone;
  delay?: SketchDelay;
  className?: string; // plaatsing of spiegeling (bv. scale: -1 1)
}

// Getekende pijl (lijn 700 ms, punt +350 ms). Verbindt een notitie met een
// echt doel: link, celonderdeel of beslissing. Puur decoratief.
export default function Arrow({
  shape = "curve",
  tone = "accent",
  delay,
  className,
}: ArrowProps) {
  const ref = useRef<SVGSVGElement>(null);
  const state = useSketchState(ref);
  const { width, height, line, head } = SHAPES[shape];

  return (
    <svg
      ref={ref}
      className={sketchClassName(styles.arrow, state, { tone, delay, className })}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.line} d={line} />
      <path className={`${styles.line} ${styles.arrowHead}`} d={head} />
    </svg>
  );
}
