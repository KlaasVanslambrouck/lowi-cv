"use client";

import type { LanguageSkill } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

interface LanguageSkillsListProps {
  skills: LanguageSkill[];
}

export default function LanguageSkillsList({
  skills,
}: LanguageSkillsListProps) {
  const { t } = useLanguage();

  return (
    <ul className={styles.languageList}>
      {skills.map((skill) => (
        <li key={skill.language.en} className={styles.languageItem}>
          <span className={styles.languageName}>{t(skill.language)}</span>
          <span className={styles.languageLevel}>{t(skill.level)}</span>
        </li>
      ))}
    </ul>
  );
}
