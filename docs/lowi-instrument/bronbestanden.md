# Volledige bronbestanden

## celPalet.ts

```typescript
// Vast instrumentpalet, onafhankelijk van het paginathema.
// Hoogstens twee accenten tegelijk fel: kern/DNA en mitochondriale binnenkant.
// Alles daarbuiten blijft medium of ontzadigd warm, ook bij een highlight.
export const celPalet = {
  achtergrond: "#05060a",
  weefsel: "#c08a63",
  amber: "#e0913c",
  karmijn: "#9e3341",
  violet: "#6f6ce0",
} as const;

```

## useCelInterpolatie.ts

```typescript
"use client";

import { useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Vector3 } from "three";
import { lowiCelBeginStaat, lowiCelHoofdstukken, type OrganelId, type VisueleStaat } from "@/content/lowiCellContent";
import { celPalet } from "./celPalet";
import { celInstellingen } from "./celInstellingen";

export const organelIds: readonly OrganelId[] = ["membraan", "cytoplasma", "kern", "ribosoom", "mitochondrion", "golgi", "celdeling"];
export interface CelStaat {
  cameraPositie: Vector3;
  kijkNaar: Vector3;
  focusPunt: Vector3;
  focusBereik: number;
  fov: number;
  doorsnede: number;
  dnaOntvouwing: number;
  intensiteit: Record<OrganelId, number>;
  kleuren: Record<OrganelId, Color>;
}

export function maakCelStaat(): CelStaat {
  return {
    cameraPositie: new Vector3(...lowiCelBeginStaat.cameraPositie),
    kijkNaar: new Vector3(...lowiCelBeginStaat.kijkNaar),
    focusPunt: new Vector3(...lowiCelBeginStaat.kijkNaar),
    focusBereik: celInstellingen.focusBereiken.membraan,
    fov: lowiCelBeginStaat.fov,
    doorsnede: lowiCelBeginStaat.doorsnede, dnaOntvouwing: lowiCelBeginStaat.dnaOntvouwing,
    intensiteit: { membraan: 0, cytoplasma: 0, kern: 0, ribosoom: 0, mitochondrion: 0, golgi: 0, celdeling: 0 },
    kleuren: {
      membraan: new Color(celPalet.weefsel), cytoplasma: new Color(celPalet.weefsel),
      kern: new Color(celPalet.violet), ribosoom: new Color(celPalet.weefsel),
      mitochondrion: new Color(celPalet.amber), golgi: new Color(celPalet.weefsel), celdeling: new Color(celPalet.weefsel),
    },
  };
}

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

// Dezelfde twee lagen: exacte smoothstep-doelstaat, daarna demping met delta.
// Alleen hoofdstuk 2 heeft een tussenpunt: eerst onthullen, dan naar binnen.
export function maakCelDoelBerekening(): (p: number, doel: CelStaat) => void {
  const vanCamera = new Vector3(), naarCamera = new Vector3();
  const vanKijkpunt = new Vector3(), naarKijkpunt = new Vector3();
  const vanFocus = new Vector3(), naarFocus = new Vector3();
  const onthulling = new Vector3(...celInstellingen.camera.onthulling);
  const onthullingKijkpunt = new Vector3();
  function bereik(staat: VisueleStaat): number {
    if (!staat.actieveOrganellen.length) return celInstellingen.focusBereiken.membraan;
    let som = 0;
    for (const id of staat.actieveOrganellen) som += celInstellingen.focusBereiken[id];
    return som / staat.actieveOrganellen.length;
  }
  function focus(staat: VisueleStaat, punt: Vector3): void {
    const actief = staat.actieveOrganellen;
    if (!actief.length) { punt.fromArray(staat.kijkNaar); return; }
    punt.set(0, 0, 0);
    for (const id of actief) {
      const waarde = celInstellingen.focus[id];
      punt.x += waarde[0]; punt.y += waarde[1]; punt.z += waarde[2];
    }
    punt.multiplyScalar(1 / actief.length);
  }
  return (p, doel): void => {
    const aantal = lowiCelHoofdstukken.length;
    const positie = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0)) * aantal;
    const index = Math.min(aantal - 1, Math.floor(positie));
    const lokaal = positie - index;
    const t = smoothstep(lokaal);
    const van: VisueleStaat = index > 0 ? lowiCelHoofdstukken[index - 1].visueel : lowiCelBeginStaat;
    const naar: VisueleStaat = lowiCelHoofdstukken[index].visueel;
    vanCamera.fromArray(van.cameraPositie); naarCamera.fromArray(naar.cameraPositie);
    doel.cameraPositie.lerpVectors(vanCamera, naarCamera, t);
    doel.kijkNaar.lerpVectors(vanKijkpunt.fromArray(van.kijkNaar), naarKijkpunt.fromArray(naar.kijkNaar), t);
    doel.fov = van.fov + (naar.fov - van.fov) * t;
    if (index === 1) {
      const grens = celInstellingen.camera.onthullingMoment;
      if (lokaal < grens) {
        const reis = smoothstep(lokaal / grens);
        doel.cameraPositie.lerpVectors(vanCamera, onthulling, reis);
        doel.kijkNaar.lerpVectors(vanKijkpunt, onthullingKijkpunt, reis);
        doel.fov = van.fov + (celInstellingen.camera.onthullingFov - van.fov) * reis;
      } else {
        const reis = smoothstep((lokaal - grens) / (1 - grens));
        doel.cameraPositie.lerpVectors(onthulling, naarCamera, reis);
        doel.kijkNaar.lerpVectors(onthullingKijkpunt, naarKijkpunt, reis);
        doel.fov = celInstellingen.camera.onthullingFov + (naar.fov - celInstellingen.camera.onthullingFov) * reis;
      }
    }
    focus(van, vanFocus); focus(naar, naarFocus);
    doel.focusPunt.lerpVectors(vanFocus, naarFocus, t);
    doel.focusBereik = bereik(van) + (bereik(naar) - bereik(van)) * t;
    doel.doorsnede = van.doorsnede + (naar.doorsnede - van.doorsnede) * t;
    doel.dnaOntvouwing = van.dnaOntvouwing + (naar.dnaOntvouwing - van.dnaOntvouwing) * t;
    for (const id of organelIds) {
      const a = van.actieveOrganellen.includes(id) ? 1 : 0;
      const b = naar.actieveOrganellen.includes(id) ? 1 : 0;
      doel.intensiteit[id] = a + (b - a) * t;
    }
  };
}

export function dempCelStaat(staat: CelStaat, doel: CelStaat, delta: number): void {
  const factor = 1 - Math.exp(-celInstellingen.demping * Math.max(0, delta));
  staat.cameraPositie.lerp(doel.cameraPositie, factor);
  staat.kijkNaar.lerp(doel.kijkNaar, factor);
  staat.focusPunt.lerp(doel.focusPunt, factor);
  staat.focusBereik += (doel.focusBereik - staat.focusBereik) * factor;
  staat.fov += (doel.fov - staat.fov) * factor;
  staat.doorsnede += (doel.doorsnede - staat.doorsnede) * factor;
  staat.dnaOntvouwing += (doel.dnaOntvouwing - staat.dnaOntvouwing) * factor;
  for (const id of organelIds) staat.intensiteit[id] += (doel.intensiteit[id] - staat.intensiteit[id]) * factor;
}

export function useCelInterpolatie(voortgangRef: MutableRefObject<number>): CelStaat {
  const [werk] = useState(() => ({ staat: maakCelStaat(), doel: maakCelStaat(), bereken: maakCelDoelBerekening() }));
  useFrame((_, delta) => {
    werk.bereken(voortgangRef.current, werk.doel);
    dempCelStaat(werk.staat, werk.doel, delta);
  }, -2);
  return werk.staat;
}

```

