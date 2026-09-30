"use client";

import { useRef, type ReactNode } from "react";
import { useSketchState } from "./SketchScope";
import { sketchClassName, type SketchDelay } from "./sketchClasses";
import styles from "./sketch.module.css";

interface HighlightProps {
  children: ReactNode;
  delay?: SketchDelay;
  className?: string;
}

// Markeerstift die van links veegt (550 ms). Max. één kernpassage per tekstblok.
export default function Highlight({ children, delay, className }: HighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useSketchState(ref);

  return (
    <span
      ref={ref}
      className={sketchClassName(styles.highlight, state, { delay, className })}
    >
      {children}
    </span>
  );
}
