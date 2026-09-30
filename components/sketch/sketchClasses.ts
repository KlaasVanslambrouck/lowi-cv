import type { SketchState } from "@/hooks/useSketchReveal";
import styles from "./sketch.module.css";

export type SketchTone = "accent" | "teal";

// Delay-trappen uit Stijl.dc.html: 150 / 500 / 850 / 1200 / 1550 / 1900 ms.
export type SketchDelay = 1 | 2 | 3 | 4 | 5 | 6;

interface SketchClassOptions {
  tone?: SketchTone;
  delay?: SketchDelay;
  className?: string;
}

const TONE_CLASS: Record<SketchTone, string> = {
  accent: styles.toneAccent,
  teal: styles.toneTeal,
};

const DELAY_CLASS: Record<SketchDelay, string> = {
  1: styles.delay1,
  2: styles.delay2,
  3: styles.delay3,
  4: styles.delay4,
  5: styles.delay5,
  6: styles.delay6,
};

export function sketchClassName(
  base: string,
  state: SketchState,
  { tone, delay, className }: SketchClassOptions = {},
): string {
  return [
    base,
    tone ? TONE_CLASS[tone] : null,
    delay ? DELAY_CLASS[delay] : null,
    state === "wait" ? styles.wait : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
