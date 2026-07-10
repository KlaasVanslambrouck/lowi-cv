"use client";

import type { Bilingual } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/nidus.module.css";

interface NidusPlaceholderProps {
  text: Bilingual;
}

export default function NidusPlaceholder({ text }: NidusPlaceholderProps) {
  const { t } = useLanguage();

  return <p className={styles.placeholder}>{t(text)}</p>;
}
