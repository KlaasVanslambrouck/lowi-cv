// Route-local, bilingual editorial content. Project claims follow existing case data.

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
 * Start buiten de cel; scroll nadert het membraan en onthult het interieur.
 */
export const lowiCelBeginStaat: VisueleStaat = {
  cameraPositie: [0.15, 0.12, 3.8],
  kijkNaar: [0, 0, 0],
  fov: 45,
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
      nl: "Het celmembraan regelt selectief welke stoffen de cel in en uit gaan. Die grens maakt een eigen binnenwereld mogelijk.",
      en: "The cell membrane selectively regulates which substances enter and leave. That boundary makes an internal world possible.",
    },
    lowi: {
      nl: "Niet elke interessante vraag krijgt een project. Binnen LOWI geef ik een vraag genoeg aandacht om ze te begrijpen, te onderzoeken en er iets mee te bouwen. Focus maakt ruimte voor diepgang.",
      en: "Not every interesting question becomes a project. Within LOWI, I give a question enough attention to understand it, explore it and build something from it. Focus makes room for depth.",
    },
    accentToken: "--cv-blue",
    visueel: {
      cameraPositie: [0.18, 0.08, 1.75],
      kijkNaar: [0.12, 0.04, 0.3],
      fov: 60,
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
      nl: "Het cytoplasma omvat het cytosol en de structuren buiten de celkern. Het is een drukke omgeving waarin transport en veel chemische reacties plaatsvinden.",
      en: "The cytoplasm includes the cytosol and structures outside the nucleus. It is a busy environment for transport and many chemical reactions.",
    },
    lowi: {
      nl: "Hier mogen dingen onaf zijn. Een script, een onderzoeksvraag, een eerste interface. Ik combineer ze, test een vermoeden en verander van richting als het niet werkt. Een experiment hoeft geen product te worden. Het moet wel eerlijk als experiment herkenbaar blijven.",
      en: "Things can be unfinished here. A script, a research question, a first interface. I combine them, test a hunch and change direction when it does not work. An experiment does not have to become a product. It should be clearly recognisable as an experiment.",
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
      nl: "Eerst begrijpen. Dan bouwen.",
      en: "Understand first. Then build.",
    },
    biologie: {
      nl: "De celkern bevat het grootste deel van het DNA. Genen bevatten informatie die via RNA bijdraagt aan de aanmaak van eiwitten. DNA denkt niet; het is erfelijke informatie.",
      en: "The nucleus contains most of the cell’s DNA. Genes carry information that, through RNA, contributes to protein production. DNA does not think; it stores hereditary information.",
    },
    lowi: {
      nl: "Mijn vertrekpunt is kijken: wat gebeurt hier eigenlijk? Dan probeer ik het te begrijpen, verbanden te zien en er een model van te maken. Bouwen maakt dat model toetsbaar. Wat de test laat zien, bepaalt wat ik opnieuw moet bekijken.",
      en: "I start by looking: what is actually happening here? Then I try to understand it, see connections and make a model. Building makes that model testable. What the test reveals determines what I need to look at again.",
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
      nl: "Ribosomen lezen de informatie in boodschapper-RNA en verbinden aminozuren tot eiwitten. Zo wordt genetische informatie vertaald naar moleculen die werk doen.",
      en: "Ribosomes read messenger RNA and join amino acids into proteins. Genetic information becomes molecules that do work.",
    },
    lowi: {
      nl: "Nidus maakt die stap concreet: gegevens uit mijn dagelijks leven komen samen in een persoonlijk systeem. Een API verbindt de interfaces met de data; workers verzorgen terugkerende taken. De case laat zien hoe die onderdelen samenwerken, en waarom de grenzen ertussen ertoe doen.",
      en: "Nidus makes that step concrete: data from my daily life comes together in a personal system. An API connects interfaces to data; workers handle recurring tasks. The case shows how these parts work together, and why their boundaries matter.",
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
      nl: "Mitochondriën maken bij de celademhaling veel van het ATP dat cellen gebruiken. ATP draagt chemische energie over aan processen die die nodig hebben.",
      en: "During cellular respiration, mitochondria produce much of the ATP cells use. ATP transfers chemical energy to processes that need it.",
    },
    lowi: {
      nl: "LOWI bestaat naast mijn werk. Hier hoeft een vraag niet meteen commercieel nuttig te zijn of op een roadmap te passen. Waarom werkt een biologisch systeem zo? Wat kan AI zichtbaar maken? Kan een verhaal helpen om technologie te begrijpen? Nieuwsgierigheid krijgt hier tijd én een werkbank.",
      en: "LOWI exists alongside my work. Here, a question does not need an immediate commercial use or a place on a roadmap. Why does a biological system work this way? What can AI reveal? Can a story help us understand technology? Curiosity gets both time and a workbench.",
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
      nl: "Het golgi-apparaat bewerkt, sorteert en verpakt eiwitten en lipiden. Transportblaasjes brengen ze naar hun bestemming in of buiten de cel.",
      en: "The Golgi apparatus modifies, sorts and packages proteins and lipids. Transport vesicles carry them to destinations inside or outside the cell.",
    },
    lowi: {
      nl: "Een prototype bewijst dat iets kan. Daarna begint het werk om het bruikbaar te maken: testen, overbodige stappen schrappen, uitleg schrijven, de interface verzorgen en toegang goed regelen. Ik wil niet alleen begrijpen hoe het werkt. Iemand anders moet er ook mee verder kunnen.",
      en: "A prototype shows that something is possible. Then comes the work of making it useful: testing, removing unnecessary steps, writing explanations, shaping the interface and controlling access. I want more than to understand how it works. Someone else should be able to take it further.",
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
      nl: "Uit één vraag groeien nieuwe richtingen.",
      en: "One question grows into new directions.",
    },
    biologie: {
      nl: "Na het kopiëren van het DNA verdeelt een dierlijke cel bij mitose haar chromosomen over twee kernen. Daarna kan de cel zich splitsen in twee dochtercellen.",
      en: "After copying its DNA, an animal cell undergoing mitosis distributes its chromosomes between two nuclei. The cell can then split into two daughter cells.",
    },
    lowi: {
      nl: "Een experiment laat meer achter dan een resultaat. Een inzicht wordt een bouwsteen; een onopgeloste vraag wordt een nieuw begin. Nidus en CRISPR & CHICKN gaan verschillende kanten uit. Ze delen dezelfde gewoonte: onderzoeken, maken en opnieuw kijken.",
      en: "An experiment leaves more than a result. An insight becomes a building block; an unresolved question becomes a new beginning. Nidus and CRISPR & CHICKN take different directions. They share the same habit: investigate, make and look again.",
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
  titel: { nl: "Waar projecten beginnen.", en: "Where projects begin." },
  tekst: {
    nl: "LOWI is niet één project. Het is de plek waar projecten vandaan komen. Soms wordt een vraag een systeem dat ik dagelijks gebruik. Soms een verhaal dat een gesprek opent. Dit groeit er nu uit.",
    en: "LOWI is not one project. It is where projects come from. Sometimes a question becomes a system I use every day. Sometimes a story that opens a conversation. This is what is growing here.",
  },
  ctaLabel: { nl: "Ontdek Nidus", en: "Explore Nidus" },
  ctaHref: "/nidus",
};
