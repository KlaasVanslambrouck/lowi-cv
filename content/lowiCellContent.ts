// Alle teksten zijn placeholders die later worden herschreven. Deze content
// verhuist later naar een database; de structuur blijft daarom plat en
// serialiseerbaar, zonder componentafhankelijkheden of functies in de data.

import type { Bilingual } from "@/types/content";

export type OrganelId =
  | "membraan"
  | "cytoplasma"
  | "kern"
  | "ribosoom"
  | "mitochondrion"
  | "golgi"
  | "celdeling";

export interface VisueleStaat {
  /** Verticale beeldhoek in graden. */
  fov: number;
  /** Camerapositie in wereldcoördinaten aan het einde van dit hoofdstuk. */
  cameraPositie: readonly [number, number, number];
  /** Punt waar de camera naar kijkt. */
  kijkNaar: readonly [number, number, number];
  /** Organellen die oplichten; de rest dimt naar de achtergrond. */
  actieveOrganellen: readonly OrganelId[];
  /** 0 = gesloten cel, 1 = opengewerkte doorsnede. */
  doorsnede: number;
  /** 0 = DNA opgerold in de kern, 1 = volledig ontvouwen dubbele helix. */
  dnaOntvouwing: number;
}

export interface LowiCelHoofdstuk {
  id: string;
  organel: OrganelId;
  titel: Bilingual;
  /** Korte one-liner, maximaal ongeveer tien woorden. */
  kernzin: Bilingual;
  /** Wat dit organel doet in een echte cel. */
  biologie: Bilingual;
  /** Waar dit voor staat binnen LOWI. */
  lowi: Bilingual;
  /** Bestaand accenttoken uit app/globals.css, zonder var(). */
  accentToken: "--cv-copper" | "--cv-blue" | "--cv-violet";
  visueel: VisueleStaat;
}

export interface LowiCelIntro {
  titel: Bilingual;
  ondertitel: Bilingual;
  scrollHint: Bilingual;
}

export interface LowiCelSlot {
  titel: Bilingual;
  tekst: Bilingual;
  ctaLabel: Bilingual;
  ctaHref: string;
}

// Centrale afleiding voor DOM-secties en analytics; geen onderdeel van de data.
export function lowiCelSectieId(
  id: LowiCelHoofdstukId,
): `lowi-cel-${LowiCelHoofdstukId}` {
  return `lowi-cel-${id}`;
}

export const lowiCelIntro: LowiCelIntro = {
  titel: { nl: "LOWI", en: "LOWI" },
  ondertitel: {
    nl: "Lab of Wonder and Imagination",
    en: "Lab of Wonder and Imagination",
  },
  scrollHint: {
    nl: "Scroll om de cel te openen",
    en: "Scroll to open the cell",
  },
};

// Voorlopige wereldschaal: celstraal = 1 eenheid, celcentrum = [0, 0, 0],
// Y wijst omhoog en de camera kijkt vanaf de positieve Z-zijde naar binnen.
// Camera- en kijkpunten zijn startwaarden; stem ze in Fase 3 af op de geometrie.
/**
 * Staat van de scène tijdens de intro, vóór het eerste hoofdstuk.
 * De camera interpoleert hiervandaan naar hoofdstuk 1 ("grens").
 * Extreme macro: de onthulling van de hele cel volgt pas in hoofdstuk 2.
 */
export const lowiCelBeginStaat: VisueleStaat = {
  cameraPositie: [0.04, 0.955, 0.1],
  kijkNaar: [0.32, 0.77, 0.14],
  fov: 82,
  actieveOrganellen: [],
  doorsnede: 0,
  dnaOntvouwing: 0,
};

