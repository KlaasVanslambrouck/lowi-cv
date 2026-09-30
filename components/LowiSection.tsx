"use client";

import Link from "next/link";
import type { LowiContent, LowiProject, UILabels } from "@/types/content";
import JarvisExplainButton from "@/components/JarvisExplainButton";
import NidusCta from "@/components/NidusCta";
import MarginNote from "@/components/sketch/MarginNote";
import Strike from "@/components/sketch/Strike";
import { homeRedesignCopy as copy } from "@/components/home/homeRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import { localizedPath } from "@/lib/site";
import styles from "@/styles/home.module.css";

interface LowiSectionProps {
  content: LowiContent;
  labels: UILabels;
  // X-ray van de Nidus-kaart: lagenboom uit de case study (lib/nidusLayers.ts).
  nidusLayerTree?: string;
}

// Een status telt als "actief" wanneer hij op productie/actief wijst.
function isActiveStatus(project: LowiProject): boolean {
  return /productie|actief|production|active|live/i.test(project.status.nl);
}

// Inhoud van de LOWI-sectie op de homepage (de kop en de link naar de cel
// staan in HomePage). De Jarvis-knoppen openen het bestaande uitlegpaneel.
export default function LowiSection({
  content,
  labels,
  nidusLayerTree,
}: LowiSectionProps) {
  const { language, t } = useLanguage();
  const { xrayActive } = useXray();

  return (
    <div className={styles.lowiBody}>
      <p className={styles.lowiIntro}>{t(content.intro)}</p>
      <div>
        <JarvisExplainButton explanationId="lowi-project" label={labels.jarvisExplainButton} />
      </div>

      <Strike className={styles.lowiStrike} to={t(copy.strikeTo)} delay={2}>
        {t(copy.strikeFrom)}
      </Strike>

      <div className={styles.lowiCards}>
        {content.projects.map((project) => {
          const active = isActiveStatus(project);
          const isNidus = project.caseStudyPath === "/nidus";

          return (
            <article
              key={project.name}
              className={active ? styles.card : `${styles.card} ${styles.cardAccent}`}
            >
              <span
                className={`${styles.chip} ${active ? styles.statusChip : styles.statusChipMuted}`}
              >
                {t(project.status)}
              </span>
              <h3 className={styles.cardTitle}>{project.name}</h3>
              <p className={styles.cardTagline}>{t(project.tagline)}</p>
              <p className={styles.cardText}>{t(project.description)}</p>

              {xrayActive && isNidus && nidusLayerTree ? (
                <div className={styles.cardXray}>
                  <pre className={styles.tree}>{nidusLayerTree}</pre>
                  <MarginNote className={styles.cardXrayNote} rotate={-2}>
                    {t(copy.nidusXrayNote)}
                  </MarginNote>
                </div>
              ) : null}

              <div className={styles.cardActions}>
                {isNidus ? (
                  <NidusCta interactionId="nidus_cta_lowi" variant="primary">
                    {t(project.caseStudyLinkLabel ?? labels.caseStudyLinkLabel)}
                  </NidusCta>
                ) : project.caseStudyPath ? (
                  <Link
                    className={styles.textLink}
                    href={localizedPath(project.caseStudyPath, language)}
                  >
                    {t(project.caseStudyLinkLabel ?? labels.caseStudyLinkLabel)}
                  </Link>
                ) : null}
                {project.url ? (
                  <a
                    className={styles.textLink}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.url.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
                {project.jarvisExplanationId ? (
                  <JarvisExplainButton
                    explanationId={project.jarvisExplanationId}
                    label={labels.jarvisExplainButton}
                  />
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
