"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { memo, useRef, type CSSProperties, type ReactElement, type RefObject } from "react";
import {
  lowiCelHoofdstukken,
  lowiCelIntro,
  lowiCelSectieId,
  lowiCelSlot,
} from "@/content/lowiCellContent";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import { useScrollVoortgang } from "@/hooks/useScrollVoortgang";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { trackEvent } from "@/lib/analytics/trackEvent";
import type { CtaInteractionId } from "@/lib/analytics/trackValidation";
import styles from "./LowiCelPagina.module.css";

const CelCanvas = dynamic(() => import("./CelCanvas"), {
  ssr: false,
  loading: () => <div className={styles.canvasVlak} />,
});

type Hoofdstuk = (typeof lowiCelHoofdstukken)[number];

interface AccentVariabelen extends CSSProperties {
  "--hoofdstuk-accent": `var(${Hoofdstuk["accentToken"]})`;
}

interface ContainerVariabelen extends CSSProperties {
  "--aantal-hoofdstukken": number;
}

interface HoofdstukSectieProps {
  hoofdstuk: Hoofdstuk;
  index: number;
}

// Alleen deze kleine adapter leest de veranderende trackingcontext. Dezelfde
// ref en hoofdstukprops houden de tekstsubtree stabiel bij verblijfsduurupdates.
const HoofdstukMetTracking = memo(function HoofdstukMetTracking(props: HoofdstukSectieProps): ReactElement {
  const [sectieRef] = useSectionTracking<HTMLElement>(lowiCelSectieId(props.hoofdstuk.id));
  return <HoofdstukSectie {...props} sectieRef={sectieRef} />;
});

const HoofdstukSectie = memo(function HoofdstukSectie({ hoofdstuk, index, sectieRef }: HoofdstukSectieProps & { sectieRef: RefObject<HTMLElement | null> }): ReactElement {
  const { t } = useLanguage();
  const sectieId = lowiCelSectieId(hoofdstuk.id);
  const accent: AccentVariabelen = {
    "--hoofdstuk-accent": `var(${hoofdstuk.accentToken})`,
  };

  return (
    <section
      ref={sectieRef}
      id={sectieId}
      data-section-id={sectieId}
      aria-labelledby={`${sectieId}-titel`}
      className={styles.hoofdstuk}
      style={accent}
    >
      <div className={styles.tekstvlak}>
        <p className={styles.nummer} aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {lowiCelHoofdstukken.length}
        </p>
        <h2 id={`${sectieId}-titel`} className={styles.hoofdstukTitel}>
          {t(hoofdstuk.titel)}
        </h2>
        <p className={styles.kernzin}>{t(hoofdstuk.kernzin)}</p>
        <p className={styles.biologie}>{t(hoofdstuk.biologie)}</p>
        <p className={styles.lowi}>{t(hoofdstuk.lowi)}</p>
      </div>
    </section>
  );
});

export default function LowiCelPagina(): ReactElement {
  const { t } = useLanguage();
  const { ready, showLiveScene } = useSceneSupport();
  const sessionId = useAnalyticsSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const { voortgangRef, actiefHoofdstukIndex, inBeeld } = useScrollVoortgang(
    containerRef,
    lowiCelHoofdstukken.length,
    showLiveScene,
  );
  const actiefHoofdstuk = lowiCelHoofdstukken[actiefHoofdstukIndex];
  const indicatorAccent: AccentVariabelen = {
    "--hoofdstuk-accent": `var(${actiefHoofdstuk.accentToken})`,
  };
  const containerVariabelen: ContainerVariabelen = {
    "--aantal-hoofdstukken": lowiCelHoofdstukken.length,
  };

  function handleCtaKlik(): void {
    if (!sessionId) return;
    const interactionId: CtaInteractionId = "lowi_cel_cta_nidus";
    trackEvent({
      sessionId,
      eventType: "interaction",
      eventData: { interactionId },
    });
  }

  // Echte artikel-tak: zonder sceneondersteuning bestaat de sticky subtree
  // niet en draait de scroll-hook geen rAF-loop. De tekst blijft gemount bij
  // een moduswissel, zodat useSectionTracking zijn eenmalige views behoudt.
  const sceneLaag: ReactElement | null = showLiveScene ? (
    <div className={styles.sceneLaag} aria-hidden="true">
      <div className={styles.canvasSlot} data-lowi-canvas-slot="">
        <CelCanvas voortgangRef={voortgangRef} inBeeld={inBeeld} />
      </div>
      <div className={styles.indicator} style={indicatorAccent}>
        {lowiCelHoofdstukken.map((hoofdstuk, index) => (
          <span
            key={hoofdstuk.id}
            className={styles.markering}
            data-actief={index === actiefHoofdstukIndex}
          />
        ))}
      </div>
    </div>
  ) : !ready ? (
    <div className={`${styles.sceneLaag} ${styles.scenePlaceholder}`} aria-hidden="true" />
  ) : null;

  return (
    <div
      className={!ready ? styles.wachtPagina : showLiveScene ? styles.scrollPagina : styles.artikelPagina}
      data-lowi-modus={showLiveScene ? "scroll" : "artikel"}
    >
      <header className={styles.intro}>
        <h1 className={styles.titel}>{t(lowiCelIntro.titel)}</h1>
        <p className={styles.ondertitel}>{t(lowiCelIntro.ondertitel)}</p>
        <p className={styles.scrollHint}>{t(lowiCelIntro.scrollHint)}</p>
      </header>

      <div
        ref={containerRef}
        className={styles.hoofdstukkenContainer}
        style={containerVariabelen}
      >
        {sceneLaag}
        <div className={styles.hoofdstukken}>
          {lowiCelHoofdstukken.map((hoofdstuk, index) => (
            <HoofdstukMetTracking
              key={hoofdstuk.id}
              hoofdstuk={hoofdstuk}
              index={index}
            />
          ))}
        </div>
      </div>

      <footer className={styles.slot}>
        <h2 className={styles.slotTitel}>{t(lowiCelSlot.titel)}</h2>
        <p className={styles.slotTekst}>{t(lowiCelSlot.tekst)}</p>
        {/* Het slot ligt buiten het instrumentvenster en volgt het thema.
            JarvisAsk staat naast de CTA i.p.v. ervoor: de link naar /nidus
            blijft zo de primaire actie, met Jarvis als tweede aanbod. */}
        <div className={styles.slotActies}>
          <Link
            className={styles.cta}
            href={lowiCelSlot.ctaHref}
            onClick={handleCtaKlik}
          >
            {t(lowiCelSlot.ctaLabel)}
            <span aria-hidden="true"> →</span>
          </Link>
          <JarvisAsk placement="inline" />
        </div>
      </footer>
    </div>
  );
}
