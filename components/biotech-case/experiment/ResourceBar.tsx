import type { ExperimentResources } from "@/lib/biotech-case/experiment/experiment-types";
import styles from "./Experiment.module.css";

export default function ResourceBar({ resources }: { resources: ExperimentResources }) {
  const items = [
    { label: "Time", value: `Day ${resources.day} / 14`, progress: (resources.day / 14) * 100 },
    { label: "Budget", value: `€${resources.budget.toLocaleString("en-GB")}`, progress: (resources.budget / 10000) * 100 },
    { label: "Biological material", value: `${resources.sampleMaterial}%`, progress: resources.sampleMaterial },
    { label: "Research capacity", value: `${resources.researcherAttention}%`, progress: resources.researcherAttention },
  ];

  return (
    <section className={styles.resourceBar} aria-label="Experiment resources">
      {items.map((item) => (
        <div key={item.label} className={styles.resourceItem}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <i aria-hidden="true"><b style={{ width: `${Math.max(2, item.progress)}%` }} /></i>
        </div>
      ))}
    </section>
  );
}
