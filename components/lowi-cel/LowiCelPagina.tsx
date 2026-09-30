"use client";

import Link from "next/link";
import { Component, memo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from "react";
import { lowiCelHoofdstukken, lowiCelIntro, lowiCelSectieId, lowiCelSlot } from "@/content/lowiCellContent";
import { delingStappen, hoofdstukKort, kernzinMarkering, lowiPaginaTekst } from "@/content/lowiCelTekst";
import CtaLink from "@/components/CtaLink";
import HighlightPhrase from "@/components/sketch/HighlightPhrase";
import MarginNote from "@/components/sketch/MarginNote";
import { SketchScope } from "@/components/sketch/SketchScope";
import { sketchClassName } from "@/components/sketch/sketchClasses";
import Underline from "@/components/sketch/Underline";
import { useLanguage } from "@/hooks/useLanguage";
import { useScrollVoortgang } from "@/hooks/useScrollVoortgang";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { useSketchReveal, type SketchState } from "@/hooks/useSketchReveal";
import { localizedPath } from "@/lib/site";
import type { Bilingual } from "@/types/content";
import CelTekening from "./CelTekening";
import { HOOFDSTUK_FASE, isCelFase, type CelFase } from "./celFasen";
import sketch from "@/components/sketch/sketch.module.css";
import styles from "./LowiCelPagina.module.css";

type Hoofdstuk = (typeof lowiCelHoofdstukken)[number];
type Project = { name: string; status?: Bilingual; tagline: Bilingual };

// Bijschrift van de cel. Blijft staan tot Klaas de nieuwe tekst bevestigt
// (HANDOFF, Beslissingen §5).
const ANNOTATIE: Bilingual = { nl: "Artistieke visualisatie · niet op schaal", en: "Artistic visualisation · not to scale" };
const HOOFDSTUK_NAV: Bilingual = { nl: "Hoofdstukken in de cel", en: "Chapters inside the cell" };
const DEELSTAP_FASEN: readonly CelFase[] = ["deling1", "deling2", "deling3"];

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

// Een status telt als "actief" wanneer hij op productie/actief wijst.
function isActief(status?: Bilingual): boolean {
  return status ? /productie|actief|production|active|live/i.test(status.nl) : false;
}

const HoofdstukMetTracking = memo(function HoofdstukMetTracking(props: { hoofdstuk: Hoofdstuk; index: number; deelFase: CelFase | null }) {
  const [sectieRef] = useSectionTracking<HTMLElement>(lowiCelSectieId(props.hoofdstuk.id));
  const sketchState = useSketchReveal(sectieRef);
  return <HoofdstukSectie {...props} sectieRef={sectieRef} sketchState={sketchState} />;
});

const HoofdstukSectie = memo(function HoofdstukSectie({ hoofdstuk, index, deelFase, sectieRef, sketchState }: {
  hoofdstuk: Hoofdstuk; index: number; deelFase: CelFase | null; sectieRef: RefObject<HTMLElement | null>; sketchState: SketchState;
}) {
  const { language, t } = useLanguage();
  const id = lowiCelSectieId(hoofdstuk.id);
  const isDeling = hoofdstuk.id === "groei";

  return <section ref={sectieRef} id={id} data-section-id={id} data-phase={HOOFDSTUK_FASE[hoofdstuk.id]} aria-labelledby={`${id}-titel`}
    className={isDeling ? `${styles.hoofdstuk} ${styles.hoofdstukDeling}` : styles.hoofdstuk}>
    <SketchScope state={sketchState}>
      <p className={styles.nummer}>{String(index + 1).padStart(2, '0')} / 07</p>
      <h2 id={`${id}-titel`} className={styles.hoofdstukTitel}>{t(hoofdstuk.titel)}</h2>
      <p className={styles.kernzin}>
        <HighlightPhrase text={t(hoofdstuk.kernzin)} phrase={t(kernzinMarkering[hoofdstuk.id])} delay={2} />
      </p>
      <div className={styles.twee}>
        <svg className={styles.tweeLink} viewBox="0 0 60 30" aria-hidden="true" focusable="false"><path d="M4 20 C 18 4, 40 4, 54 18" /></svg>
        <div>
          <h3 className={`${styles.tweeKop} ${styles.tweeKopCel}`}>{t({ nl: 'In de cel', en: 'In the cell' })}</h3>
          <p className={styles.tweeTekst}>{t(hoofdstuk.biologie)}</p>
        </div>
        <div>
          <h3 className={`${styles.tweeKop} ${styles.tweeKopLowi}`}>{t({ nl: 'Binnen LOWI', en: 'Within LOWI' })}</h3>
          <p className={styles.tweeTekst}>{t(hoofdstuk.lowi)}</p>
        </div>
      </div>
      {hoofdstuk.id === 'bouwen' && <details className={styles.bewijs}>
        <summary>{t({ nl: 'Van idee naar systeem · Nidus', en: 'From idea to system · Nidus' })}<span className={styles.plus} aria-hidden="true">+</span></summary>
        <div className={styles.bewijsInhoud}>
          <p className={styles.tweeTekst}>{t({ nl: 'De mobiele interface spreekt met nidus-api. De API ontsluit data in Supabase; Raspberry Pi-workers voeren terugkerende taken uit. Interfaces, verwerking en opslag hebben elk hun eigen verantwoordelijkheid.', en: 'The mobile interface talks to nidus-api. The API exposes data in Supabase; Raspberry Pi workers run recurring tasks. Interfaces, processing and storage each have their own responsibility.' })}</p>
          <Link className={styles.tekstLink} href={localizedPath('/nidus#nidus-architectuur', language)}>{t({ nl: 'Bekijk de architectuur', en: 'Explore the architecture' })} <span aria-hidden="true">↗</span></Link>
        </div>
      </details>}
      {isDeling && <>
        {/* Drie deelstanden: data-phase zonder data-section-id (useScrollVoortgang). */}
        <ol className={styles.deelstappen}>
          {delingStappen.map((stap, stapIndex) => {
            const fase = DEELSTAP_FASEN[stapIndex];
            return <li key={stap.nl} data-phase={fase} className={styles.deelstap}>
              <span className={deelFase === fase ? `${styles.deelstapLetter} ${styles.deelstapActief}` : styles.deelstapLetter} aria-hidden="true">{'abc'[stapIndex]}</span>
              <span className={styles.deelstapTekst}>{t(stap)}</span>
            </li>;
          })}
        </ol>
        <p className={styles.deelstappenNoot}>{t(lowiPaginaTekst.deelstappenNoot)}</p>
      </>}
    </SketchScope>
  </section>;
});

function Projecten({ projects }: { projects: Project[] }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const sketchState = useSketchReveal(ref);
  const [nidus, tweede] = projects;

  return <section ref={ref} id="lowi-projecten" className={styles.projecten} aria-labelledby="lowi-slot-titel" tabIndex={-1}>
    <SketchScope state={sketchState}>
      <div className={styles.projectenKop}>
        <p className={styles.eyebrow}>{t({ nl: 'Eén lab. Verschillende richtingen.', en: 'One lab. Different directions.' })}</p>
        <h2 id="lowi-slot-titel" className={styles.projectenTitel}>{t(lowiCelSlot.titel)}</h2>
        <p className={styles.projectenTekst}>{t(lowiCelSlot.tekst)}</p>
        <div className={styles.kleineCel}>
          <CelTekening fase="deling3" bijschrift={ANNOTATIE} toonLabels={false} toonKader={false} stil />
        </div>
      </div>
      <div className={styles.projectenKaarten}>
        {/* van de gedeelde cel naar de twee richtingen */}
        <svg className={sketchClassName(styles.projectenPijlen, sketchState)} viewBox="0 0 120 420" aria-hidden="true" focusable="false">
          <g style={{ "--sk-stroke": "var(--teal)" } as CSSProperties}>
            <path className={`${sketch.line} ${sketch.delay1}`} d="M4 250 C 40 250, 50 90, 110 70" />
            <path className={`${sketch.line} ${sketch.delay2}`} d="M98 60 L112 70 L98 82" />
          </g>
          <g style={{ "--sk-stroke": "var(--accent)" } as CSSProperties}>
            <path className={`${sketch.line} ${sketch.delay2}`} d="M4 250 C 40 250, 50 380, 110 390" />
            <path className={`${sketch.line} ${sketch.delay3}`} d="M98 380 L112 390 L99 402" />
          </g>
        </svg>
        {[nidus, tweede].filter((project): project is Project => Boolean(project)).map((project, i) => {
          const actief = isActief(project.status);
          return <article key={project.name} className={actief ? styles.kaart : `${styles.kaart} ${styles.kaartAccent}`}>
            {project.status ? <span className={actief ? styles.status : `${styles.status} ${styles.statusAccent}`}>{t(project.status)}</span> : null}
            <h3 className={styles.kaartTitel}>{project.name}</h3>
            <p className={styles.kaartTagline}>{t(project.tagline)}</p>
            {i === 0 ? <CtaLink href={lowiCelSlot.ctaHref} interactionId="lowi_cel_cta_nidus" variant="primary">
              {t(lowiCelSlot.ctaLabel)} <span aria-hidden="true">↗</span>
            </CtaLink> : null}
          </article>;
        })}
        <MeerWerk />
      </div>
    </SketchScope>
  </section>;
}

function MeerWerk() {
  const { language, t } = useLanguage();
  return <Link className={styles.tekstLink} href={localizedPath('/#projects', language)}>{t({ nl: 'Meer werk bekijken', en: 'Explore more work' })} <span aria-hidden="true">→</span></Link>;
}

// LOWI-pagina (docs/redesign/artboards/Lowi.dc.html): tekst links, één sticky
// SVG-cel rechts die per hoofdstuk van stand wisselt. Zonder JS staat de cel
// in het overzicht en is alle tekst zichtbaar.
export default function LowiCelPagina({ projects }: { projects: Project[] }): ReactElement {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { actieveFase, actiefHoofdstukIndex } = useScrollVoortgang(containerRef);
  const fase: CelFase = isCelFase(actieveFase) ? actieveFase : "overzicht";
  const deelFase = fase.startsWith("deling") ? fase : null;
  const [sceneFailed, setSceneFailed] = useState(false);
  const introRef = useRef<HTMLElement>(null);
  const introState = useSketchReveal(introRef);

  const hoofdstukLinks = (kort: boolean) => lowiCelHoofdstukken.map((hoofdstuk, index) => {
    const nummer = String(index + 1).padStart(2, '0');
    return <a key={hoofdstuk.id} href={`#${lowiCelSectieId(hoofdstuk.id)}`}
      aria-current={index === actiefHoofdstukIndex ? 'step' : undefined}
      aria-label={kort ? `${nummer} · ${t(hoofdstuk.titel)}` : undefined}>
      {kort ? nummer : <><b>{nummer}</b>{t(hoofdstukKort[hoofdstuk.id])}</>}
    </a>;
  });

  return <div className={styles.pagina}>
    <div ref={containerRef} className={styles.celgrid}>
      <div className={styles.celKolom}>
        <div className={styles.celPlek}>
          {!sceneFailed && <SceneBoundary onFailure={() => setSceneFailed(true)}>
            <CelTekening fase={fase} bijschrift={ANNOTATIE} className={styles.cel} />
          </SceneBoundary>}
          <nav className={styles.hoofdstukKnoppen} aria-label={t(HOOFDSTUK_NAV)}>{hoofdstukLinks(true)}</nav>
        </div>
      </div>

      <div className={styles.tekstKolom}>
        <header ref={introRef} className={styles.intro} data-phase="overzicht">
          <SketchScope state={introState}>
            <p className={styles.eyebrow}>{t({ nl: 'Een persoonlijk lab van Klaas Vanslambrouck', en: 'A personal lab by Klaas Vanslambrouck' })}</p>
            <h1 className={styles.titel}>{t(lowiCelIntro.titel)}</h1>
            <p className={styles.ondertitel}>{t(lowiCelIntro.ondertitel)}</p>
            <p className={styles.lead}>
              {t({ nl: 'Ik ', en: 'I ' })}
              <Underline delay={2}>{t({ nl: 'onderzoek', en: 'explore' })}</Underline>
              {t({ nl: ' hoe dingen werken. En bouw om te ontdekken wat ermee kan.', en: ' how things work. And build to find out what they can do.' })}
            </p>
            <p className={styles.introTekst}>{t({ nl: 'AI, biologie, systemen en verhalen komen hier samen.', en: 'AI, biology, systems and stories meet here.' })}</p>
            <div className={styles.introLinks}>
              <a className={styles.scrollHint} href="#lowi-cel-grens">{t(lowiCelIntro.scrollHint)} <span aria-hidden="true">↓</span></a>
              <a className={styles.tekstLink} href="#lowi-projecten">{t({ nl: 'Direct naar de projecten', en: 'Skip to the projects' })}</a>
            </div>
            <MarginNote as="p" rotate={-3} delay={3}>{t(lowiPaginaTekst.introNotitie)}</MarginNote>
          </SketchScope>
        </header>

        <nav className={styles.hoofdstukBalk} aria-label={t(HOOFDSTUK_NAV)}>{hoofdstukLinks(false)}</nav>

        {lowiCelHoofdstukken.map((hoofdstuk, index) => <HoofdstukMetTracking key={hoofdstuk.id} hoofdstuk={hoofdstuk} index={index}
          deelFase={hoofdstuk.id === "groei" ? deelFase : null} />)}
      </div>
    </div>

    <Projecten projects={projects} />
  </div>;
}
