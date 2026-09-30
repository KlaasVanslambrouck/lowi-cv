"use client";

import { useRef, type ReactNode } from "react";
import { useSketchState } from "./SketchScope";
import {
  sketchClassName,
  type SketchDelay,
  type SketchTone,
} from "./sketchClasses";
import styles from "./sketch.module.css";

interface UnderlineProps {
  children: ReactNode;
  tone?: SketchTone;
  delay?: SketchDelay;
  className?: string;
}

// Getekende onderstreping (700 ms). Vast pad uit Stijl.dc.html.
export default function Underline({
  children,
  tone = "accent",
  delay,
  className,
}: UnderlineProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useSketchState(ref);

  return (
    <span
      ref={ref}
      className={sketchClassName(styles.underline, state, {
        tone,
        delay,
        className,
      })}
    >
      {children}
      <svg
        className={styles.underlineSvg}
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path className={styles.line} d="M2 10 C 50 4, 120 14, 198 6" />
      </svg>
    </span>
  );
}
