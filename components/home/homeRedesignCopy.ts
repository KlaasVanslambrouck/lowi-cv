import type { Bilingual } from "@/types/content";

// TODO concept-copy: alle nieuwe tekst van de herwerkte homepage
// (docs/redesign/artboards/Main.dc.html §4 en Home.dc.html). Nog te
// beoordelen; de gevalideerde copy blijft in content/placeholderContent.ts
// en content/role.ts.
export const homeRedesignCopy = {
  aboutShort: { nl: "Over mij", en: "About me" },
  sketchAria: {
    nl: "Schets: interfaces praten met de API, de API ontsluit de data",
    en: "Sketch: interfaces talk to the API, the API exposes the data",
  },
  sketchNote: { nl: "zo zit Nidus in elkaar", en: "how Nidus fits together" },
  experienceHeading: { nl: "Van geluid naar systemen", en: "From sound to systems" },
  experienceRoute: {
    nl: "Sound engineering → Functionele analyse → AI",
    en: "Sound engineering → Functional analysis → AI",
  },
  experienceNote: { nl: "van mengtafel naar systemen", en: "from mixing desk to systems" },
  nextStep: { nl: "volgende stap →", en: "next step →" },
  strikeFrom: { nl: "Een idee", en: "An idea" },
  strikeTo: { nl: "een werkend systeem", en: "a working system" },
  xrayStackLabel: { nl: "Lagen", en: "Layers" },
  xrayNote: { nl: "onder de motorkap", en: "under the hood" },
  nidusXrayNote: {
    nl: "mobile praat nooit rechtstreeks met Supabase",
    en: "mobile never talks to Supabase directly",
  },
  projectsXrayNote: { nl: "drie projecten, één platform", en: "three projects, one platform" },
} satisfies Record<string, Bilingual>;

// Systeemschets in de hero: gewone weergave en X-ray (componentnamen uit
// content/nidusCaseStudy.ts).
export const SKETCH_LABELS = {
  normal: ["Interfaces", "API", "Data"],
  xray: ["nidus · mobile", "nidus-api", "Supabase"],
} as const;

// Stapellabels in de X-ray-strook: dezelfde labels als de vroegere
// architectuurscene (ArchitectureSceneFallback).
export const XRAY_STACK = [
  "next-js",
  "supabase",
  "railway",
  "databricks",
  "Raspberry Pi",
  "mobile",
  "jarvis",
] as const;

// Markeringen: letterlijke passages uit de bestaande copy.
export const HOME_HIGHLIGHTS = {
  thesis: { nl: "werkende AI-systemen", en: "working AI systems" },
  about: { nl: "waar frictie zit", en: "where the friction lies" },
} satisfies Record<string, Bilingual>;
