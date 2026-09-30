"use client";

import type { EducationEntry } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/home.module.css";

interface EducationListProps {
  entries: EducationEntry[];
}

export default function EducationList({ entries }: EducationListProps) {
  const { t } = useLanguage();

  return (
    <ul>
      {entries.map((entry) => (
        <li key={`${entry.institution}-${entry.period}`} className={styles.eduEntry}>
          <h3 className={styles.eduDegree}>{t(entry.degree)}</h3>
          <p className={styles.eduInstitution}>{entry.institution}</p>
          <p className={styles.small}>{entry.period}</p>
        </li>
      ))}
    </ul>
  );
}
