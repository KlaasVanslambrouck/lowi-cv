/**
 * Leesbaarheidsdrempel voor de SVG-visuals in presentatiemodus.
 *
 * Een SVG met `preserveAspectRatio="xMidYMid meet"` schaalt alles mee: de
 * lijnen én de typografie. Dat is precies de bedoeling — maar het betekent ook
 * dat een diagram dat te weinig ruimte krijgt niet afgesneden wordt maar
 * onleesbaar. Deze module rekent uit hoe klein de kleinste tekst in het
 * diagram daardoor op het scherm wordt.
 *
 * De maten hieronder horen bij de viewBox die in presentatiemodus geldt (dus
 * zonder de eigen kop van het diagram); `kleinsteTekst` is de kleinste
 * `font-size` binnen dat diagram, in viewBox-eenheden.
 */

/** Onder deze grootte is diagramtekst niet meer af te lezen vanuit de zaal. */
export const LEESBAARHEIDSDREMPEL_PX = 13;

export interface DiagramMaat {
  viewBoxBreedte: number;
  viewBoxHoogte: number;
  kleinsteTekst: number;
}

export const DIAGRAM_MATEN: Readonly<Record<string, DiagramMaat>> = {
  // .drieKlokkenTodayText is met 13 eenheden de kleinste tekst.
  "drie-klokken": {
    viewBoxBreedte: 1086,
    viewBoxHoogte: 468,
    kleinsteTekst: 13,
  },
  // .herkaderingBadgeTekst is met 12 eenheden de kleinste tekst.
  herkadering: {
    viewBoxBreedte: 1200,
    viewBoxHoogte: 620,
    kleinsteTekst: 12,
  },
  // .oplossingPathLabel is met 12 eenheden de kleinste tekst.
  "oplossing-schema": {
    viewBoxBreedte: 1288,
    viewBoxHoogte: 786,
    kleinsteTekst: 12,
  },
  "oplossing-schema:spoorA": {
    viewBoxBreedte: 1288,
    viewBoxHoogte: 466,
    kleinsteTekst: 12,
  },
  "oplossing-schema:spoorB": {
    viewBoxBreedte: 1288,
    viewBoxHoogte: 308,
    kleinsteTekst: 12,
  },
};

export function diagramSleutel(visueelId: string, stapId?: string): string {
  return stapId ? `${visueelId}:${stapId}` : visueelId;
}

/**
 * De effectieve schaalfactor van een `meet`-viewBox: de kleinste van de twee
 * verhoudingen wint, want het beeld past zich in zijn geheel in.
 */
export function effectieveSchaal(
  breedte: number,
  hoogte: number,
  maat: DiagramMaat,
): number {
  if (breedte <= 0 || hoogte <= 0) return 0;

  return Math.min(breedte / maat.viewBoxBreedte, hoogte / maat.viewBoxHoogte);
}

export function kleinsteTekstInPixels(
  schaal: number,
  maat: DiagramMaat,
): number {
  return schaal * maat.kleinsteTekst;
}
