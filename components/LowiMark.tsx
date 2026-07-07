"use client";

import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/cv.module.css";

// Klein levend merkteken: LOWI als actief systeem, zonder extra woordmerk.
export default function LowiMark() {
  const { language } = useLanguage();
  const label = language === "nl" ? "LOWI leeft" : "LOWI is alive";

  return <span className={styles.lowiMark} role="img" aria-label={label} />;
}