## celInstellingen.ts

```typescript
// Alle afstemwaarden van het instrument. Camera-eindpunten/FOV staan in content.
export const celInstellingen = {
  demping: 10, // Tijdconstante 100 ms, ook tijdens de grote cameraverplaatsingen.
  camera: {
    near: 0.008, far: 40, // Macrodetail en een rustig totaalbeeld.
    dpr: [1, 1.25] as const, // GPU-kosten begrenzen.
    drift: 0.008, driftSnelheid: 0.17, // Trage beweging bij stilstaande scroll.
    onderwerpRechts: 0.17, // Ruimte voor tekst links van het focuspunt.
    onthulling: [0.25, 0.28, 3.8] as const, // Tussenpunt vóór de vlucht naar binnen.
    onthullingFov: 45, onthullingMoment: 0.44, // Rustig totaalbeeld binnen hoofdstuk 2.
  },
  licht: {
    omgeving: 0.35, hoofd: 2.4, vulling: 0.45, // Sober zijlicht plus interne fluorescentie.
    hoofdPositie: [-2, 3, 2] as const, vulPositie: [2, -1, -1] as const,
  },
  materiaal: {
    ruwheid: 0.82, ruis: 0.0012, // Microreliëf zonder ribosomen/strengen te vervormen tot klompen.
    emissieBasis: 0.12, // Scherpte stuurt aandacht; dimmen is subtiel.
  },
  instrument: {
    icoDetail: 18, // Voldoende contourdetail voor de extreme macro-opname.
    membraanSchaal: [1.1, 0.91, 1] as const, // Geen perfecte bol.
    adem: 0.004, brown: 0.002, // Microscopische, laagfrequente beweging.
    blaasjes: 180, // Kleine volumes op verschillende dieptes.
    filamenten: 46, filamentDikte: 0.00045, // Fijn cytoskelet.
    deeltjes: 4200, // Parallax, ook vlak voor de macrolens.
    fogDichtheid: 0.48, fogWarmte: 0.012, // Zeer donkere, warme exponentiële fog.
    billboards: 4, mediumOpacity: 0.055, // Gelaagd vloeistofmedium, zonder raymarching.
  },
  ribosomen: {
    aantal: 2600, straal: 0.006, // Eén InstancedMesh; kleine korrels.
    zone: [0.4, 0.2, 0.36] as const, // Dichte zone voor hoofdstuk bouwen.
  },
  mitochondrien: {
    plaatsingen: [[-0.45, -0.12, 0.22, -0.45], [0.38, 0.43, -0.1, 0.6]] as const,
    schaal: [0.24, 0.12, 0.1] as const, // Langwerpige buitenvorm.
    opacity: 0.76, // De relatief dichte wand laat de interne emissie doorschemeren.
    plooien: 9, plooiBereik: 0.17, // Detail in de macro-opname.
    plooiStraal: 0.006, // Fijne onregelmatige cristae.
  },
  golgi: {
    schijven: 7, afstand: 0.042, // Meer dunne, leesbare lamellen.
    profiel: [[0, 0.025], [0.07, 0.005], [0.15, 0], [0.2, 0.04]] as const,
    rotatie: [0.45, 0, -0.3] as const, positie: [0.43, -0.38, 0.05] as const,
  },
  dna: {
    segmenten: 192, radiaal: 8, controlepunten: 96, // Veelvoud van 4 voor delingsnaden.
    basenparen: 28, windingen: 6, // Dubbele helix met dwarsverbindingen.
    compacteStraal: 0.15, compacteStrengAfstand: 0.035, compacteHoogte: 0.08,
    ontvouwenStraal: 0.105, ontvouwenHoogte: 0.72, // Past in het macrobeeld van de kern.
    strengDikte: 0.008, basisDikte: 0.004, // Fijnere strengen, geen speelgoedvorm.
    normaalGrens: 0.95, delingsStraal: 0.22,
    emissieBasis: 0.45, emissieActief: 0.35, // Gedempte violette fluorescentie.
  },
  deling: {
    ruimte: 0.08, lengte: 1.6, kernRuimte: 0.64, kernLengte: 0.48,
    kernRadiaal: 1.5, organelVerkleining: 0.2, // Dezelfde geometrie wordt twee dochterhelften.
  },
  focus: {
    membraan: [0.5, 0.7, 0.27] as const, cytoplasma: [0.1, 0.02, 0.15] as const,
    kern: [0, 0, 0] as const, ribosoom: [0.4, 0.2, 0.36] as const,
    mitochondrion: [-0.45, -0.12, 0.22] as const, golgi: [0.43, -0.38, 0.05] as const,
    celdeling: [0, 0, 0] as const, // Focus volgt actieveOrganellen, niet het paginathema.
  },
  focusBereiken: {
    membraan: 0.035, cytoplasma: 0.18, kern: 0.16, ribosoom: 0.045,
    mitochondrion: 0.08, golgi: 0.09, celdeling: 1.4, // Macrovlak versus rustig totaalbeeld.
  },
  effecten: {
    bokeh: 2, resolutie: 0.5, // Dun focusvlak, halve DOF-resolutie.
    bloomDrempel: 1.3, bloomIntensiteit: 0.12, // Alleen de helderste interne structuren.
    vignette: 0.32, korrel: 0.035, // Subtiel instrumentbeeld.
    meetSeconden: 3, bloomOnderFps: 35, dofOnderFps: 24, // Eerst bloom opgeven, dan pas DOF.
    opwarmDelta: 0.1, // Eerste shadercompilatie telt hoogstens als één traag opwarmframe.
  },
  geometrieDrempel: 0.00001, // Onzichtbaar kleine CPU-geometrieupdates overslaan.
} as const;

export type CelInstellingen = typeof celInstellingen;

```
