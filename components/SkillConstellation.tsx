"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Project, SkillNode, UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import styles from "@/styles/cv.module.css";

// De WebGL-canvas laadt lazy en uitsluitend client-side
const SkillConstellationCanvas = dynamic(
  () => import("@/components/SkillConstellationCanvas"),
  {
    ssr: false,
    loading: () => <div className={styles.constellationLoading} />,
  },
);

interface SkillConstellationProps {
  nodes: SkillNode[];
  projects: Project[];
  labels: UILabels;
}

// 3D-skillgraaf met hover-detailpaneel. Op mobiel/zonder WebGL valt dit
// terug op de klassieke skill-tag-grid zodat de informatie overal
// beschikbaar blijft.
export default function SkillConstellation({
  nodes,
  projects,
  labels,
}: SkillConstellationProps) {
  const { t } = useLanguage();
  const support = useSceneSupport();
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  const hoveredSkill = useMemo(
    () => nodes.find((node) => node.id === hoveredSkillId) ?? null,
    [nodes, hoveredSkillId],
  );

  // Projecten die de gehoverde skill gebruiken (via relatedProjectIds)
  const relatedProjects = useMemo(() => {
    if (!hoveredSkill) return [];
    return projects.filter((project) =>
      hoveredSkill.relatedProjectIds.includes(project.id),
    );
  }, [hoveredSkill, projects]);

  // Fallback: eenvoudige tag-grid (mobiel, geen WebGL, of vóór de checks)
  if (!support.ready || support.smallScreen || !support.webglOk) {
    return (
      <ul className={styles.skillsGrid}>
        {nodes.map((node) => (
          <li key={node.id} className={styles.skillTag}>
            {node.name}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.constellationWrapper}>
      <div className={styles.constellationCanvas} aria-hidden="true">
        <SkillConstellationCanvas
          nodes={nodes}
          hoveredSkillId={hoveredSkillId}
          onHover={setHoveredSkillId}
          reducedMotion={support.reducedMotion}
        />
      </div>
      {/* Detailpaneel — gewone HTML/CSS naast de canvas */}
      <aside className={styles.constellationPanel}>
        {hoveredSkill ? (
          <div key={hoveredSkill.id} className={styles.fadeSwap}>
            <h3 className={styles.constellationSkillName}>
              {hoveredSkill.name}
            </h3>
            <p className={styles.constellationPanelLabel}>
              {t(labels.constellationProjectsLabel)}
            </p>
            <ul className={styles.constellationProjectList}>
              {relatedProjects.map((project) => (
                <li key={project.id}>{t(project.title)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={styles.constellationHint}>
            {t(labels.constellationHint)}
          </p>
        )}
      </aside>
      {/* Skills blijven leesbaar voor screenreaders (canvas is aria-hidden) */}
      <ul className={styles.srOnly}>
        {nodes.map((node) => (
          <li key={node.id}>{node.name}</li>
        ))}
      </ul>
    </div>
  );
}
