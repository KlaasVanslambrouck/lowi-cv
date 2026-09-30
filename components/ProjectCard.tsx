"use client";

import { useId, useState } from "react";
import type { Project, UILabels, XrayLayer } from "@/types/content";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import { trackEvent } from "@/lib/analytics/trackEvent";
import styles from "@/styles/home.module.css";

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

// Projectkaart: X-ray toont de lagenboom (globaal), de knop "Lagen" toont per
// project het codefragment. Het analytics-event blijft project_exploded_open.
export default function ProjectCard({ project, labels, explanationId }: ProjectCardProps) {
  const { t } = useLanguage();
  const { xrayActive } = useXray();
  const sessionId = useAnalyticsSession();
  const [layersOpen, setLayersOpen] = useState(false);
  const codeId = useId();

  function handleLayersToggle() {
    const nextOpen = !layersOpen;
    setLayersOpen(nextOpen);

    if (nextOpen && sessionId) {
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
    <article className={`${styles.card} ${styles.projectCard}`}>
      <div className={styles.projectHead}>
        <h3 className={styles.projectTitle}>{t(project.title)}</h3>
        <button
          type="button"
          className={styles.layersToggle}
          onClick={handleLayersToggle}
          aria-pressed={layersOpen}
          aria-controls={codeId}
        >
          {t(labels.explodeToggle)}
        </button>
      </div>
      <p className={styles.cardText}>{t(project.description)}</p>
      {xrayActive && project.xrayBreakdown ? (
        // X-ray voegt technische metadata toe; gewone content blijft zichtbaar.
        <div className={styles.cardXray}>
          <pre className={styles.tree}>{buildXrayTree(project.xrayBreakdown)}</pre>
        </div>
      ) : null}
      <pre id={codeId} className={styles.code} tabIndex={0} hidden={!layersOpen}>
        <code>{project.codeSnippet}</code>
      </pre>
      <ul className={styles.chips}>
        {project.tech.map((techName) => (
          <li key={techName} className={`${styles.chip} ${styles.tagChip}`}>
            {techName}
          </li>
        ))}
      </ul>
      {explanationId ? (
        <div>
          <JarvisExplainButton explanationId={explanationId} label={labels.jarvisExplainButton} />
        </div>
      ) : null}
    </article>
  );
}
