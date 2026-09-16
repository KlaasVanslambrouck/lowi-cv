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
  deeltjesDichtheid: number;
}

export function maakCelStaat(): CelStaat {
  return {
    deeltjesDichtheid: 1,
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
// E?n doorlopende nadering, zonder terugwaartse onthullingssprong.
export function maakCelDoelBerekening(): (p: number, doel: CelStaat) => void {
  const vanCamera = new Vector3(), naarCamera = new Vector3();
  const vanKijkpunt = new Vector3(), naarKijkpunt = new Vector3();
  const vanFocus = new Vector3(), naarFocus = new Vector3();
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
