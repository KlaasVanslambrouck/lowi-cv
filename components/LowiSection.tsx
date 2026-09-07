"use client";

import Link from "next/link";
import type { LowiContent, LowiProject, UILabels } from "@/types/content";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import NidusCta from "@/components/NidusCta";
import { useJarvisExplain } from "@/hooks/useJarvisExplain";
import { trackEvent } from "@/lib/analytics/trackEvent";
import type { CtaInteractionId } from "@/lib/analytics/trackValidation";
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
  const sessionId = useAnalyticsSession();
  const lowiExplanationId = "lowi-project";

  // Zelfde opzet als de CTA op de celpagina zelf: een gewone Link met een
  // getrackte klik. NidusCta is niet herbruikbaar, die wijst hard naar /nidus.
  function handleCelKlik(): void {
    if (!sessionId) return;
    const interactionId: CtaInteractionId = "lowi_cta_celpagina";
    trackEvent({
      sessionId,
      eventType: "interaction",
      eventData: { interactionId },
    });
  }

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
        <div className={styles.lowiIntroActies}>
          <JarvisExplainButton
            explanationId={lowiExplanationId}
            label={labels.jarvisExplainButton}
          />
          <Link
            className={styles.lowiLink}
            href={content.celPath}
            onClick={handleCelKlik}
          >
            {t(content.celLinkLabel)}
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </div>
      <div className={styles.lowiGrid}>
        {content.projects.map((project) => {
          const projectExplanationId = project.jarvisExplanationId ?? null;
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
            {project.caseStudyPath === "/nidus" ? (
              <NidusCta
                className={styles.lowiLink}
                interactionId="nidus_cta_lowi"
                variant="secondary"
              >
                {t(project.caseStudyLinkLabel ?? labels.caseStudyLinkLabel)}
              </NidusCta>
            ) : project.caseStudyPath ? (
              <Link className={styles.lowiLink} href={project.caseStudyPath}>
                {t(project.caseStudyLinkLabel ?? labels.caseStudyLinkLabel)}
              </Link>
            ) : null}
          </article>
          );
        })}
      </div>
    </div>
  );
}
