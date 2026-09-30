"use client";

import { useRef } from "react";
import MarginNote from "@/components/sketch/MarginNote";
import { useSketchState } from "@/components/sketch/SketchScope";
import { sketchClassName } from "@/components/sketch/sketchClasses";
import { SKETCH_LABELS, homeRedesignCopy as copy } from "@/components/home/homeRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import { useXray } from "@/hooks/useXray";
import sketch from "@/components/sketch/sketch.module.css";
import styles from "@/styles/home.module.css";

// Getekende systeemschets in de hero: interfaces ⇄ API ⇄ data, gebaseerd op
// de bestaande Nidus-architectuur. In X-ray tonen de labels de componenten.
// Vaste paden uit Home.dc.html; alleen de pijlen tekenen zich.
export default function SystemSketch() {
  const { t } = useLanguage();
  const { xrayActive } = useXray();
  const ref = useRef<SVGSVGElement>(null);
  const state = useSketchState(ref);
  const labels = xrayActive ? SKETCH_LABELS.xray : SKETCH_LABELS.normal;
  const arrow = (delay: string) => `${sketch.line} ${delay}`;

  return (
    <figure className={styles.sketch}>
      <svg
        ref={ref}
        className={sketchClassName(styles.sketchSvg, state, { tone: "accent" })}
        viewBox="0 0 560 190"
        role="img"
        aria-label={t(copy.sketchAria)}
      >
        <g className={styles.sketchBlobs}>
          <path d="M88 44 C 126 42, 158 74, 156 112 C 154 150, 124 180, 86 178 C 48 176, 20 146, 22 108 C 24 70, 52 46, 90 44" />
          <path d="M280 42 C 318 44, 348 74, 346 112 C 344 150, 314 180, 278 178 C 240 176, 212 148, 214 110 C 216 72, 244 42, 282 42" />
          <path d="M472 44 C 510 46, 538 76, 536 114 C 534 150, 504 180, 468 178 C 430 176, 402 146, 404 108 C 406 70, 436 44, 474 44" />
        </g>
        <g className={styles.sketchIcons}>
          {/* scherm en telefoon */}
          <rect x="56" y="88" width="46" height="32" rx="3" />
          <path d="M48 126 H110" />
          <rect x="108" y="96" width="18" height="30" rx="3" />
          {/* API-stapel */}
          <rect x="252" y="80" width="56" height="16" rx="3" />
          <rect x="252" y="102" width="56" height="16" rx="3" />
          <rect x="252" y="124" width="56" height="16" rx="3" />
          <path d="M262 88 H266 M262 110 H266 M262 132 H266" />
          {/* database */}
          <ellipse cx="470" cy="84" rx="30" ry="9" />
          <path d="M440 84 V136 C 440 142, 500 142, 500 136 V84 M440 101 C 440 107, 500 107, 500 101 M440 118 C 440 124, 500 124, 500 118" />
        </g>
        <g className={styles.sketchArrows}>
          <path className={arrow(sketch.delay3)} d="M166 100 C 180 96, 194 98, 204 100" />
          <path className={arrow(sketch.delay3)} d="M196 93 L205 100 L196 107" />
          <path className={arrow(sketch.delay3)} d="M204 122 C 190 124, 178 122, 166 122" />
          <path className={arrow(sketch.delay3)} d="M174 115 L165 122 L174 129" />
          <path className={arrow(sketch.delay4)} d="M356 100 C 370 96, 384 98, 394 100" />
          <path className={arrow(sketch.delay4)} d="M386 93 L395 100 L386 107" />
          <path className={arrow(sketch.delay4)} d="M394 122 C 380 124, 368 122, 356 122" />
          <path className={arrow(sketch.delay4)} d="M364 115 L355 122 L364 129" />
        </g>
      </svg>
      <div className={styles.sketchLabels}>
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <figcaption className={styles.sketchCaption}>
        <MarginNote rotate={-2} delay={5}>
          {t(copy.sketchNote)}
        </MarginNote>
      </figcaption>
    </figure>
  );
}
