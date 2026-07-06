"use client";

import type { LowiContent, LowiProject } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

interface LowiSectionProps {
  content: LowiContent;
}

// Een status telt als "actief" wanneer hij op productie/actief wijst —
// alleen dan mag de cyaan live-kleur gebruikt worden.
function isActiveStatus(project: LowiProject): boolean {
  return /productie|actief|production|active|live/i.test(project.status.nl);
}

export default function LowiSection({ content }: LowiSectionProps) {
  const { t } = useLanguage();

  return (
    <div>
      <p className={styles.lowiIntro}>{t(content.intro)}</p>
      <div className={styles.lowiGrid}>
        {content.projects.map((project) => (
          <article key={project.name} className={styles.lowiCard}>
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
        ))}
      </div>
    </div>
  );
}
