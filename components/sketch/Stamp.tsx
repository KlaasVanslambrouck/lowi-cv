"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useSketchState } from "./SketchScope";
import {
  sketchClassName,
  type SketchDelay,
  type SketchTone,
} from "./sketchClasses";
import styles from "./sketch.module.css";

interface StampProps {
  children: ReactNode;
  as?: "span" | "p";
  tone?: SketchTone;
  rotate?: number; // graden, standaard 3
  delay?: SketchDelay;
  className?: string;
}

// Stempel (450 ms landing, geen bounce). Hoogstens één per paginasectie.
export default function Stamp({
  children,
  as: Tag = "span",
  tone = "teal",
  rotate,
  delay,
  className,
}: StampProps) {
  const ref = useRef<HTMLElement>(null);
  const state = useSketchState(ref);
  const style =
    rotate !== undefined
      ? ({ "--stamp-rotate": `${rotate}deg` } as CSSProperties)
      : undefined;

  return (
    <Tag
      ref={ref as RefObject<HTMLParagraphElement>}
      className={sketchClassName(styles.stamp, state, { tone, delay, className })}
      style={style}
    >
      {children}
    </Tag>
  );
}
