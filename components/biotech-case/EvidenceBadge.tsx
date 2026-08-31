import type { EvidenceType } from "@/lib/biotech-case/types";
import styles from "./BiotechPlayground.module.css";

const labels: Record<EvidenceType, string> = {
  "public-evidence": "Public evidence",
  inference: "Inference",
  hypothesis: "Opportunity hypothesis",
};

export default function EvidenceBadge({ type }: { type: EvidenceType }) {
  return (
    <span className={`${styles.evidenceBadge} ${styles[`evidence_${type}`]}`}>
      {labels[type]}
    </span>
  );
}
