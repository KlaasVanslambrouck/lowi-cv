import type { ScientificOutputType } from "@/lib/biotech-case/types";
import styles from "./Research.module.css";

interface ScientificOutputBadgeProps {
  type: ScientificOutputType;
}

export default function ScientificOutputBadge({ type }: ScientificOutputBadgeProps) {
  return <span className={`${styles.outputBadge} ${styles[`output_${type}`]}`}>{type}</span>;
}
