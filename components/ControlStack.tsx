"use client";

import type { UILabels } from "@/types/content";
import LowiMark from "@/components/LowiMark";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import XrayToggle from "@/components/XrayToggle";
import styles from "@/styles/cv.module.css";

interface ControlStackProps {
  labels: UILabels;
}

// Groepeert de vaste instellingen zodat ze als één klein systeem lezen.
export default function ControlStack({ labels }: ControlStackProps) {
  return (
    <div className={styles.controlStack} aria-label="Portfolio controls">
      <LowiMark />
      <LanguageToggle />
      <ThemeToggle labels={labels} />
      <XrayToggle labels={labels} />
    </div>
  );
}
