"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Project, SkillNode, UILabels } from "@/types/content";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import { trackEvent } from "@/lib/analytics/trackEvent";
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

// 3D-skillgraaf met hover-detailpaneel. Op mobiel, zonder WebGL of bij
// reduced motion valt dit terug op de klassieke skill-tag-grid zodat de
// informatie overal beschikbaar blijft (zelfde gedrag als de andere scenes).
export default function SkillConstellation({
  nodes,
  projects,
  labels,
}: SkillConstellationProps) {
  const { t } = useLanguage();
  const support = useSceneSupport();
  const { isExplanationActive } = useJarvisExplain();
  const sessionId = useAnalyticsSession();
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const trackedSkillHoverIdsRef = useRef(new Set<string>());
  const skillsExplanationId = "skills-system-thinking";
  const skillsExplainActive = isExplanationActive(skillsExplanationId);

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

  const handleSkillHover = useCallback(
    (skillId: string | null) => {
      setHoveredSkillId(skillId);

      if (
        !skillId ||
        !sessionId ||
        trackedSkillHoverIdsRef.current.has(skillId)
      ) {
        return;
      }

      trackedSkillHoverIdsRef.current.add(skillId);
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "skill_node_hover",
          skillId,
        },
      });
    },
    [sessionId],
  );

  // Fallback: eenvoudige tag-grid (mobiel, geen WebGL, reduced motion,
  // of vóór de checks)
  if (
    !support.ready ||
    support.smallScreen ||
    !support.webglOk ||
    support.reducedMotion
  ) {
    return (
      <div
        className={
          skillsExplainActive
            ? `${styles.skillsExplainSurface} ${styles.jarvisExplainActiveOutline}`
            : styles.skillsExplainSurface
        }
      >
        <ul className={styles.skillsGrid}>
          {nodes.map((node) => (
            <li key={node.id} className={styles.skillTag}>
              {node.name}
            </li>
          ))}
        </ul>
        <JarvisExplainButton
          explanationId={skillsExplanationId}
          label={labels.jarvisExplainButton}
        />
      </div>
    );
  }

  return (
    <div
      className={
        skillsExplainActive
          ? `${styles.constellationWrapper} ${styles.jarvisExplainActiveOutline}`
          : styles.constellationWrapper
      }
    >
      <div className={styles.constellationCanvas} aria-hidden="true">
        <SkillConstellationCanvas
          nodes={nodes}
          hoveredSkillId={hoveredSkillId}
          onHover={handleSkillHover}
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
        <div className={styles.jarvisExplainActionRow}>
          <JarvisExplainButton
            explanationId={skillsExplanationId}
            label={labels.jarvisExplainButton}
          />
        </div>
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
