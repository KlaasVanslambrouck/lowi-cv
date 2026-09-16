"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, memo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from "react";
import { lowiCelHoofdstukken, lowiCelIntro, lowiCelSectieId, lowiCelSlot } from "@/content/lowiCellContent";
import JarvisAsk from "@/components/jarvis/JarvisAsk";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import { useScrollVoortgang } from "@/hooks/useScrollVoortgang";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { useEenmaligeReveal } from "./useEenmaligeReveal";
import type { Bilingual } from "@/types/content";
import styles from "./LowiCelPagina.module.css";

const CelCanvas = dynamic(() => import("./CelCanvas"), { ssr: false, loading: () => <div className={styles.canvasVlak} /> });
type Hoofdstuk = (typeof lowiCelHoofdstukken)[number];
type Project = { name: string; status?: Bilingual; tagline: Bilingual };

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Stilbeeld({ id, priority = false }: { id: string; priority?: boolean }) {
  return <div className={styles.stilbeeld} aria-hidden="true">
    <Image src={`/lowi/cell/${id}.webp`} alt="" width={900} height={900} sizes="(max-width: 767px) 100vw, 520px" loading={priority ? 'eager' : 'lazy'} unoptimized />
  </div>;
}

const HoofdstukMetTracking = memo(function HoofdstukMetTracking(props: { hoofdstuk: Hoofdstuk; index: number }) {
  const [sectieRef] = useSectionTracking<HTMLElement>(lowiCelSectieId(props.hoofdstuk.id));
  return <HoofdstukSectie {...props} sectieRef={sectieRef} />;
});

const HoofdstukSectie = memo(function HoofdstukSectie({ hoofdstuk, index, sectieRef }: { hoofdstuk: Hoofdstuk; index: number; sectieRef: RefObject<HTMLElement | null> }) {
  const { t } = useLanguage();
  const id = lowiCelSectieId(hoofdstuk.id);
  return <section ref={sectieRef} id={id} data-section-id={id} aria-labelledby={`${id}-titel`} className={styles.hoofdstuk}
    style={{ '--hoofdstuk-accent': `var(${hoofdstuk.accentToken})` } as CSSProperties}>
    <div className={styles.tekstvlak} data-lowi-reveal="">
      <p className={styles.nummer}>{String(index + 1).padStart(2, '0')} / 07</p>
      <h2 id={`${id}-titel`} className={styles.hoofdstukTitel}>{t(hoofdstuk.titel)}</h2>
      <p className={styles.kernzin}>{t(hoofdstuk.kernzin)}</p>
      <div className={styles.biologie}><span className={styles.label}>{t({ nl: 'In de cel', en: 'In the cell' })}</span><p>{t(hoofdstuk.biologie)}</p></div>
      <div className={styles.lowi}><span className={styles.label}>{t({ nl: 'Binnen LOWI', en: 'Within LOWI' })}</span><p>{t(hoofdstuk.lowi)}</p></div>
      {hoofdstuk.id === 'bouwen' && <details className={styles.bewijs}>
        <summary>{t({ nl: 'Van idee naar systeem · Nidus', en: 'From idea to system · Nidus' })}</summary>
        <p>{t({ nl: 'De mobiele interface spreekt met nidus-api. De API ontsluit data in Supabase; Raspberry Pi-workers voeren terugkerende taken uit. Interfaces, verwerking en opslag hebben elk hun eigen verantwoordelijkheid.', en: 'The mobile interface talks to nidus-api. The API exposes data in Supabase; Raspberry Pi workers run recurring tasks. Interfaces, processing and storage each have their own responsibility.' })}</p>
        <Link href="/nidus#nidus-architectuur">{t({ nl: 'Bekijk de architectuur', en: 'Explore the architecture' })} <span aria-hidden="true">↗</span></Link>
      </details>}
    </div>
    <Stilbeeld id={hoofdstuk.id} />
  </section>;
});

