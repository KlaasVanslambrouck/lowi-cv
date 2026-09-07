Volledige bronbestanden van Fase 3, na B1–B6.

**celInstellingen.ts**

```ts
// Alle visuele afstemwaarden bij elkaar. 0/1, pi en indexberekeningen in de
// geometrie zijn wiskundige grenzen; onderstaande waarden bepalen het ontwerp.
export const celInstellingen = {
  demping: 6, // Snelheid waarmee camera, vervorming en kleuren hun doel volgen.
  camera: {
    fov: 50, // Verticale beeldhoek; beide dochtercellen passen binnen het canvas.
    near: 0.03, // Dichtstbijzijnde zichtbare geometrie.
    far: 40, // Verste zichtbare geometrie.
    dpr: [1, 2] as const, // Begrensde scherpte en GPU-belasting.
  },
  licht: {
    omgeving: 0.9, // Algemene zichtbaarheid van organellen.
    hoofd: 1.7, // Sterkte van het hoofdlicht.
    vulling: 0.7, // Verzachting van schaduwzijden.
    hoofdPositie: [3, 4, 5] as const, // Richting van het hoofdlicht.
    vulPositie: [-3, -1, 2] as const, // Richting van het vullicht.
  },
  materiaal: {
    ruwheid: 0.95, // Hoge waarde voorkomt glanzende productrender-look.
    neutraalTekstAandeel: 0.3, // Mengverhouding muted/text-soft voor inactieve delen.
    emissieBasis: 0.025, // Minimale zelfverlichting van organellen.
    emissieActief: 0.16, // Extra zelfverlichting bij een highlight.
    opacityBasis: 0.7, // Vermenigvuldiger voor inactieve transparante delen.
    opacityActief: 0.5, // Extra opacity bij een highlight.
  },
  schil: {
    breedteSegmenten: 64, // Rondingsdetail; veelvoud van 4 voor de delingsnaden.
    hoogteSegmenten: 40, // Detail langs de doorsnede.
    membraanStraal: 1, // Wereldschaal: celstraal = 1.
    cytoplasmaStraal: 0.95, // Afstand van cytoplasma tot buitenwand.
    kernStraal: 0.32, // Ruimte voor compact DNA.
    membraanOpacity: 0.2, // Zichtbaarheid buitenwand.
    cytoplasmaOpacity: 0.045, // Subtiele binnenvulling.
    kernOpacity: 0.22, // Transparantie rond het DNA.
    opening: 1.32, // Maximale openingshoek in radialen.
    kernOpening: 0.8, // Kleinere opening van het kernmembraan.
    onregelmatigheid: [0.025, 0.018] as const, // Afwijking van een perfecte bol.
    golfFrequenties: [3, 5] as const, // Aantal zachte golven in het membraan.
  },
  ribosomen: {
    aantal: 120, // Aantal bolletjes in één InstancedMesh.
    straal: 0.022, // Grootte per ribosoom.
    segmenten: [8, 6] as const, // Lage geometriekosten per instantie.
    binnenStraal: 0.43, // Vrije ruimte rond de kern.
    spreiding: 0.43, // Radiale spreiding buiten die ruimte.
    zaad: 37, // Deterministische verdeling; geen willekeur per render.
  },
  mitochondrien: {
    // Twee mitochondriën: [x, y, z, rotatie rond z]. Voeg hier exemplaren toe.
    plaatsingen: [[-0.45, -0.12, 0.22, -0.45], [0.38, 0.43, -0.1, 0.6]] as const,
    schaal: [0.24, 0.12, 0.1] as const, // Langwerpige buitenvorm.
    segmenten: [24, 16] as const, // Rondingsdetail buitenvorm.
    opacity: 0.38, // Doorzicht naar interne plooien.
    plooien: 6, // Aantal zichtbare cristae per mitochondrion.
    plooiBereik: 0.16, // Spreiding van de plooien over de lengte.
    plooiHoogte: 0.075, // Hoogte van elke interne plooi.
    plooiBocht: 0.025, // Zijwaartse bocht in iedere plooi.
    plooiDiepte: [0.02, 0.07] as const, // Achterkant en voorste rand van de plooi.
    plooiStraal: 0.009, // Dikte van de plooilijn.
    plooiSegmenten: [14, 5] as const, // Lengte- en omtrekdetail van de buis.
  },
  golgi: {
    schijven: 5, // Aantal gestapelde schijven.
    profiel: [[0, 0.03], [0.07, 0.005], [0.15, 0], [0.2, 0.04]] as const, // Gebogen schijfprofiel.
    segmenten: 28, // Rondingsdetail van de schijven.
    afstand: 0.055, // Afstand tussen schijven.
    verloop: 0.05, // Verkleining per hogere schijf.
    afplatting: 0.6, // Hoogte/diepte ten opzichte van de breedte.
    rotatie: [0.45, 0, -0.3] as const, // Zichtbaarheid van de stapeling.
    positie: [0.43, -0.38, 0.05] as const, // Ligging binnen de cel.
  },
  dna: {
    segmenten: 192, // Detail langs de streng; veelvoud van 4 voor de delingsnaden.
    radiaal: 8, // Omtrekdetail van de streng.
    controlepunten: 96, // Detail van de veranderende CatmullRom-curve.
    basenparen: 28, // Aantal dwarsverbindingen.
    windingen: 6, // Aantal omwentelingen in de dubbele helix.
    compacteStraal: 0.15, // Straal van de opgerolde hoofdlus.
    compacteStrengAfstand: 0.035, // Afstand van strengen rond die lus.
    compacteHoogte: 0.08, // Hoogteverschil over de compacte lus.
    ontvouwenStraal: 0.105, // Breedte van de ontvouwen helix.
    ontvouwenHoogte: 1.35, // Lengte van de ontvouwen helix.
    strengDikte: 0.012, // Dikte van de twee strengen.
    basisDikte: 0.006, // Dikte van dwarsverbindingen.
    normaalGrens: 0.95, // Alternatieve as voorkomt ongeldige buisnormalen.
    delingsStraal: 0.22, // Verdeling van compact DNA over beide dochterkernen.
    emissieBasis: 0.06, // Leesbaarheid van inactief DNA.
    emissieActief: 0.24, // Extra accent bij het kernhoofdstuk.
  },
  deling: {
    ruimte: 0.08, // Afstand van de dochterlobben tot het midden.
    lengte: 1.6, // Lengte van de gedeelde buitenvorm.
    kernRuimte: 0.64, // Positie van de binnenzijde van dochterkernen.
    kernLengte: 0.48, // Lengte van iedere dochterkern.
    kernRadiaal: 1.5, // Radiale vervorming van de kern.
    organelVerkleining: 0.2, // Verkleining van organellen tijdens deling.
  },
  geometrieDrempel: 0.00001, // Sla onzichtbaar kleine geometrie-updates over.
} as const;

export type CelInstellingen = typeof celInstellingen;
```

