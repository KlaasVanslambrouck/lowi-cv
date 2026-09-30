import type { Bilingual } from "@/types/content";

// TODO concept-copy: alle nieuwe tekst van de herwerkte LOWI-pagina en het
// SVG-celmodel (docs/redesign/artboards/Lowi.dc.html, Cel.dc.html,
// Main.dc.html §4). Nog te beoordelen; de gevalideerde hoofdstuktekst blijft
// in content/lowiCellContent.ts. Het bijschrift van de cel blijft
// "Artistieke visualisatie · niet op schaal" tot Klaas de nieuwe tekst
// bevestigt (HANDOFF, Beslissingen §5).

// Organellabels bij de cel (HTML, verankerd aan de tekening).
export const celLabels = {
  mem: { nl: "Plasmamembraan", en: "Plasma membrane" },
  cytosol: { nl: "Cytosol", en: "Cytosol" },
  ser: { nl: "Glad ER", en: "Smooth ER" },
  ves: { nl: "Blaasje", en: "Vesicle" },
  nuc: { nl: "Kernmembraan met poriën", en: "Nuclear envelope with pores" },
  nucl: { nl: "Nucleolus", en: "Nucleolus" },
  chrom: { nl: "Chromatine", en: "Chromatin" },
  rer: { nl: "Ruw ER met ribosomen", en: "Rough ER with ribosomes" },
  mito: { nl: "Mitochondrion", en: "Mitochondrion" },
  cris: { nl: "Cristae", en: "Cristae" },
  golgi: { nl: "Golgi-apparaat", en: "Golgi apparatus" },
  tves: { nl: "Transportblaasje", en: "Transport vesicle" },
  d1: { nl: "Chromosomen in het midden", en: "Chromosomes at the centre" },
  d2: { nl: "Chromosomen naar de polen", en: "Chromosomes to the poles" },
  d3: { nl: "Twee kernen", en: "Two nuclei" },
  furrow: { nl: "Insnoering", en: "Cleavage furrow" },
} satisfies Record<string, Bilingual>;

export type CelLabelId = keyof typeof celLabels;

// Handgeschreven stand bovenaan de cel.
export const celStandTekst = {
  overzicht: { nl: "de hele cel", en: "the whole cell" },
  membraan: { nl: "01 / 07 · het membraan", en: "01 / 07 · the membrane" },
  cytoplasma: { nl: "02 / 07 · het cytoplasma", en: "02 / 07 · the cytoplasm" },
  kern: { nl: "03 / 07 · de kern", en: "03 / 07 · the nucleus" },
  ribosomen: { nl: "04 / 07 · de ribosomen", en: "04 / 07 · the ribosomes" },
  mitochondrien: { nl: "05 / 07 · de mitochondriën", en: "05 / 07 · the mitochondria" },
  golgi: { nl: "06 / 07 · het golgi-apparaat", en: "06 / 07 · the Golgi apparatus" },
  deling: { nl: "07 / 07 · deling", en: "07 / 07 · division" },
} satisfies Record<string, Bilingual>;

export const celTekst = {
  vereenvoudigd: { nl: "Vereenvoudigd", en: "Simplified" },
  lensMembraan: { nl: "Fosfolipiden­dubbellaag", en: "Phospholipid bilayer" },
  lensRibosomen: { nl: "Ribosomen op ruw ER", en: "Ribosomes on rough ER" },
  lensSchaal: { nl: "detailvergroting · niet op schaal", en: "magnified detail · not to scale" },
  pauzeer: { nl: "Beweging pauzeren", en: "Pause motion" },
  hervat: { nl: "Beweging hervatten", en: "Resume motion" },
} satisfies Record<string, Bilingual>;

// LOWI-pagina
export const lowiPaginaTekst = {
  introNotitie: { nl: "één cel, zeven blikken", en: "one cell, seven views" },
  deelstappenNoot: {
    nl: "Vereenvoudigde overgang — geen biologisch exacte simulatie.",
    en: "Simplified transition — not a biologically exact simulation.",
  },
} satisfies Record<string, Bilingual>;

// Korte namen in de hoofdstukbalk, per hoofdstuk-id.
export const hoofdstukKort = {
  grens: { nl: "Membraan", en: "Membrane" },
  werkvloer: { nl: "Cytoplasma", en: "Cytoplasm" },
  code: { nl: "Kern", en: "Nucleus" },
  bouwen: { nl: "Ribosomen", en: "Ribosomes" },
  brandstof: { nl: "Mitochondriën", en: "Mitochondria" },
  verfijnen: { nl: "Golgi", en: "Golgi" },
  groei: { nl: "Deling", en: "Division" },
} satisfies Record<string, Bilingual>;

// Drie deelstappen van de deling (hoofdstuk "groei").
export const delingStappen: readonly Bilingual[] = [
  { nl: "Chromosomen verdeeld over het midden", en: "Chromosomes lined up at the centre" },
  { nl: "Chromosomen naar twee polen", en: "Chromosomes moving to two poles" },
  { nl: "Twee kernen, de cel snoert in", en: "Two nuclei, the cell pinches in" },
];

// Markering in de kernzin per hoofdstuk: letterlijke passages uit de
// bestaande kernzinnen (lowiCellContent.ts). Geen nieuwe tekst.
export const kernzinMarkering = {
  grens: { nl: "grens", en: "boundary" },
  werkvloer: { nl: "half afgewerkte dingen", en: "half-finished things" },
  code: { nl: "Eerst begrijpen.", en: "Understand first." },
  bouwen: { nl: "als het draait", en: "when it runs" },
  brandstof: { nl: "Nieuwsgierigheid", en: "Curiosity" },
  verfijnen: { nl: "een aparte stap", en: "a separate step" },
  groei: { nl: "nieuwe richtingen", en: "new directions" },
} satisfies Record<string, Bilingual>;