export default function LowiCelPagina({ projects }: { projects: Project[] }): ReactElement {
  const { t } = useLanguage();
  const { ready, showLiveScene, reducedMotion } = useSceneSupport();
  const [sceneFailed, setSceneFailed] = useState(false);
  const live = showLiveScene && !sceneFailed;
  const sessionId = useAnalyticsSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const paginaRef = useRef<HTMLDivElement>(null);
  useEenmaligeReveal(paginaRef, reducedMotion);
  const { voortgangRef, actiefHoofdstukIndex, inBeeld } = useScrollVoortgang(containerRef, lowiCelHoofdstukken.length, live);
  const [sceneVisited, setSceneVisited] = useState(false);
  // Load when the observer first sees the stage; keep resources while travelling.
  if (inBeeld && !sceneVisited) setSceneVisited(true);
  const annotation = t({ nl: 'Artistieke visualisatie · niet op schaal', en: 'Artistic visualisation · not to scale' });
  function handleCtaKlik() {
    if (sessionId) trackEvent({ sessionId, eventType: 'interaction', eventData: { interactionId: 'lowi_cel_cta_nidus' } });
  }
  return <div ref={paginaRef} className={!ready ? styles.wachtPagina : live ? styles.scrollPagina : styles.artikelPagina} data-lowi-modus={live ? 'scroll' : 'artikel'}>
    <a className={styles.skipLink} href="#lowi-projecten">{t({ nl: 'Direct naar de projecten', en: 'Skip to the projects' })}</a>
    <div ref={containerRef} className={styles.hoofdstukkenContainer}>
      {(live || !ready) && <div className={styles.sceneLaag}>
        <div className={styles.canvasSlot} data-lowi-canvas-slot="" aria-hidden="true">
          {live && sceneVisited && <SceneBoundary onFailure={() => setSceneFailed(true)}><CelCanvas voortgangRef={voortgangRef} inBeeld={inBeeld} onFailure={() => setSceneFailed(true)} /></SceneBoundary>}
        </div>
        <div className={styles.sceneVoet}>
          <p className={styles.annotation}>{annotation}</p>
          <nav className={styles.indicator} aria-label={t({ nl: 'Hoofdstukken in de cel', en: 'Chapters inside the cell' })}>
            <span className={styles.progress} data-lowi-progress="" aria-hidden="true" />
            {lowiCelHoofdstukken.map((hoofdstuk, index) => <a key={hoofdstuk.id} href={`#${lowiCelSectieId(hoofdstuk.id)}`}
              aria-label={`${index + 1}. ${t(hoofdstuk.titel)}`} aria-current={index === actiefHoofdstukIndex ? 'step' : undefined} className={styles.markering}>
              {String(index + 1).padStart(2, '0')}
            </a>)}
          </nav>
        </div>
      </div>}
      <div className={styles.hoofdstukken}>
        <header className={styles.intro}>
          <p className={styles.kicker}>{t({ nl: 'Een persoonlijk lab van Klaas Vanslambrouck', en: 'A personal lab by Klaas Vanslambrouck' })}</p>
          <h1 className={styles.titel}>{t(lowiCelIntro.titel)}</h1>
          <p className={styles.ondertitel}>{t(lowiCelIntro.ondertitel)}</p>
          <p className={styles.introTekst}>{t({ nl: 'Ik onderzoek hoe dingen werken. En bouw om te ontdekken wat ermee kan. AI, biologie, systemen en verhalen komen hier samen.', en: 'I explore how things work. And build to find out what they can do. AI, biology, systems and stories meet here.' })}</p>
          <a className={styles.scrollHint} href="#lowi-cel-grens">{t(lowiCelIntro.scrollHint)} <span aria-hidden="true">↓</span></a>
          <Stilbeeld id="exterior" priority />
          <p className={styles.mobieleAnnotatie}>{annotation}</p>
        </header>
        {lowiCelHoofdstukken.map((hoofdstuk, index) => <HoofdstukMetTracking key={hoofdstuk.id} hoofdstuk={hoofdstuk} index={index} />)}
      </div>
    </div>
    <footer id="lowi-projecten" className={styles.slot} aria-labelledby="lowi-slot-titel" tabIndex={-1}>
      <p className={styles.kicker}>{t({ nl: 'Eén lab. Verschillende richtingen.', en: 'One lab. Different directions.' })}</p>
      <h2 id="lowi-slot-titel" className={styles.slotTitel}>{t(lowiCelSlot.titel)}</h2>
      <p className={styles.slotTekst}>{t(lowiCelSlot.tekst)}</p>
      <div className={styles.projecten}>
        {projects.slice(0, 2).map((project, index) => <article key={project.name} className={styles.project}>
          <span className={styles.projectSignatuur} data-richting={index} aria-hidden="true" />
          <div><p className={styles.projectStatus}>{project.status && t(project.status)}</p><h3>{project.name}</h3><p>{t(project.tagline)}</p></div>
        </article>)}
      </div>
      <div className={styles.slotActies}>
        <Link className={styles.cta} href={lowiCelSlot.ctaHref} onClick={handleCtaKlik}>{t(lowiCelSlot.ctaLabel)} <span aria-hidden="true">↗</span></Link>
        <Link className={styles.secondary} href="/#projects">{t({ nl: 'Meer werk bekijken', en: 'Explore more work' })} <span aria-hidden="true">→</span></Link>
      </div>
      <div className={styles.jarvis}><JarvisAsk placement="inline" /></div>
    </footer>
  </div>;
}