**celPalet.ts**

```ts
// Synchroniseer handmatig met app/globals.css: iedere tokenwijziging daar
// moet hier voor beide thema's worden meegenomen. WebGL leest geen CSS-variabelen.
export interface CelPalet {
  readonly "--cv-copper": string;
  readonly "--cv-blue": string;
  readonly "--cv-violet": string;
  readonly "--cv-bg": string;
  readonly "--cv-text": string;
  readonly "--cv-text-soft": string;
  readonly "--cv-muted": string;
}

export const celPaletDonker = {
  "--cv-copper": "#c98245",
  "--cv-blue": "#669cff",
  "--cv-violet": "#9878ff",
  "--cv-bg": "#101118",
  "--cv-text": "#f1ece2",
  "--cv-text-soft": "#d8d2c8",
  "--cv-muted": "#9995a0",
} as const satisfies CelPalet;

export const celPaletLicht = {
  "--cv-copper": "#a95f2c",
  "--cv-blue": "#2864d7",
  "--cv-violet": "#6945d6",
  "--cv-bg": "#f3efe7",
  "--cv-text": "#171820",
  "--cv-text-soft": "#3e3d43",
  "--cv-muted": "#6f6a70",
} as const satisfies CelPalet;
```

**useCelInterpolatie.ts**

