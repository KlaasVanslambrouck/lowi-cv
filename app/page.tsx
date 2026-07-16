"use client";

import { placeholderContent } from "@/content/placeholderContent";
import { useLanguage } from "@/hooks/useLanguage";
import ControlStack from "@/components/ControlStack";
import Hero from "@/components/Hero";
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
import styles from "@/styles/cv.module.css";

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

          <Hero content={content.hero} />

          <CVSection id="about" title={content.aboutMe.heading}>
            <p className={styles.aboutMeBody}>{t(content.aboutMe.body)}</p>
          </CVSection>

          <CVSection id="experience" title={content.sectionTitles.experience}>
            <ExperienceTimeline
              entries={content.experience}
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
