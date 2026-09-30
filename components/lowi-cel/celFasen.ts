// Standen van het SVG-celmodel: camera, zichtbaarheid per laag en labels.
// Waarden letterlijk uit docs/redesign/artboards/Cel.dc.html (renderVals).
// Pure functies, zodat server en browser dezelfde stand renderen.

import type { CelLabelId } from "@/content/lowiCelTekst";
import type { LowiCelHoofdstukId } from "@/content/lowiCellContent";

export const CEL_FASEN = [
  "overzicht",
  "membraan",
  "cytoplasma",
  "kern",
  "ribosomen",
  "mitochondrien",
  "golgi",
  "deling1",
  "deling2",
  "deling3",
] as const;

export type CelFase = (typeof CEL_FASEN)[number];

export function isCelFase(value: unknown): value is CelFase {
  return typeof value === "string" && (CEL_FASEN as readonly string[]).includes(value);
}

export function isDeling(fase: CelFase): fase is "deling1" | "deling2" | "deling3" {
  return fase.startsWith("deling");
}

// Stand per hoofdstuk; de deling heeft daarna nog twee deelstanden.
export const HOOFDSTUK_FASE: Record<LowiCelHoofdstukId, CelFase> = {
  grens: "membraan",
  werkvloer: "cytoplasma",
  code: "kern",
  bouwen: "ribosomen",
  brandstof: "mitochondrien",
  verfijnen: "golgi",
  groei: "deling1",
};

// ===== Camera: brandpunt (x, y) in de tekening en vergroting =====

const CAMERA: Record<CelFase, readonly [x: number, y: number, schaal: number]> = {
  overzicht: [400, 405, 1],
  membraan: [150, 420, 1.9],
  cytoplasma: [300, 545, 1.45],
  kern: [365, 392, 1.95],
  ribosomen: [505, 470, 2.5],
  mitochondrien: [585, 555, 3.1],
  golgi: [565, 245, 2.3],
  deling1: [400, 405, 1],
  deling2: [400, 405, 1],
  deling3: [400, 405, 1],
};

// Brandpunt naar het midden van de viewBox (800 × 800), dan vergroten.
export function cameraTransform(fase: CelFase): string {
  const [x, y, schaal] = CAMERA[fase];
  return `translate(400px, 400px) scale(${schaal}) translate(${-x}px, ${-y}px)`;
}

// ===== Zichtbaarheid per laag =====

export interface LaagOpaciteit {
  membraan: number; // standaardvorm
  membraanOvaal: number; // deling 2
  membraanInsnoering: number; // deling 3
  cytoskelet: number;
  vrij: number; // vrije ribosomen en deeltjes
  gladER: number;
  ruwER: number;
  kern: number;
  golgi: number;
  blaasjes: number;
  mito: number;
  deling1: number;
  deling2: number;
  deling3: number;
  voorzijde: number; // buitenaanzicht van het membraan
}

const GEDIMD = 0.3;

