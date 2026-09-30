"use client";

import type { ReactNode } from "react";
import EducationList from "@/components/EducationList";
import LanguageSkillsList from "@/components/LanguageSkillsList";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import type { Bilingual, EducationEntry, LanguageSkill } from "@/types/content";
import sectionStyles from "@/styles/sketchSection.module.css";
import styles from "@/styles/home.module.css";

interface ColumnProps {
  id: string;
  number: string;
  title: Bilingual;
  children: ReactNode;
}

// Eén kolom = één sectie, zodat de ankers en de analytics van #education en
// #languages blijven bestaan, ook al staan ze in het ontwerp naast elkaar.
function Column({ id, number, title, children }: ColumnProps) {
  const { t } = useLanguage();
  const [sectionRef] = useSectionTracking<HTMLElement>(id);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section-id={id}
      aria-labelledby={`${id}-titel`}
      className={styles.eduColumn}
    >
      <p className={sectionStyles.eyebrow}>{number}</p>
      <h2 id={`${id}-titel`} className={sectionStyles.title}>
        {t(title)}
      </h2>
      {children}
    </section>
  );
}

interface EducationLanguagesProps {
  education: EducationEntry[];
  languageSkills: LanguageSkill[];
  titles: { education: Bilingual; languages: Bilingual };
}

// Opleiding + talen, rustig naast elkaar (Home.dc.html).
export default function EducationLanguages({
  education,
  languageSkills,
  titles,
}: EducationLanguagesProps) {
  return (
    <div className={`${sectionStyles.section} ${styles.eduLang}`}>
      <Column id="education" number="04" title={titles.education}>
        <EducationList entries={education} />
      </Column>
      <Column id="languages" number="05" title={titles.languages}>
        <LanguageSkillsList skills={languageSkills} />
      </Column>
    </div>
  );
}
