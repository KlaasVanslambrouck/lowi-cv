"use client";

import type { EducationEntry } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import CareerMotifBackground from "@/components/CareerMotifBackground";
import styles from "@/styles/cv.module.css";

interface EducationListProps {
  entries: EducationEntry[];
}

export default function EducationList({ entries }: EducationListProps) {
  const { t } = useLanguage();

  return (
    <ul className={styles.educationList}>
      {entries.map((entry) => (
        <li
          key={`${entry.institution}-${entry.period}`}
          className={styles.educationItem}
        >
          {entry.motif && <CareerMotifBackground motif={entry.motif} />}
          <div className={styles.educationItemContent}>
            <h3 className={styles.educationDegree}>{t(entry.degree)}</h3>
            <span className={styles.educationInstitution}>
              {entry.institution}
            </span>
            <span className={styles.educationPeriod}>{entry.period}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
