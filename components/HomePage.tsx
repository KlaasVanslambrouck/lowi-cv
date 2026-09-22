"use client";

import { placeholderContent } from "@/content/placeholderContent";
import { experienceFor } from "@/lib/experience";
import { useLanguage } from "@/hooks/useLanguage";
import ControlStack from "@/components/ControlStack";
import Hero from "@/components/Hero";
import NidusCta from "@/components/NidusCta";
import CVSection from "@/components/CVSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import EducationList from "@/components/EducationList";
import LanguageSkillsList from "@/components/LanguageSkillsList";
import Skills from "@/components/Skills";
import LowiSection from "@/components/LowiSection";
import ArchitectureSceneMini from "@/components/ArchitectureSceneMini";
import ProjectCard from "@/components/ProjectCard";
import ContactFooter from "@/components/ContactFooter";
import JarvisExplainPanel from "@/components/JarvisExplainPanel";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import { JarvisExplainProvider } from "@/context/JarvisExplainContext";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { Bilingual } from "@/types/content";
import styles from "@/styles/cv.module.css";

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

// De volledige CV-pagina. Alle content komt uit placeholderContent en wordt
// later vervangen door een fetch uit de Supabase-tabel `portfolio_content`.
export default function HomePage() {
  const content = placeholderContent;
  const { t } = useLanguage();

  return (
    <ThemeProvider>
      <SessionInsightProvider>
        <JarvisExplainProvider explanations={content.jarvisExplanations}>
          <main className={styles.cvPage}>
          <ControlStack labels={content.uiLabels} />

          <Hero
            content={content.hero}
            nidusCtaLabel={NIDUS_CTA_LABELS.hero}
          />

          <CVSection id="about" title={content.aboutMe.heading}>
            <p className={styles.aboutMeBody}>{t(content.aboutMe.body)}</p>
            <NidusCta interactionId="nidus_cta_about" variant="secondary">
              {t(NIDUS_CTA_LABELS.about)}
            </NidusCta>
          </CVSection>

          <CVSection id="experience" title={content.sectionTitles.experience}>
            <ExperienceTimeline
              entries={experienceFor()}
              explainButtonLabel={content.uiLabels.jarvisExplainButton}
            />
          </CVSection>

          <CVSection id="lowi" title={content.sectionTitles.lowi}>
            <LowiSection content={content.lowi} labels={content.uiLabels} />
          </CVSection>

          <CVSection id="education" title={content.sectionTitles.education}>
            <EducationList entries={content.education} />
          </CVSection>

          <CVSection id="languages" title={content.sectionTitles.languages}>
            <LanguageSkillsList skills={content.languageSkills} />
          </CVSection>

          <CVSection id="skills" title={content.sectionTitles.skills}>
            <Skills content={content.skillsSection} />
          </CVSection>

          {/* Visuele brug tussen "Wat ik bouw" en "Projecten" - lazy mount */}
          <ArchitectureSceneMini />

          <CVSection id="projects" title={content.sectionTitles.projects}>
            <div className={styles.projectsGrid}>
              {content.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  labels={content.uiLabels}
                  explanationId={
                    project.id === "jarvis" ? "ai-transition" : undefined
                  }
                />
              ))}
            </div>
            <NidusCta interactionId="nidus_cta_projects" variant="secondary">
              {t(NIDUS_CTA_LABELS.projects)}
            </NidusCta>
          </CVSection>

          <ContactFooter
            contact={content.contact}
            title={content.sectionTitles.contact}
            labels={content.uiLabels}
          />
          <JarvisAsk />
          <JarvisExplainPanel labels={content.uiLabels} />
          </main>
        </JarvisExplainProvider>
      </SessionInsightProvider>
    </ThemeProvider>
  );
}
