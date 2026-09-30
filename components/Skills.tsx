"use client";

import type { SkillsSection } from "@/types/content";
import NidusCta from "@/components/NidusCta";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/home.module.css";

interface SkillsProps {
  content: SkillsSection;
}

// Proof-first "Wat ik bouw": geen niveaubalkjes. Elke cluster wordt gedragen
// door één context-regel (waar de skill echt draait) en een rij chips. De
// lead-regel staat als kantlijnnotitie naast de kop (HomePage).
export default function Skills({ content }: SkillsProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.skillsGrid}>
      {content.clusters.map((cluster) => (
        <article key={cluster.id} className={styles.skillCluster}>
          <h3 className={styles.skillTitle}>{t(cluster.title)}</h3>
          <p className={styles.body}>{t(cluster.context)}</p>
          <ul className={styles.skillChips}>
            {cluster.items.map((item) => (
              <li key={item.nl} className={styles.skillChip}>
                {t(item)}
              </li>
            ))}
          </ul>
          {cluster.proofAnchor === "nidus" ? (
            <NidusCta interactionId="nidus_cta_skills" variant="link">
              {t(content.proofLinkLabel)}
            </NidusCta>
          ) : null}
        </article>
      ))}
    </div>
  );
}
