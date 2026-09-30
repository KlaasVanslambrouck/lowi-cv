"use client";

import type { LanguageSkill } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/home.module.css";

interface LanguageSkillsListProps {
  skills: LanguageSkill[];
}

export default function LanguageSkillsList({ skills }: LanguageSkillsListProps) {
  const { t } = useLanguage();

  return (
    <dl className={styles.languageList}>
      {skills.map((skill) => (
        <div key={skill.language.en} className={styles.languageItem}>
          <dt className={styles.languageName}>{t(skill.language)}</dt>
          <dd className={styles.languageLevel}>{t(skill.level)}</dd>
        </div>
      ))}
    </dl>
  );
}
