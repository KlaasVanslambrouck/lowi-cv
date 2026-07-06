"use client";

import { useState } from "react";
import type { Project, UILabels, XrayLayer } from "@/types/content";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import { trackEvent } from "@/lib/analytics/trackEvent";
import styles from "@/styles/cv.module.css";

interface ProjectCardProps {
  project: Project;
  labels: UILabels;
  explanationId?: string;
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

export default function ProjectCard({
  project,
  labels,
  explanationId,
}: ProjectCardProps) {
  const { t } = useLanguage();
  const { xrayActive } = useXray();
  const { isExplanationActive } = useJarvisExplain();
  const sessionId = useAnalyticsSession();
  // Exploded view: muis-hover én expliciete toggle (toetsenbord/touch)
  const [hoverExploded, setHoverExploded] = useState(false);
  const [pinnedExploded, setPinnedExploded] = useState(false);

  const exploded = hoverExploded || pinnedExploded;
  const showXray = xrayActive && Boolean(project.xrayBreakdown);
  const explainActive = explanationId
    ? isExplanationActive(explanationId)
    : false;
  const cardClassName = [
    styles.projectCard,
    exploded ? styles.projectCardExploded : "",
    explainActive ? styles.jarvisExplainActiveOutline : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleExplodedToggle() {
    const nextPinnedExploded = !pinnedExploded;
    setPinnedExploded(nextPinnedExploded);

    if (nextPinnedExploded && sessionId) {
      trackEvent({
        sessionId,
        eventType: "interaction",
        eventData: {
          interactionId: "project_exploded_open",
          projectId: project.id,
        },
      });
    }
  }

  return (
    <article
      className={cardClassName}
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
            onClick={handleExplodedToggle}
            aria-pressed={pinnedExploded}
          >
            {t(labels.explodeToggle)}
          </button>
        </div>
        <p className={styles.projectDescription}>{t(project.description)}</p>
        {showXray && project.xrayBreakdown ? (
          // X-ray voegt technische metadata toe; gewone content blijft zichtbaar.
          <pre className={`${styles.xrayTree} ${styles.fadeSwap}`}>
            {buildXrayTree(project.xrayBreakdown)}
          </pre>
        ) : null}
        {explanationId ? (
          <div className={styles.jarvisExplainActionRow}>
            <JarvisExplainButton
              explanationId={explanationId}
              label={labels.jarvisExplainButton}
            />
          </div>
        ) : null}
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