export function laagOpaciteit(fase: CelFase): LaagOpaciteit {
  const o: LaagOpaciteit = {
    membraan: 1,
    membraanOvaal: 0,
    membraanInsnoering: 0,
    cytoskelet: 1,
    vrij: 1,
    gladER: 1,
    ruwER: 1,
    kern: 1,
    golgi: 1,
    blaasjes: 1,
    mito: 1,
    deling1: 0,
    deling2: 0,
    deling3: 0,
    voorzijde: 0,
  };

  switch (fase) {
    case "overzicht":
      o.voorzijde = 0.5;
      break;
    case "membraan":
      Object.assign(o, {
        voorzijde: 0.14, cytoskelet: 0.5, vrij: 0.6, gladER: 0.5, ruwER: 0.5,
        kern: 0.5, golgi: 0.5, blaasjes: 0.6, mito: 0.6,
      });
      break;
    case "cytoplasma":
      Object.assign(o, { kern: 0.35, ruwER: 0.45, golgi: 0.45, mito: 0.8 });
      break;
    case "kern":
      Object.assign(o, {
        cytoskelet: GEDIMD, vrij: GEDIMD, gladER: GEDIMD, golgi: GEDIMD,
        blaasjes: GEDIMD, mito: GEDIMD, ruwER: 0.8,
      });
      break;
    case "ribosomen":
      Object.assign(o, {
        cytoskelet: GEDIMD, vrij: 0.8, gladER: GEDIMD, kern: 0.55,
        golgi: GEDIMD, blaasjes: GEDIMD, mito: GEDIMD,
      });
      break;
    case "mitochondrien":
      Object.assign(o, {
        cytoskelet: GEDIMD, vrij: GEDIMD, gladER: GEDIMD, ruwER: GEDIMD,
        kern: GEDIMD, golgi: GEDIMD, blaasjes: GEDIMD,
      });
      break;
    case "golgi":
      Object.assign(o, {
        cytoskelet: GEDIMD, vrij: GEDIMD, gladER: GEDIMD, ruwER: 0.6,
        kern: GEDIMD, mito: GEDIMD,
      });
      break;
    case "deling1":
    case "deling2":
    case "deling3":
      // ER, golgi en kern maken tijdelijk plaats voor vereenvoudigde mitose-lagen;
      // de mitochondriën blijven dezelfde objecten.
      Object.assign(o, {
        gladER: 0, ruwER: 0, kern: 0, golgi: 0, vrij: 0, cytoskelet: 0.25,
        blaasjes: fase === "deling3" ? 0 : 0.6,
        membraan: fase === "deling1" ? 1 : 0,
        membraanOvaal: fase === "deling2" ? 1 : 0,
        membraanInsnoering: fase === "deling3" ? 1 : 0,
        deling1: fase === "deling1" ? 1 : 0,
        deling2: fase === "deling2" ? 1 : 0,
        deling3: fase === "deling3" ? 1 : 0,
      });
      break;
  }

  return o;
}

// ===== Mitochondriën: vijf keer hetzelfde object, [vroeg, laat in de deling] =====

const MITO_PLAATSEN: readonly (readonly [vroeg: string, laat: string])[] = [
  ["translate(215px, 250px) rotate(30deg) scale(1.1, 1.05)", "translate(215px, 250px) rotate(30deg) scale(1.1, 1.05)"],
  ["translate(585px, 555px) rotate(-20deg) scale(1.2, 1.15)", "translate(585px, 555px) rotate(-20deg) scale(1.2, 1.15)"],
  ["translate(430px, 640px) rotate(10deg) scale(0.95)", "translate(622px, 468px) rotate(-35deg) scale(0.95)"],
  ["translate(170px, 470px) rotate(80deg)", "translate(170px, 470px) rotate(80deg)"],
  ["translate(655px, 380px) rotate(75deg) scale(0.86)", "translate(655px, 380px) rotate(75deg) scale(0.86)"],
];

// In deling 2 en 3 verhuist één mitochondrion naar de rechterhelft.
export function mitoTransformen(fase: CelFase): string[] {
  const laat = fase === "deling2" || fase === "deling3";
  return MITO_PLAATSEN.map(([vroeg, later]) => (laat ? later : vroeg));
}

// ===== Labels: HTML, verankerd aan een punt in de tekening =====

interface LabelAnker {
  id: CelLabelId;
  x: number;
  y: number;
  kant: "r" | "l"; // lijn naar rechts of links van het ankerpunt
  primair: boolean;
}

const LABEL_ANKERS: Record<CelFase, readonly LabelAnker[]> = {
  overzicht: [],
  membraan: [{ id: "mem", x: 79, y: 440, kant: "r", primair: true }],
  cytoplasma: [
    { id: "cytosol", x: 392, y: 606, kant: "r", primair: true },
    { id: "ser", x: 236, y: 622, kant: "l", primair: false },
    { id: "ves", x: 140, y: 440, kant: "r", primair: false },
  ],
  kern: [
    { id: "nuc", x: 400, y: 275, kant: "r", primair: true },
    { id: "nucl", x: 392, y: 362, kant: "r", primair: false },
    { id: "chrom", x: 312, y: 402, kant: "l", primair: false },
  ],
  ribosomen: [{ id: "rer", x: 527, y: 440, kant: "r", primair: true }],
  mitochondrien: [
    { id: "mito", x: 600, y: 530, kant: "r", primair: true },
    { id: "cris", x: 578, y: 560, kant: "l", primair: false },
  ],
  golgi: [
    { id: "golgi", x: 588, y: 262, kant: "r", primair: true },
    { id: "tves", x: 607, y: 221, kant: "l", primair: false },
  ],
  deling1: [{ id: "d1", x: 404, y: 336, kant: "r", primair: true }],
  deling2: [{ id: "d2", x: 290, y: 385, kant: "l", primair: true }],
  deling3: [
    { id: "d3", x: 555, y: 336, kant: "r", primair: true },
    { id: "furrow", x: 400, y: 320, kant: "l", primair: false },
  ],
};

