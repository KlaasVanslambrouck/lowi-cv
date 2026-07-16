"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { SkillsSection } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import styles from "@/styles/cv.module.css";

interface SkillsProps {
  content: SkillsSection;
}

// Proof-first Skills-sectie ("Wat ik bouw"). Geen niveaubalkjes: elke cluster
// wordt gedragen door één context-regel (waar de skill echt draait) en een rij
// mono-chips. Cluster 1 (het beroep) is het anker en krijgt de volle breedte;
// de bouw-clusters vormen het bewijsraster eronder. Signature-interactie: de
// kaarten faden gestaffeld in bij scroll-reveal (uit onder reduced motion).
export default function Skills({ content }: SkillsProps) {
  const { t } = useLanguage();
  const [gridRef, isVisible] = useInViewOnce<HTMLDivElement>({
    threshold: 0.15,
  });

  return (
    <div ref={gridRef} className={styles.skillsBlock} data-revealed={isVisible}>
      <p className={styles.skillsLead}>{t(content.lead)}</p>

      <div className={styles.skillsClusterGrid}>
        {content.clusters.map((cluster, index) => (
          <article
            key={cluster.id}
            className={
              index === 0
                ? `${styles.skillClusterCard} ${styles.skillClusterCardLead}`
                : styles.skillClusterCard
            }
            // Cascade-vertraging per kaart; lead eerst, dan het bewijsraster.
            style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
          >
            <h3 className={styles.skillClusterName}>{t(cluster.title)}</h3>
            <p className={styles.skillClusterContext}>{t(cluster.context)}</p>
            <ul className={styles.skillClusterChips}>
              {cluster.items.map((item) => (
                <li key={item} className={styles.skillClusterChip}>
                  {item}
                </li>
              ))}
            </ul>
            {cluster.proofAnchor === "nidus" ? (
              // Zelfde patroon als de "Ontdek Nidus"-knop in LowiSection:
              // Next.js Link naar de volwaardige /nidus case-study-route.
              <Link className={styles.skillProofLink} href="/nidus">
                {t(content.proofLinkLabel)}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
