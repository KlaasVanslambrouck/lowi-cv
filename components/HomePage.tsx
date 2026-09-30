"use client";

import { placeholderContent } from "@/content/placeholderContent";
import { experienceFor } from "@/lib/experience";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import ContactFooter from "@/components/ContactFooter";
import CtaLink from "@/components/CtaLink";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import Hero from "@/components/Hero";
import JarvisExplainPanel from "@/components/JarvisExplainPanel";
import LowiSection from "@/components/LowiSection";
import NidusCta from "@/components/NidusCta";
import PortfolioDesign from "@/components/PortfolioDesign";
import ProjectCard from "@/components/ProjectCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SketchSection from "@/components/SketchSection";
import Skills from "@/components/Skills";
import EducationLanguages from "@/components/home/EducationLanguages";
import HomeDuo from "@/components/home/HomeDuo";
import XrayStackStrip from "@/components/home/XrayStackStrip";
import { HOME_HIGHLIGHTS, homeRedesignCopy as copy } from "@/components/home/homeRedesignCopy";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import HighlightPhrase from "@/components/sketch/HighlightPhrase";
import MarginNote from "@/components/sketch/MarginNote";
import { JarvisExplainProvider } from "@/context/JarvisExplainContext";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { Bilingual } from "@/types/content";
import styles from "@/styles/home.module.css";

const NIDUS_CTA_LABELS = {
  hero: {
    nl: "Bekijk de Nidus-case",
    en: "Explore the Nidus case study",
  },
  about: {
    nl: "Zie hoe ik dit toepas in Nidus",
    en: "See how I apply this in Nidus",
  },
  projects: {
    nl: "Bekijk hoe deze projecten samenkomen in Nidus",
    en: "See how these projects connect in Nidus",
  },
} satisfies Record<"hero" | "about" | "projects", Bilingual>;

// Sectienummers in de eyebrow, zoals in het artboard.
function numbered(number: string, title?: Bilingual): Bilingual {
  return title
    ? { nl: `${number} · ${title.nl}`, en: `${number} · ${title.en}` }
    : { nl: number, en: number };
}

interface HomePageProps {
  // X-ray van de Nidus-kaart; server-side opgebouwd in HomeRoute.
  nidusLayerTree?: string;
}

// De volledige homepage. Alle content komt uit placeholderContent en
// content/role.ts; nieuwe redactionele tekst staat in homeRedesignCopy.
// Volgorde volgens het redesign: hero → Nidus | LOWI → wie ik ben →
// ervaring → LOWI → opleiding/talen → wat ik bouw → projecten → contact.
// De sectie-id's (ankers en analytics) blijven gelijk.
export default function HomePage({ nidusLayerTree }: HomePageProps) {
  const content = placeholderContent;
  const { t } = useLanguage();
  const { xrayActive } = useXray();

  return (
    <ThemeProvider>
      <SessionInsightProvider>
        <JarvisExplainProvider explanations={content.jarvisExplanations}>
          <PortfolioDesign className={styles.page} allowXray>
            <SiteHeader labels={content.uiLabels} showXray />
            <XrayStackStrip />

            <main className={styles.main}>
              <Hero content={content.hero} nidusCtaLabel={NIDUS_CTA_LABELS.hero} />
              <HomeDuo lowi={content.lowi} labels={content.uiLabels} />

              <SketchSection
                id="about"
                eyebrow={numbered("01")}
                title={content.aboutMe.heading}
                layout="split"
              >
                <div className={styles.aboutBody}>
                  <p className={styles.aboutText}>
                    <HighlightPhrase
                      text={t(content.aboutMe.body)}
                      phrase={t(HOME_HIGHLIGHTS.about)}
                      delay={2}
                    />
                  </p>
                  <NidusCta interactionId="nidus_cta_about" variant="link" arrow>
                    {t(NIDUS_CTA_LABELS.about)}
                  </NidusCta>
                </div>
              </SketchSection>

              <SketchSection
                id="experience"
                eyebrow={numbered("02", content.sectionTitles.experience)}
                title={copy.experienceHeading}
                layout="split"
                aside={
                  <>
                    <p className={styles.experienceRoute}>{t(copy.experienceRoute)}</p>
                    <MarginNote as="p" rotate={-3} delay={2}>
                      {t(copy.experienceNote)}
                    </MarginNote>
                  </>
                }
              >
                <ExperienceTimeline
                  entries={experienceFor()}
                  explainButtonLabel={content.uiLabels.jarvisExplainButton}
                />
              </SketchSection>

              <SketchSection
                id="lowi"
                eyebrow={numbered("03")}
                title={content.sectionTitles.lowi}
                layout="split"
                aside={
                  <CtaLink
                    href={content.lowi.celPath}
                    interactionId="lowi_cta_celpagina"
                    variant="link"
                    arrow
                  >
                    {t(content.lowi.celLinkLabel)}
                  </CtaLink>
                }
              >
                <LowiSection
                  content={content.lowi}
                  labels={content.uiLabels}
                  nidusLayerTree={nidusLayerTree}
                />
              </SketchSection>

              <EducationLanguages
                education={content.education}
                languageSkills={content.languageSkills}
                titles={{
                  education: content.sectionTitles.education,
                  languages: content.sectionTitles.languages,
                }}
              />

              <SketchSection
                id="skills"
                eyebrow={numbered("06")}
                title={content.sectionTitles.skills}
                aside={
                  <MarginNote className={styles.skillsNote} rotate={-2} delay={2}>
                    {t(content.skillsSection.lead)}
                  </MarginNote>
                }
              >
                <Skills content={content.skillsSection} />
              </SketchSection>

              <SketchSection
                id="projects"
                eyebrow={numbered("07")}
                title={content.sectionTitles.projects}
                aside={
                  xrayActive ? (
                    <MarginNote className={styles.projectsNote} rotate={-2}>
                      {t(copy.projectsXrayNote)}
                    </MarginNote>
                  ) : null
                }
              >
                <div className={styles.projectsGrid}>
                  {content.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      labels={content.uiLabels}
                      explanationId={project.id === "jarvis" ? "ai-transition" : undefined}
                    />
                  ))}
                </div>
                <div className={styles.projectsFooter}>
                  <NidusCta interactionId="nidus_cta_projects" variant="outline" arrow>
                    {t(NIDUS_CTA_LABELS.projects)}
                  </NidusCta>
                </div>
              </SketchSection>

              <ContactFooter
                contact={content.contact}
                title={content.sectionTitles.contact}
                labels={content.uiLabels}
              />
            </main>

            <SiteFooter
              current="home"
              cvUrl={content.contact.cvPdfAvailable ? content.contact.cvPdfUrl : undefined}
            />
            <JarvisAsk />
            <JarvisExplainPanel labels={content.uiLabels} />
          </PortfolioDesign>
        </JarvisExplainProvider>
      </SessionInsightProvider>
    </ThemeProvider>
  );
}