export interface LabelPlaats {
  id: CelLabelId;
  links: number; // % van de breedte
  boven: number; // % van de hoogte
  naarRechts: boolean;
  lijnBreedte: number; // px
  tekstGrootte: number; // px
  // Gezet als het label nergens op één regel past: de tekst loopt dan om.
  maxTekstBreedte?: number; // px
}

// Geschatte breedte van een label: tekst + kaderpadding + lijn + punt.
export function geschatteLabelBreedte(tekst: string, tekstGrootte: number, lijnBreedte: number): number {
  return tekst.length * tekstGrootte * 0.56 + 24 + lijnBreedte + 9;
}

const RAND = 4; // px vrij aan de rand van de cel
const PUNT = 9; // px, het ankerpunt
const OVERLAP = 4.5; // px, het punt staat half over het anker

// Positie na de camera, begrensd tot binnen het beeld. Het punt blijft op het
// organel; alleen de kant en de breedte van het label passen zich aan:
// 1. past het niet aan de gekozen kant, dan klapt het om (zoals Cel.dc.html);
// 2. past het aan geen enkele kant, dan de kant met de meeste ruimte;
// 3. past het daar nog niet, dan een korte lijn en tekst die omloopt.
// Zo vallen labels ook op een kleine cel (320 px scherm) niet buiten beeld.
export function labelPlaatsen(
  fase: CelFase,
  breedte: number,
  tekstVan: (id: CelLabelId) => string,
): LabelPlaats[] {
  const [cx, cy, schaal] = CAMERA[fase];
  const klein = breedte < 360;
  const middel = breedte < 480;

  return LABEL_ANKERS[fase].map((anker) => {
    const sx = 400 + (anker.x - cx) * schaal;
    const sy = 400 + (anker.y - cy) * schaal;
    const links = Math.max(3, Math.min(97, sx / 8));
    const boven = Math.max(6, Math.min(92, sy / 8));
    const tekstGrootte = klein ? 11 : anker.primair ? (middel ? 13 : 15) : middel ? 12 : 13;
    let lijnBreedte = anker.primair ? (klein ? 26 : middel ? 30 : 48) : 10;
    const tekst = tekstVan(anker.id);
    const px = (links / 100) * breedte;
    const ruimteRechts = breedte - RAND - (px - OVERLAP);
    const ruimteLinks = px + OVERLAP - RAND;
    const past = (ruimte: number) => geschatteLabelBreedte(tekst, tekstGrootte, lijnBreedte) <= ruimte;

    let naarRechts = anker.kant === "r";
    if (!past(naarRechts ? ruimteRechts : ruimteLinks)) {
      naarRechts = past(naarRechts ? ruimteLinks : ruimteRechts)
        ? !naarRechts
        : ruimteRechts >= ruimteLinks;
    }

    const ruimte = naarRechts ? ruimteRechts : ruimteLinks;
    let maxTekstBreedte: number | undefined;
    if (!past(ruimte)) {
      lijnBreedte = 10;
      maxTekstBreedte = Math.max(56, Math.floor(ruimte - PUNT - lijnBreedte));
    }

    return { id: anker.id, links, boven, naarRechts, lijnBreedte, tekstGrootte, maxTekstBreedte };
  });
}

// Detailvergroting, alleen op een cel die groot genoeg is.
export function lensVoor(fase: CelFase, breedte: number): "membraan" | "ribosomen" | null {
  if (breedte < 360) return null;
  if (fase === "membraan") return "membraan";
  if (fase === "ribosomen") return "ribosomen";
  return null;
}