```ts
"use client";

import { useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Vector3 } from "three";
import {
  lowiCelBeginStaat,
  lowiCelHoofdstukken,
  type OrganelId,
  type VisueleStaat,
} from "@/content/lowiCellContent";
import { celPaletLicht, type CelPalet } from "./celPalet";
import { celInstellingen } from "./celInstellingen";

export const organelIds: readonly OrganelId[] = [
  "membraan", "cytoplasma", "kern", "ribosoom", "mitochondrion", "golgi", "celdeling",
];

export interface CelStaat {
  lichtHoofd: Color;
  lichtVulling: Color;
  cameraPositie: Vector3;
  kijkNaar: Vector3;
  doorsnede: number;
  dnaOntvouwing: number;
  intensiteit: Record<OrganelId, number>;
  kleuren: Record<OrganelId, Color>;
}

export function maakCelStaat(palet: CelPalet): CelStaat {
  const kleur = (): Color => new Color(palet["--cv-muted"]).lerp(new Color(palet["--cv-text-soft"]), celInstellingen.materiaal.neutraalTekstAandeel);
  const licht = palet["--cv-bg"] === celPaletLicht["--cv-bg"];
  return {
    lichtHoofd: new Color(palet[licht ? "--cv-bg" : "--cv-text"]),
    lichtVulling: new Color(palet[licht ? "--cv-bg" : "--cv-text-soft"]),
    cameraPositie: new Vector3(...lowiCelBeginStaat.cameraPositie),
    kijkNaar: new Vector3(...lowiCelBeginStaat.kijkNaar),
    doorsnede: lowiCelBeginStaat.doorsnede,
    dnaOntvouwing: lowiCelBeginStaat.dnaOntvouwing,
    intensiteit: { membraan: 0, cytoplasma: 0, kern: 0, ribosoom: 0, mitochondrion: 0, golgi: 0, celdeling: 0 },
    kleuren: {
      membraan: kleur(), cytoplasma: kleur(), kern: kleur(), ribosoom: kleur(),
      mitochondrion: kleur(), golgi: kleur(), celdeling: kleur(),
    },
  };
}

// Herbruikbare werkruimte; geen nieuwe Vector3/Color-objecten per frame.
export function maakCelDoelBerekening(): (p: number, palet: CelPalet, doel: CelStaat) => void {
  const vanCamera = new Vector3();
  const naarCamera = new Vector3();
  const vanKijkpunt = new Vector3();
  const naarKijkpunt = new Vector3();
  const neutraal = new Color();
  const zacht = new Color();
  const vanAccent = new Color();
  const naarAccent = new Color();
  const vanKleur = new Color();
  const naarKleur = new Color();

  return (p, palet, doel): void => {
    const aantal = lowiCelHoofdstukken.length;
    const positie = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0)) * aantal;
    const index = Math.min(aantal - 1, Math.floor(positie));
    const lokaal = positie - index;
    const t = lokaal * lokaal * (3 - 2 * lokaal); // smoothstep(0, 1, lokaal)
    const hoofdstuk = lowiCelHoofdstukken[index];
    const vorige = index > 0 ? lowiCelHoofdstukken[index - 1] : null;
    const van: VisueleStaat = vorige?.visueel ?? lowiCelBeginStaat;
    const naar: VisueleStaat = hoofdstuk.visueel;

    doel.cameraPositie.lerpVectors(vanCamera.fromArray(van.cameraPositie), naarCamera.fromArray(naar.cameraPositie), t);
    doel.kijkNaar.lerpVectors(vanKijkpunt.fromArray(van.kijkNaar), naarKijkpunt.fromArray(naar.kijkNaar), t);
    doel.doorsnede = van.doorsnede + (naar.doorsnede - van.doorsnede) * t;
    doel.dnaOntvouwing = van.dnaOntvouwing + (naar.dnaOntvouwing - van.dnaOntvouwing) * t;

    const licht = palet["--cv-bg"] === celPaletLicht["--cv-bg"];
    doel.lichtHoofd.set(palet[licht ? "--cv-bg" : "--cv-text"]);
    doel.lichtVulling.set(palet[licht ? "--cv-bg" : "--cv-text-soft"]);
    neutraal.set(palet["--cv-muted"]).lerp(zacht.set(palet["--cv-text-soft"]), celInstellingen.materiaal.neutraalTekstAandeel);
    vanAccent.set(palet[vorige?.accentToken ?? hoofdstuk.accentToken]);
    naarAccent.set(palet[hoofdstuk.accentToken]);
    for (const id of organelIds) {
      const vanIntensiteit = van.actieveOrganellen.includes(id) ? 1 : 0;
      const naarIntensiteit = naar.actieveOrganellen.includes(id) ? 1 : 0;
      doel.intensiteit[id] = vanIntensiteit + (naarIntensiteit - vanIntensiteit) * t;
      vanKleur.copy(neutraal).lerp(vanAccent, vanIntensiteit);
      naarKleur.copy(neutraal).lerp(naarAccent, naarIntensiteit);
      doel.kleuren[id].lerpColors(vanKleur, naarKleur, t);
    }
  };
}

export function dempCelStaat(staat: CelStaat, doel: CelStaat, delta: number): void {
  const factor = 1 - Math.exp(-celInstellingen.demping * Math.max(0, delta));
  staat.lichtHoofd.lerp(doel.lichtHoofd, factor);
  staat.lichtVulling.lerp(doel.lichtVulling, factor);
  staat.cameraPositie.lerp(doel.cameraPositie, factor);
  staat.kijkNaar.lerp(doel.kijkNaar, factor);
  staat.doorsnede += (doel.doorsnede - staat.doorsnede) * factor;
  staat.dnaOntvouwing += (doel.dnaOntvouwing - staat.dnaOntvouwing) * factor;
  for (const id of organelIds) {
    staat.intensiteit[id] += (doel.intensiteit[id] - staat.intensiteit[id]) * factor;
    staat.kleuren[id].lerp(doel.kleuren[id], factor);
  }
}

export function useCelInterpolatie(
  voortgangRef: MutableRefObject<number>,
  palet: CelPalet,
): CelStaat {
  // Alleen de eerste render initialiseert kleuren. Themawissels behouden de
  // bestaande staat en veranderen uitsluitend het doel voor de demping.
  const [werk] = useState(() => ({
    staat: maakCelStaat(palet), doel: maakCelStaat(palet), bereken: maakCelDoelBerekening(),
  }));

  // Eerst de exacte doelstaat; daarna framerate-onafhankelijke demping.
  // Prioriteit -2 laat model, DNA en camera dezelfde bijgewerkte staat lezen.
  useFrame((_, delta) => {
    werk.bereken(voortgangRef.current, palet, werk.doel);
    dempCelStaat(werk.staat, werk.doel, delta);
  }, -2);

  return werk.staat;
}
```
