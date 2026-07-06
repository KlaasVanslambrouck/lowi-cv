"use client";

import { useState } from "react";
import type { Project, UILabels, XrayLayer } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import styles from "@/styles/cv.module.css";

interface ProjectCardProps {
  project: Project;
  labels: UILabels;
}

// Bouwt de monospace-boomstructuur voor de X-ray weergave
function buildXrayTree(breakdown: XrayLayer[]): string {
  return breakdown
    .map((layer) => {
      const items = layer.items.map((item, index) => {
        const isLast = index === layer.items.length - 1;
        return `${isLast ? "└──" : "├──"} ${item}`;
      });
      return [layer.layer, ...items].join("\n");
    })
    .join("\n");
}

export default function ProjectCard({ project, labels }: ProjectCardProps) {
  const { t } = useLanguage();
  const { xrayActive } = useXray();
  // Exploded view: muis-hover én expliciete toggle (toetsenbord/touch)
  const [hoverExploded, setHoverExploded] = useState(false);
  const [pinnedExploded, setPinnedExploded] = useState(false);

  const exploded = hoverExploded || pinnedExploded;
  const showXray = xrayActive && Boolean(project.xrayBreakdown);

  return (
    <article
      className={
        exploded
          ? `${styles.projectCard} ${styles.projectCardExploded}`
          : styles.projectCard
      }
      onMouseEnter={() => setHoverExploded(true)}
      onMouseLeave={() => setHoverExploded(false)}
    >
      <div className={`${styles.projectCardLayer} ${styles.projectLayerFront}`}>
        <div className={styles.projectTitleRow}>
          <h3 className={styles.projectTitle}>{t(project.title)}</h3>
          {/* Toegankelijke toggle voor touch-devices en toetsenbord —
              exploded view hangt dus niet enkel aan :hover */}
          <button
            type="button"
            className={styles.layersToggle}
            onClick={() => setPinnedExploded((previous) => !previous)}
            aria-pressed={pinnedExploded}
          >
            {t(labels.explodeToggle)}
          </button>
        </div>
        {showXray && project.xrayBreakdown ? (
          // X-ray: technische boomstructuur i.p.v. de beschrijving
          <pre key="xray" className={`${styles.xrayTree} ${styles.fadeSwap}`}>
            {buildXrayTree(project.xrayBreakdown)}
          </pre>
        ) : (
          <p key="normal" className={`${styles.projectDescription} ${styles.fadeSwap}`}>
            {t(project.description)}
          </p>
        )}
      </div>
      <pre
        className={`${styles.codeBlock} ${styles.projectCardLayer} ${styles.projectLayerMid}`}
        tabIndex={0}
      >
        <code>{project.codeSnippet}</code>
      </pre>
      <ul className={`${styles.techList} ${styles.projectCardLayer} ${styles.projectLayerBack}`}>
        {project.tech.map((techName) => (
          <li key={techName} className={styles.techTag}>
            {techName}
          </li>
        ))}
      </ul>
    </article>
  );
}
