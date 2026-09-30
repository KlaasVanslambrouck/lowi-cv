"use client";

import MarginNote from "@/components/sketch/MarginNote";
import { XRAY_STACK, homeRedesignCopy as copy } from "@/components/home/homeRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import styles from "@/styles/home.module.css";

// Stapelstrook onder de header, alleen in X-ray (Home.dc.html).
export default function XrayStackStrip() {
  const { t } = useLanguage();
  const { xrayActive } = useXray();

  if (!xrayActive) return null;

  return (
    <div className={styles.xrayStrip}>
      <span className={styles.eyebrow}>{t(copy.xrayStackLabel)}</span>
      <ul className={styles.chips} aria-label={t(copy.xrayStackLabel)}>
        {XRAY_STACK.map((layer) => (
          <li key={layer} className={styles.xrayChip}>
            {layer}
          </li>
        ))}
      </ul>
      <MarginNote className={styles.xrayStripNote} rotate={-2}>
        {t(copy.xrayNote)}
      </MarginNote>
    </div>
  );
}
