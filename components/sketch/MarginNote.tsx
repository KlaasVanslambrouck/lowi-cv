"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useSketchState } from "./SketchScope";
import { sketchClassName, type SketchDelay } from "./sketchClasses";
import styles from "./sketch.module.css";

interface MarginNoteProps {
  children: ReactNode;
  as?: "span" | "p";
  // Met x/y staat de notitie absoluut naast haar doel (desktop); de ouder
  // moet dan position: relative hebben. Op mobiel valt ze terug in de stroom.
  x?: string;
  y?: string;
  rotate?: number; // graden, standaard -4
  delay?: SketchDelay;
  className?: string;
}

// Kantlijnnotitie in handschrift (650 ms masker). Echte tekst, eigen
// observatie, nooit de enige drager van informatie.
export default function MarginNote({
  children,
  as: Tag = "span",
  x,
  y,
  rotate,
  delay,
  className,
}: MarginNoteProps) {
  const ref = useRef<HTMLElement>(null);
  const state = useSketchState(ref);
  const placed = x !== undefined || y !== undefined;

  const style = {
    ...(rotate !== undefined ? { "--note-rotate": `${rotate}deg` } : {}),
    ...(x !== undefined ? { "--note-x": x } : {}),
    ...(y !== undefined ? { "--note-y": y } : {}),
  } as CSSProperties;

  return (
    <Tag
      ref={ref as RefObject<HTMLParagraphElement>}
      className={sketchClassName(
        `${styles.note} ${styles.write}${placed ? ` ${styles.notePlaced}` : ""}`,
        state,
        { delay, className },
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}
