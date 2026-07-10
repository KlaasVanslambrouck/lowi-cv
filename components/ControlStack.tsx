"use client";

import type { UILabels } from "@/types/content";
import LowiMark from "@/components/LowiMark";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import XrayToggle from "@/components/XrayToggle";
import controlStyles from "@/styles/controlStack.module.css";
import styles from "@/styles/cv.module.css";

interface ControlStackProps {
  labels: UILabels;
  showXray?: boolean;
}

// Groepeert de vaste instellingen zodat ze als één klein systeem lezen.
export default function ControlStack({
  labels,
  showXray = true,
}: ControlStackProps) {
  return (
    <div
      className={`${styles.controlStack} ${controlStyles.glass}`}
      aria-label="Portfolio controls"
    >
      <LowiMark />
      <LanguageToggle />
      <ThemeToggle labels={labels} />
      {showXray ? <XrayToggle labels={labels} /> : null}
    </div>
  );
}
