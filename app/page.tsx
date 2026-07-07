"use client";

import { placeholderContent } from "@/content/placeholderContent";
import { useLanguage } from "@/hooks/useLanguage";
import ControlStack from "@/components/ControlStack";
import Hero from "@/components/Hero";
import CVSection from "@/components/CVSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import EducationList from "@/components/EducationList";
import LanguageSkillsList from "@/components/LanguageSkillsList";
import SkillConstellation from "@/components/SkillConstellation";
import LowiSection from "@/components/LowiSection";
import ArchitectureSceneMini from "@/components/ArchitectureSceneMini";
import ProjectCard from "@/components/ProjectCard";
import LiveStatBadge from "@/components/LiveStatBadge";
import JarvisTerminal from "@/components/JarvisTerminal";
import JarvisPresence from "@/components/JarvisPresence";
import ContactFooter from "@/components/ContactFooter";
import JarvisExplainPanel from "@/components/JarvisExplainPanel";
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
          <JarvisPresence
            observations={content.jarvisObservations}
            label={content.uiLabels.jarvisPresenceLabel}
            askLabel={content.uiLabels.jarvisProactiveAsk}
          />

          <Hero content={content.hero} />

          <CVSection id="about" title={content.aboutMe.heading}>
            <p className={styles.aboutMeBody}>{t(content.aboutMe.body)}</p>
          </CVSection>

          <CVSection id="lowi" title={content.sectionTitles.lowi}>
            <LowiSection content={content.lowi} labels={content.uiLabels} />
          </CVSection>

          <CVSection id="experience" title={content.sectionTitles.experience}>
            <ExperienceTimeline
              entries={content.experience}
              explainButtonLabel={content.uiLabels.jarvisExplainButton}
            />
          </CVSection>

          <CVSection id="education" title={content.sectionTitles.education}>
            <EducationList entries={content.education} />
          </CVSection>

          <CVSection id="languages" title={content.sectionTitles.languages}>
            <LanguageSkillsList skills={content.languageSkills} />
          </CVSection>

          <CVSection id="skills" title={content.sectionTitles.skills}>
            <SkillConstellation
              nodes={content.skillNodes}
              projects={content.projects}
              labels={content.uiLabels}
            />
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

          <CVSection id="live-stats" title={content.sectionTitles.liveStats}>
            <div className={styles.statsGrid}>
              {content.liveStats.map((stat, index) => (
                <LiveStatBadge
                  key={stat.label.en}
                  stat={stat}
                  xrayDetail={content.uiLabels.xrayStatDetail}
                  explanationId={index === 0 ? "live-system" : undefined}
                  explainButtonLabel={content.uiLabels.jarvisExplainButton}
                />
              ))}
            </div>
            <p className={styles.statsNote}>
              {t(content.uiLabels.liveStatsNote)}
            </p>
          </CVSection>

          <CVSection id="jarvis" title={content.sectionTitles.jarvis}>
            <JarvisTerminal
              messages={content.jarvisMessages}
              labels={content.uiLabels}
            />
          </CVSection>

          <ContactFooter
            contact={content.contact}
            title={content.sectionTitles.contact}
            labels={content.uiLabels}
          />
          <JarvisExplainPanel labels={content.uiLabels} />
          </main>
        </JarvisExplainProvider>
      </SessionInsightProvider>
    </ThemeProvider>
  );
}
