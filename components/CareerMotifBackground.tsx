"use client";

import { useId, type CSSProperties } from "react";
import type { CareerMotif } from "@/types/content";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import styles from "@/styles/cv.module.css";

interface CareerMotifBackgroundProps {
  motif: CareerMotif;
}

const motifClassNames: Record<CareerMotif, string> = {
  soundwave: styles.motifSoundwave,
  "stage-lights": styles.motifStageLights,
  blueprint: styles.motifBlueprint,
  flowchart: styles.motifFlowchart,
};

const soundBars = [34, 62, 44, 78, 52, 88, 46, 70, 58, 40];

const stageBeams = [
  { x: "-10%", angle: "-18deg", duration: "12s", delay: "-1s" },
  { x: "26%", angle: "11deg", duration: "14s", delay: "-5s" },
  { x: "58%", angle: "28deg", duration: "11s", delay: "-3s" },
];

function motifStyle(properties: Record<string, string | number>) {
  return properties as CSSProperties;
}

function SoundwaveMotif() {
  return (
    <div className={styles.soundwaveBars}>
      {soundBars.map((height, index) => (
        <span
          key={height + index}
          className={styles.soundwaveBar}
          style={motifStyle({
            "--bar-color":
              index % 2 === 0 ? "var(--cv-copper)" : "var(--cv-blue)",
            "--bar-delay": `${index * -0.17}s`,
            "--bar-duration": `${1.6 + (index % 4) * 0.22}s`,
            "--bar-height": `${height}%`,
          })}
        />
      ))}
    </div>
  );
}

function StageLightsMotif() {
  return (
    <>
      {stageBeams.map((beam, index) => (
        <span
          key={`${beam.angle}-${index}`}
          className={styles.stageBeam}
          style={motifStyle({
            "--beam-angle": beam.angle,
            "--beam-delay": beam.delay,
            "--beam-duration": beam.duration,
            "--beam-x": beam.x,
          })}
        />
      ))}
    </>
  );
}

function BlueprintMotif() {
  return (
    <svg
      className={styles.blueprintSvg}
      viewBox="0 0 320 180"
      focusable="false"
    >
      <path
        className={styles.blueprintStroke}
        d="M38 142 L38 60 L104 60 L104 34 L198 34 L198 82 L266 82 L266 142 Z"
      />
      <path
        className={styles.blueprintStrokeMuted}
        d="M70 116 L112 82 L154 122 L216 58 M104 60 L142 34 M198 82 L232 142"
      />
      <circle className={styles.blueprintStroke} cx="224" cy="112" r="22" />
    </svg>
  );
}

function FlowchartMotif() {
  const arrowId = `flowchart-arrow-${useId().replace(/:/g, "")}`;

  return (
    <svg
      className={styles.flowchartSvg}
      viewBox="0 0 340 180"
      focusable="false"
    >
      <defs>
        <marker
          id={arrowId}
          markerHeight="6"
          markerWidth="6"
          orient="auto"
          refX="5"
          refY="3"
          viewBox="0 0 6 6"
        >
          <path d="M0 0 L6 3 L0 6 Z" />
        </marker>
      </defs>

      <g
        className={styles.flowchartStep}
        style={motifStyle({ "--step-delay": "0s" })}
      >
        <rect x="34" y="32" width="72" height="36" rx="7" />
        <circle cx="54" cy="50" r="4" />
        <circle cx="72" cy="50" r="4" />
      </g>
      <g
        className={styles.flowchartStep}
        style={motifStyle({ "--step-delay": "0.3s" })}
      >
        <path
          d="M106 50 H148"
          className={styles.flowchartConnector}
          markerEnd={`url(#${arrowId})`}
        />
        <rect x="154" y="32" width="72" height="36" rx="7" />
        <path d="M172 50 H208" className={styles.flowchartInnerLine} />
      </g>
      <g
        className={styles.flowchartStep}
        style={motifStyle({ "--step-delay": "0.6s" })}
      >
        <path
          d="M226 50 C262 50 262 88 226 88 H190"
          className={styles.flowchartConnector}
          markerEnd={`url(#${arrowId})`}
        />
        <rect x="112" y="70" width="78" height="36" rx="7" />
        <path d="M132 88 H170" className={styles.flowchartInnerLine} />
      </g>
      <g
        className={styles.flowchartStep}
        style={motifStyle({ "--step-delay": "0.9s" })}
      >
        <path
          d="M151 106 V134 H228"
          className={styles.flowchartConnector}
          markerEnd={`url(#${arrowId})`}
        />
        <rect x="236" y="116" width="70" height="36" rx="7" />
        <circle cx="260" cy="134" r="4" />
        <path d="M274 134 H292" className={styles.flowchartInnerLine} />
      </g>
    </svg>
  );
}

export default function CareerMotifBackground({
  motif,
}: CareerMotifBackgroundProps) {
  const [motifRef, isVisible] = useInViewOnce<HTMLDivElement>({
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.18,
  });

  const className = [
    styles.careerMotif,
    motifClassNames[motif],
    isVisible ? styles.careerMotifVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={motifRef} className={className} aria-hidden="true">
      {motif === "soundwave" && <SoundwaveMotif />}
      {motif === "stage-lights" && <StageLightsMotif />}
      {motif === "blueprint" && <BlueprintMotif />}
      {motif === "flowchart" && <FlowchartMotif />}
    </div>
  );
}
