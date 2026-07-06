"use client";

import type { LowiContent, LowiProject, UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import styles from "@/styles/cv.module.css";

interface LowiSectionProps {
  content: LowiContent;
  labels: UILabels;
}

// Een status telt als "actief" wanneer hij op productie/actief wijst —
// alleen dan mag de electric-blue live-kleur gebruikt worden.
function isActiveStatus(project: LowiProject): boolean {
  return /productie|actief|production|active|live/i.test(project.status.nl);
}

export default function LowiSection({ content, labels }: LowiSectionProps) {
  const { t } = useLanguage();
  const { isExplanationActive } = useJarvisExplain();
  const lowiExplanationId = "lowi-project";

  return (
    <div>
      <div
        className={
          isExplanationActive(lowiExplanationId)
            ? `${styles.lowiIntroBlock} ${styles.jarvisExplainActiveOutline}`
            : styles.lowiIntroBlock
        }
      >
        <p className={styles.lowiIntro}>{t(content.intro)}</p>
        <JarvisExplainButton
          explanationId={lowiExplanationId}
          label={labels.jarvisExplainButton}
        />
      </div>
      <div className={styles.lowiGrid}>
        {content.projects.map((project) => {
          const projectExplanationId =
            project.name.toLowerCase() === "nidus" ? "nidus-project" : null;
          const projectExplainActive = projectExplanationId
            ? isExplanationActive(projectExplanationId)
            : false;

          return (
          <article
            key={project.name}
            className={
              projectExplainActive
                ? `${styles.lowiCard} ${styles.jarvisExplainActiveOutline}`
                : styles.lowiCard
            }
          >
            <div className={styles.lowiCardHeader}>
              <h3 className={styles.lowiName}>{project.name}</h3>
              <span
                className={
                  isActiveStatus(project)
                    ? `${styles.statusBadge} ${styles.statusBadgeActive}`
                    : `${styles.statusBadge} ${styles.statusBadgeMuted}`
                }
              >
                {t(project.status)}
              </span>
            </div>
            <p className={styles.lowiTagline}>{t(project.tagline)}</p>
            <p className={styles.lowiDescription}>{t(project.description)}</p>
            {projectExplanationId ? (
              <div className={styles.jarvisExplainActionRow}>
                <JarvisExplainButton
                  explanationId={projectExplanationId}
                  label={labels.jarvisExplainButton}
                />
              </div>
            ) : null}
            {project.url ? (
              <a
                className={styles.lowiLink}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.url.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </article>
          );
        })}
      </div>
    </div>
  );
}
