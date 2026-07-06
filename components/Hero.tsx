"use client";

import dynamic from "next/dynamic";
import type { HeroContent } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import ArchitectureSceneFallback from "@/components/ArchitectureSceneFallback";
import styles from "@/styles/cv.module.css";

// 3D-scene lazy laden, uitsluitend client-side; SVG-netwerk als loading-fallback
const ArchitectureScene = dynamic(
  () => import("@/components/ArchitectureScene"),
  { ssr: false, loading: () => <ArchitectureSceneFallback /> },
);

interface HeroProps {
  content: HeroContent;
}

export default function Hero({ content }: HeroProps) {
  const { t } = useLanguage();
  const [heroRef] = useSectionTracking<HTMLElement>("hero");
  // Gedeelde detectie (reduced motion, <768px, WebGL); vóór mount tonen we
  // altijd de SVG-fallback zodat er nooit een lege hero flitst
  const support = useSceneSupport();

  return (
    <header ref={heroRef} className={styles.hero} data-section-id="hero">
      <div className={styles.heroScene}>
        {support.showLiveScene ? (
          <ArchitectureScene />
        ) : (
          <ArchitectureSceneFallback />
        )}
      </div>
      <div className={styles.heroContent}>
        <h1 className={styles.heroName}>{content.name}</h1>
        {/* current → target: huidige rol in bone, doelrol in koper */}
        <p className={styles.heroRoles}>
          <span className={styles.roleCurrent}>{t(content.currentRole)}</span>
          <span className={styles.roleArrow} aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              focusable="false"
            >
              <path
                d="M4 12h14m0 0-5-5m5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.roleTarget}>{t(content.targetRole)}</span>
        </p>
        <p className={styles.heroThesis}>{t(content.thesis)}</p>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} aria-hidden="true" />
          {t(content.liveLabel)}
        </span>
      </div>
    </header>
  );
}