export const lowiCelHoofdstukken = [
  {
    id: "grens",
    organel: "membraan",
    titel: { nl: "Het membraan", en: "The membrane" },
    kernzin: {
      nl: "Elk lab begint met een grens.",
      en: "Every lab begins with a boundary.",
    },
    biologie: {
      nl: "Het celmembraan bepaalt wat binnenkomt en wat buiten blijft. Het is geen muur maar een filter: selectief, doorlaatbaar, altijd in beweging.",
      en: "The cell membrane determines what enters and what stays outside. It is not a wall but a filter: selective, permeable, always in motion.",
    },
    lowi: {
      nl: "LOWI staat voor Lab of Wonder and Imagination. Het is de afgebakende ruimte waarin Klaas leert, onderzoekt en bouwt op het snijvlak van AI, biologie, automatisering en creatieve technologie. De grens is er niet om buiten te sluiten, maar om te bepalen wat er aandacht krijgt.",
      en: "LOWI stands for Lab of Wonder and Imagination. It is the defined space where Klaas learns, explores and builds at the intersection of AI, biology, automation and creative technology. The boundary is not there to keep things out, but to decide what receives attention.",
    },
    accentToken: "--cv-blue",
    visueel: {
      cameraPositie: [0.26, 0.913, 0.21],
      kijkNaar: [0.5, 0.7, 0.27],
      fov: 78,
      actieveOrganellen: ["membraan"],
      doorsnede: 0,
      dnaOntvouwing: 0,
    },
  },
  {
    id: "werkvloer",
    organel: "cytoplasma",
    titel: { nl: "Het cytoplasma", en: "The cytoplasm" },
    kernzin: {
      nl: "Niet leeg, maar vol half afgewerkte dingen.",
      en: "Not empty, but full of half-finished things.",
    },
    biologie: {
      nl: "Het cytoplasma is de vloeistof waarin alle organellen drijven. Alles wat in de cel gebeurt, gebeurt hierin.",
      en: "The cytoplasm is the fluid in which all organelles float. Everything that happens in the cell happens here.",
    },
    lowi: {
      nl: "Placeholder: over LOWI als werkomgeving waar meerdere projecten tegelijk half af zijn, en waarom dat een kenmerk is en geen probleem.",
      en: "Placeholder: about LOWI as a workspace where several projects are half-finished at once, and why that is a feature rather than a problem.",
    },
    accentToken: "--cv-blue",
    visueel: {
      cameraPositie: [0.22, 0.08, 0.84],
      kijkNaar: [0, 0, 0],
      fov: 75,
      actieveOrganellen: ["cytoplasma"],
      doorsnede: 1,
      dnaOntvouwing: 0,
    },
  },
  {
    id: "code",
    organel: "kern",
    titel: { nl: "De kern", en: "The nucleus" },
    kernzin: {
      nl: "In het DNA zit hoe iets denkt.",
      en: "DNA holds the way something thinks.",
    },
    biologie: {
      nl: "In de celkern ligt het DNA: een dubbele helix van vier basen die de instructies voor alles in de cel bevat.",
      en: "The nucleus holds the DNA: a double helix of four bases containing the instructions for everything in the cell.",
    },
    lowi: {
      nl: "Placeholder: over hoe Klaas denkt — onderzoekend, systemisch, gericht op iets dat bruikbaar, begrijpelijk en technisch degelijk is. Dit is het hoofdstuk waar de DNA-helix ontvouwt.",
      en: "Placeholder: about how Klaas thinks — inquisitive, systemic, focused on something useful, understandable and technically sound. This is the chapter where the DNA helix unfolds.",
    },
    accentToken: "--cv-violet",
    visueel: {
      cameraPositie: [0.14, 0.06, 0.74],
      kijkNaar: [0, 0, 0],
      fov: 70,
      actieveOrganellen: ["kern"],
      doorsnede: 1,
      dnaOntvouwing: 1,
    },
  },
  {
    id: "bouwen",
    organel: "ribosoom",
    titel: { nl: "De ribosomen", en: "The ribosomes" },
    kernzin: {
      nl: "Een idee telt pas als het draait.",
      en: "An idea only counts when it runs.",
    },
    biologie: {
      nl: "Ribosomen lezen de instructies en zetten ze om in eiwitten. Zij maken van informatie iets tastbaars.",
      en: "Ribosomes read the instructions and turn them into proteins. They make something tangible out of information.",
    },
    lowi: {
      nl: "Placeholder: over Nidus als eerste volwaardige systeem binnen LOWI — een persoonlijk operating system dat energie, budget, gezondheid, locatie en AI samenbrengt.",
      en: "Placeholder: about Nidus as the first fully fledged system within LOWI — a personal operating system bringing together energy, budget, health, location and AI.",
    },
    accentToken: "--cv-copper",
    visueel: {
      cameraPositie: [0.58, 0.33, 0.64],
      kijkNaar: [0.4, 0.2, 0.36],
      fov: 74,
      actieveOrganellen: ["ribosoom"],
      doorsnede: 1,
      dnaOntvouwing: 0,
    },
  },
  {
    id: "brandstof",
    organel: "mitochondrion",
    titel: { nl: "De mitochondriën", en: "The mitochondria" },
    kernzin: {
      nl: "Nieuwsgierigheid is de energiebron.",
      en: "Curiosity is the source of energy.",
    },
    biologie: {
      nl: "Mitochondriën zetten voeding om in energie. Zonder hen valt elk proces in de cel stil.",
      en: "Mitochondria turn nutrients into energy. Without them, every process in the cell comes to a halt.",
    },
    lowi: {
      nl: "Placeholder: over verwondering en nieuwsgierigheid als motor, en waarom LOWI naast werk bestaat en niet in plaats daarvan.",
      en: "Placeholder: about wonder and curiosity as the driving force, and why LOWI exists alongside work rather than in its place.",
    },
    accentToken: "--cv-copper",
    visueel: {
      cameraPositie: [-0.23, -0.03, 0.59],
      kijkNaar: [-0.45, -0.12, 0.22],
      fov: 64,
      actieveOrganellen: ["mitochondrion"],
      doorsnede: 1,
      dnaOntvouwing: 0,
    },
  },
  {
    id: "verfijnen",
    organel: "golgi",
    titel: { nl: "Het golgi-apparaat", en: "The Golgi apparatus" },
    kernzin: {
      nl: "Bruikbaar worden is een aparte stap.",
      en: "Becoming usable is a separate step.",
    },
    biologie: {
      nl: "Het golgi-apparaat verpakt en verfijnt wat de ribosomen maken, en stuurt het naar de juiste bestemming.",
      en: "The Golgi apparatus packages and refines what the ribosomes make, and sends it to the right destination.",
    },
    lowi: {
      nl: "Placeholder: over het verschil tussen een prototype en iets dat iemand anders kan gebruiken — documentatie, design, betrouwbaarheid.",
      en: "Placeholder: about the difference between a prototype and something someone else can use — documentation, design, reliability.",
    },
    accentToken: "--cv-blue",
    visueel: {
      cameraPositie: [0.65, -0.6, 0.53],
      kijkNaar: [0.43, -0.38, 0.05],
      fov: 60,
      actieveOrganellen: ["golgi"],
      doorsnede: 1,
      dnaOntvouwing: 0,
    },
  },
  {
    id: "groei",
    organel: "celdeling",
    titel: { nl: "Deling", en: "Division" },
    kernzin: {
      nl: "Eén systeem wordt een familie systemen.",
      en: "One system becomes a family of systems.",
    },
    biologie: {
      nl: "Bij celdeling geeft één cel haar volledige code door aan twee nieuwe. Groei is herhaling met variatie.",
      en: "During cell division, one cell passes its complete code to two new cells. Growth is repetition with variation.",
    },
    lowi: {
      nl: "Placeholder: over waar LOWI naartoe groeit — Nidus, CRISPR & CHICKN, en wat nog komt.",
      en: "Placeholder: about where LOWI is growing — Nidus, CRISPR & CHICKN, and what comes next.",
    },
    accentToken: "--cv-violet",
    visueel: {
      cameraPositie: [0.12, 0.38, 5.2],
      kijkNaar: [0, 0, 0],
      fov: 38,
      actieveOrganellen: ["celdeling"],
      doorsnede: 0,
      dnaOntvouwing: 0,
    },
  },
] as const satisfies readonly LowiCelHoofdstuk[];

export type LowiCelHoofdstukId = (typeof lowiCelHoofdstukken)[number]["id"];

export const lowiCelSlot: LowiCelSlot = {
  titel: { nl: "Van dichtbij bekeken", en: "A closer look" },
  tekst: {
    nl: "Placeholder: over hoe de onderdelen van LOWI samenkomen in Nidus, en wat je daar van dichtbij kunt bekijken.",
    en: "Placeholder: about how the parts of LOWI come together in Nidus, and what you can explore there up close.",
  },
  ctaLabel: { nl: "Ontdek Nidus", en: "Explore Nidus" },
  ctaHref: "/nidus",
};
