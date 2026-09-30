"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  celLabels,
  celStandTekst,
  celTekst,
} from "@/content/lowiCelTekst";
import { useLanguage } from "@/hooks/useLanguage";
import type { Bilingual } from "@/types/content";
import {
  cameraTransform,
  isDeling,
  labelPlaatsen,
  laagOpaciteit,
  lensVoor,
  mitoTransformen,
  type CelFase,
} from "./celFasen";
import * as T from "./celVormen";
import styles from "./CelTekening.module.css";

interface CelTekeningProps {
  fase: CelFase;
  bijschrift: Bilingual;
  toonLabels?: boolean;
  // Standtekst, bijschrift en pauzeknop.
  toonKader?: boolean;
  // Altijd zonder beweging (bv. de kleine cel bij de projecten).
  stil?: boolean;
  className?: string;
}

function Laag({ opacity, className, children }: { opacity: number; className?: string; children: ReactNode }) {
  return (
    <g className={className ? `${styles.laag} ${className}` : styles.laag} style={{ opacity }}>
      {children}
    </g>
  );
}

// Schematische dierlijke cel als SVG (docs/redesign/artboards/Cel.dc.html).
// Alle standen zijn dezelfde tekening: alleen camera, zichtbaarheid per laag
// en labels veranderen. Kleuren komen uit CSS-variabelen, dus een themawissel
// bouwt de SVG niet opnieuw op. Server-side staat de cel in de meegegeven
// stand (op de LOWI-pagina: het overzicht).
export default function CelTekening({
  fase,
  bijschrift,
  toonLabels = true,
  toonKader = true,
  stil = false,
  className,
}: CelTekeningProps) {
  const { t } = useLanguage();
  // useId bevat tekens die in url(#…) niet geldig zijn.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [breedte, setBreedte] = useState(520);
  const [gepauzeerd, setGepauzeerd] = useState(false);

  // Labelgrootte en omklappen hangen af van de werkelijke breedte.
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setBreedte(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const o = laagOpaciteit(fase);
  const mitos = mitoTransformen(fase);
  const labels = toonLabels ? labelPlaatsen(fase, breedte, (id) => t(celLabels[id])) : [];
  const lens = lensVoor(fase, breedte);
  const stand = t(celStandTekst[isDeling(fase) ? "deling" : fase]);
  const klein = breedte < 360;
  const id = (naam: string) => `${naam}-${uid}`;

  const rootClassName = [
    styles.cel,
    klein ? styles.klein : null,
    gepauzeerd ? styles.gepauzeerd : null,
    stil ? styles.stil : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={rootClassName}
      style={{ "--cel-wobbel": `url(#${id("wob")})` } as CSSProperties}
      data-fase={fase}
    >
      <svg className={styles.svg} viewBox="0 0 800 800" role="img" aria-label={`${t(bijschrift)} — ${stand}`}>
        <defs>
          <pattern id={id("arcering")} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(38)">
            <path className={styles.arceringLijn} d="M0 0 L0 7" />
          </pattern>
          <filter id={id("wob")} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id={id("cytosol")} cx="45%" cy="42%" r="60%">
            <stop offset="0%" className={styles.cytosolStop0} />
            <stop offset="75%" className={styles.cytosolStop1} />
            <stop offset="100%" className={styles.cytosolStop2} />
          </radialGradient>
          <pattern id={id("stip")} patternUnits="userSpaceOnUse" width="6" height="6">
            <circle className={styles.stip1} cx="1.5" cy="1.5" r="0.9" />
            <circle className={styles.stip2} cx="4.5" cy="4.2" r="0.7" />
          </pattern>
        </defs>

        <g className={styles.camera} style={{ transform: cameraTransform(fase) }}>
          <g className={styles.wobbel}>
            {/* membraan + cytosol */}
            <Laag opacity={o.membraan}>
              <path className={styles.membraan} style={{ fill: `url(#${id("cytosol")})` }} d={T.MEMBRAAN} />
              <path className={styles.membraanLijn} d={T.MEMBRAAN_LIJN} />
            </Laag>
            <Laag opacity={o.membraanOvaal}>
              <path className={styles.membraan} style={{ fill: `url(#${id("cytosol")})` }} d={T.MEMBRAAN_OVAAL} />
            </Laag>
            <Laag opacity={o.membraanInsnoering}>
              <path className={styles.membraan} style={{ fill: `url(#${id("cytosol")})` }} d={T.MEMBRAAN_INSNOERING} />
            </Laag>

            <Laag opacity={o.cytoskelet} className={styles.cytoskelet}>
              {T.CYTOSKELET.map((d) => <path key={d} d={d} />)}
            </Laag>

            {/* vrije ribosomen + drijvende deeltjes */}
            <Laag opacity={o.vrij}>
              <g className={styles.vrijeRibosomen}>
                {T.VRIJE_RIBOSOMEN.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />)}
              </g>
              <g className={styles.deeltjes}>
                {T.DEELTJES.map(([x, y, groep]) => (
                  <circle key={`${x}-${y}`} className={`${styles.deeltje} ${styles[`deeltje${groep}`]}`} cx={x} cy={y} r="1.3" />
                ))}
              </g>
            </Laag>

            <Laag opacity={o.gladER}>
              <g className={styles.gladERRand}>{T.GLAD_ER.map((d) => <path key={d} d={d} />)}</g>
              <g className={styles.gladERBinnen}>{T.GLAD_ER.map((d) => <path key={d} d={d} />)}</g>
            </Laag>

            {/* ruw ER, vast aan het buitenste kernmembraan, met ribosomen */}
            <Laag opacity={o.ruwER}>
              <g className={styles.ruwER}>{T.RUW_ER.map((d) => <path key={d} d={d} />)}</g>
              <path className={styles.ruwERAansluiting} d={T.RUW_ER_AANSLUITING} />
              <g className={styles.ruwERRibosomen}>{T.RUW_ER_RIBOSOMEN.map((d) => <path key={d} d={d} />)}</g>
            </Laag>

            <Laag opacity={o.kern}>
              <path className={styles.kernBuiten} d={T.KERN_BUITEN} />
              <path className={styles.kernBinnen} d={T.KERN_BINNEN} />
              <path style={{ fill: `url(#${id("arcering")})` }} d={T.KERN_ARCERING} />
              <g className={styles.kernporien}>
                {T.KERNPORIEN.map(([x, y, hoek]) => (
                  <rect key={`${x}-${y}`} x="-2.2" y="-6" width="4.4" height="12" rx="2" transform={`translate(${x} ${y}) rotate(${hoek})`} />
                ))}
              </g>
              <g className={styles.chromatine}>{T.CHROMATINE.map((d) => <path key={d} d={d} />)}</g>
              <ellipse {...T.NUCLEOLUS} className={styles.nucleolusRand} style={{ fill: `url(#${id("stip")})` }} />
              <ellipse {...T.NUCLEOLUS} className={styles.nucleolus} />
            </Laag>

            <Laag opacity={o.golgi} className={styles.golgi}>
              {T.GOLGI.map((d) => <path key={d} d={d} />)}
            </Laag>

            {/* blaasjes, lysosomen, transport */}
            <Laag opacity={o.blaasjes} className={styles.blaasjes}>
              <g className={styles.blaasjeER}>
                {T.BLAASJES.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}
              </g>
              <g className={styles.lysosoom}>
                {T.LYSOSOMEN.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}
              </g>
              <g className={styles.geenRand} style={{ fill: `url(#${id("stip")})` }}>
                {T.LYSOSOMEN.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r - 1} />)}
              </g>
              <g className={styles.transport}>
                {T.TRANSPORTBLAASJES.map(([x, y, r], i) => (
                  <circle key={`${x}-${y}`} className={`${styles.transportBlaasje} ${styles[`transport${i}`]}`} cx={x} cy={y} r={r} />
                ))}
              </g>
            </Laag>

            {/* mitochondriën: dezelfde objecten in elke stand */}
            <Laag opacity={o.mito}>
              {mitos.map((transform, i) => (
                <g key={i} className={styles.mito} style={{ transform }}>
                  <path className={styles.mitoBuiten} d={T.MITO_BUITEN} />
                  <path className={styles.mitoBinnen} d={T.MITO_BINNEN} />
                  <g className={styles.cristae}>{T.MITO_CRISTAE.map((d) => <path key={d} d={d} />)}</g>
                </g>
              ))}
            </Laag>

            {/* deling 1: chromosomen in het midden (vereenvoudigd) */}
            <Laag opacity={o.deling1}>
              <g className={styles.spoel}>{T.DELING1_SPOEL.map((d) => <path key={d} d={d} />)}</g>
              <g className={styles.chromosomen}>{T.DELING1_CHROMOSOMEN.map((d) => <path key={d} d={d} />)}</g>
              <g className={styles.pool}>{T.DELING1_POLEN.map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" />)}</g>
            </Laag>

            {/* deling 2: chromosomen naar de polen */}
            <Laag opacity={o.deling2}>
              <g className={styles.spoel}>
                {T.DELING2_SPOEL.map((d) => <path key={d} d={d} />)}
                <path className={styles.evenaar} d={T.DELING2_EVENAAR} />
              </g>
              <g className={styles.chromosomen}>{T.DELING2_CHROMOSOMEN.map((d) => <path key={d} d={d} />)}</g>
              <g className={styles.pool}>{T.DELING2_POLEN.map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" />)}</g>
            </Laag>

            {/* deling 3: twee kernen, insnoering */}
            <Laag opacity={o.deling3}>
              {T.DELING3_KERNEN.map((d) => <path key={d} className={styles.kernBuiten} d={d} />)}
              <g className={styles.chromatineDeling}>{T.DELING3_CHROMATINE.map((d) => <path key={d} d={d} />)}</g>
              <g className={styles.insnoering}>{T.DELING3_INSNOERING.map((d) => <path key={d} d={d} />)}</g>
            </Laag>

            {/* voorzijde van het membraan (buitenaanzicht) */}
            <Laag opacity={o.voorzijde}>
              <path className={styles.voorzijde} d={T.MEMBRAAN} />
              <path style={{ fill: `url(#${id("arcering")})` }} d={T.VOORZIJDE_ARCERING} />
              <path className={styles.voorzijdeLicht} d={T.VOORZIJDE_LICHT} />
            </Laag>
          </g>
        </g>
      </svg>

      {/* labels: echte HTML, verankerd aan de tekening */}
      {labels.map((label) => (
        <div
          key={`${fase}-${label.id}`}
          className={styles.label}
          style={{
            left: `${label.links}%`,
            top: `${label.boven}%`,
            flexDirection: label.naarRechts ? "row" : "row-reverse",
            transform: label.naarRechts ? "translate(-4.5px, -50%)" : "translate(calc(-100% + 4.5px), -50%)",
          }}
        >
          <span className={styles.labelPunt} aria-hidden="true" />
          <svg
            className={styles.labelLijn}
            width={label.lijnBreedte}
            height="18"
            viewBox="0 0 60 18"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
            style={label.naarRechts ? undefined : { transform: "scaleX(-1)" }}
          >
            <path d="M2 12 C 18 4, 36 16, 58 7" />
          </svg>
          <span
            className={styles.labelTekst}
            style={{
              fontSize: label.tekstGrootte,
              ...(label.maxTekstBreedte ? { maxWidth: label.maxTekstBreedte, whiteSpace: "normal" } : {}),
            }}
          >
            {t(celLabels[label.id])}
          </span>
        </div>
      ))}

      {lens === "membraan" ? (
        <div key="lens-membraan" className={`${styles.lens} ${styles.lensRechts}`} aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <g className={styles.lensLijnen}>
              <path d="M14 88 q2 10 -1 18 M20 88 q-2 10 1 18 M34 88 q2 10 -1 18 M40 88 q-2 10 1 18 M54 88 q2 10 -1 18 M60 88 q-2 10 1 18 M126 88 q2 10 -1 18 M132 88 q-2 10 1 18 M146 88 q2 10 -1 18 M152 88 q-2 10 1 18 M166 88 q2 10 -1 18 M172 88 q-2 10 1 18 M186 88 q2 10 -1 18 M192 88 q-2 10 1 18" />
              <path d="M14 132 q2 -10 -1 -18 M20 132 q-2 -10 1 -18 M34 132 q2 -10 -1 -18 M40 132 q-2 -10 1 -18 M54 132 q2 -10 -1 -18 M60 132 q-2 -10 1 -18 M126 132 q2 -10 -1 -18 M132 132 q-2 -10 1 -18 M146 132 q2 -10 -1 -18 M152 132 q-2 -10 1 -18 M166 132 q2 -10 -1 -18 M172 132 q-2 -10 1 -18 M186 132 q2 -10 -1 -18 M192 132 q-2 -10 1 -18" />
            </g>
            <g className={styles.lensKoppen}>
              {[17, 37, 57, 129, 149, 169, 189].flatMap((x) => [
                <circle key={`${x}-b`} cx={x} cy="84" r="6" />,
                <circle key={`${x}-o`} cx={x} cy="136" r="6" />,
              ])}
            </g>
            <path className={styles.lensEiwit} d="M72 70 C70 60 100 56 110 66 C120 76 118 100 116 110 C114 124 124 146 108 154 C94 160 74 152 72 140 C70 124 78 118 76 104 C74 90 74 80 72 70 Z" />
          </svg>
          <span className={styles.lensTitel}>{t(celTekst.lensMembraan)}</span>
          <span className={styles.lensSchaal}>{t(celTekst.lensSchaal)}</span>
        </div>
      ) : null}

      {lens === "ribosomen" ? (
        <div key="lens-ribosomen" className={`${styles.lens} ${styles.lensLinks}`} aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <path className={styles.lensER} d="M0 120 C50 114 150 126 200 118 L200 200 L0 200 Z" />
            <path className={styles.lensERLijn} d="M0 120 C50 114 150 126 200 118" />
            <path className={styles.lensERLijnDun} d="M0 128 C50 122 150 134 200 126" />
            <path className={styles.lensMRNA} d="M8 82 C40 74 70 90 100 80 S160 72 196 84" />
            <g className={styles.lensRibosomen}>
              {[46, 104, 160].map((x, i) => (
                <g key={x}>
                  <ellipse className={styles.lensGroot} cx={x} cy={i === 1 ? 101 : 98} rx="17" ry="13" />
                  <ellipse className={styles.lensKlein} cx={x} cy={i === 1 ? 83 : 80} rx="12" ry="8" />
                </g>
              ))}
            </g>
            <g className={styles.lensKetens}>
              <path d="M46 112 q-6 10 2 18 t0 16" />
              <path d="M104 115 q6 10 -2 18 t2 20 t-4 8" />
              <path d="M160 112 q-4 8 2 16" />
            </g>
          </svg>
          <span className={styles.lensTitel}>{t(celTekst.lensRibosomen)}</span>
          <span className={styles.lensSchaal}>{t(celTekst.lensSchaal)}</span>
        </div>
      ) : null}

      {toonKader ? (
        <>
          <div className={styles.kop} aria-hidden="true">
            <span className={styles.stand}>{stand}</span>
            {isDeling(fase) ? <span className={styles.stempel}>{t(celTekst.vereenvoudigd)}</span> : null}
          </div>
          <p className={styles.bijschrift}>{t(bijschrift)}</p>
          {!klein ? (
            <button
              type="button"
              className={styles.pauze}
              aria-pressed={gepauzeerd}
              onClick={() => setGepauzeerd((huidig) => !huidig)}
            >
              <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                <path d={gepauzeerd ? "M4 2 L12 7 L4 12 Z" : "M4 2 V12 M10 2 V12"} />
              </svg>
              {t(gepauzeerd ? celTekst.hervat : celTekst.pauzeer)}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
