import { placeholderContent } from "@/content/placeholderContent";
import { schemaRole } from "@/content/role";
import {
  PUBLIC_ROUTES,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  localizedPath,
} from "@/lib/site";
import type { Language } from "@/types/content";

// Schema.org JSON-LD als identiteitsanker voor zoekmachines en agents.
// Eigen interfaces (geen schema-dts): enkel de types en velden die we gebruiken.
//
// TAAL: de teksten blijven Engels in beide taalversies — het zijn beschrijvingen
// voor machines, niet de zichtbare copy. Wat per taalversie verschilt, is welke
// pagina beschreven wordt: de paginanodes (ProfilePage, WebPage) hebben per taal
// een eigen @id, url en inLanguage. De entiteiten daarachter (Person, LOWI,
// Nidus) houden in beide talen hetzelfde @id: het is één persoon, één lab.

// ---------------------------------------------------------------------------
// Configuratie — wijzig hier, niet in de builders.
// ---------------------------------------------------------------------------

// Rol en werkgever komen uit content/role.ts (schemaRole): dat volgt ROLE_PHASE.

// Leeg = geen `image` in het schema. Later: "/klaas-vanslambrouck.jpg".
export const PERSON_IMAGE_PATH = "";

// Lege strings worden weggefilterd uit `sameAs`.
export const SOCIAL_PROFILES = {
  linkedin: placeholderContent.contact.linkedinUrl,
  github: "https://github.com/KlaasVanslambrouck",
  x: "",
};

export const PERSON_NAME = "Klaas Vanslambrouck";

export const PERSON_ID = `${SITE_URL}/#person`;
export const LOWI_ID = `${SITE_URL}/#lowi`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const NIDUS_ID = `${SITE_URL}/#nidus`;
export const CRISPR_CHICKN_ID = `${SITE_URL}/#crispr-chickn`;

// Paginanodes: per taalversie een eigen @id, op de URL van die versie.
// "https://…/#profilepage" en "https://…/en#profilepage".
export function profilePageId(language: Language): string {
  return `${absoluteUrl(localizedPath("/", language))}#profilepage`;
}

export function webPageId(basePath: `/${string}`, language: Language): string {
  return `${absoluteUrl(localizedPath(basePath, language))}#webpage`;
}

// Taalcode in inLanguage: gelijk aan <html lang>, dus "nl" of "en".
function inLanguageOf(language: Language): string {
  return language;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NodeRef {
  "@id": string;
}

interface PostalAddressNode {
  "@type": "PostalAddress";
  addressLocality: string;
  addressCountry: string;
}

interface EmployerNode {
  "@type": "Organization";
  name: string;
  legalName?: string;
}

// Korte persoonsverwijzing voor pagina's zonder volledige Person-node:
// genoeg om de entiteit te herkennen zonder de homepage te lezen.
export interface PersonRefNode {
  "@type": "Person";
  "@id": string;
  name: string;
  url: string;
}

export interface PersonNode {
  "@type": "Person";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  image?: string;
  email: string;
  jobTitle: string;
  worksFor: EmployerNode;
  address: PostalAddressNode;
  knowsAbout: string[];
  sameAs: string[];
}

export interface OrganizationNode {
  "@type": "Organization";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  description: string;
  disambiguatingDescription: string;
  founder: NodeRef;
}

export interface ProfilePageNode {
  "@type": "ProfilePage";
  "@id": string;
  url: string;
  name: string;
  inLanguage: string;
  dateModified: string;
  mainEntity: NodeRef;
}

export interface SoftwareApplicationNode {
  "@type": "SoftwareApplication";
  "@id": string;
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  author: NodeRef;
  creator: NodeRef;
  isPartOf: NodeRef;
}

export interface CreativeWorkNode {
  "@type": "CreativeWork";
  "@id": string;
  name: string;
  description: string;
  genre: string;
  creativeWorkStatus: string;
  creator: NodeRef;
  isPartOf: NodeRef;
}

export interface WebSiteNode {
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
  // Beide taalversies van dezelfde site.
  inLanguage: string[];
  publisher: NodeRef;
}

// Korte verwijzingen, zodat een pagina naar een entiteit kan wijzen zonder de
// volledige node te herhalen. Elke @id waar een pagina naar verwijst, staat zo
// ook in haar eigen graaf (lib/structuredData.test.ts bewaakt dat).
export interface WebSiteRefNode {
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
}

export interface OrganizationRefNode {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
}

// De pagina zelf, per taalversie. about wijst naar waar de pagina over gaat.
export interface WebPageNode {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  inLanguage: string;
  isPartOf: NodeRef;
  about: NodeRef;
}

export type StructuredDataNode =
  | PersonNode
  | PersonRefNode
  | OrganizationNode
  | OrganizationRefNode
  | ProfilePageNode
  | WebPageNode
  | SoftwareApplicationNode
  | CreativeWorkNode
  | WebSiteNode
  | WebSiteRefNode
  | NodeRef;

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export function nodeRef(id: string): NodeRef {
  return { "@id": id };
}

export function personRef(): PersonRefNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PERSON_NAME,
    url: SITE_URL,
  };
}

export function personSchema(): PersonNode {
  const sameAs = Object.values(SOCIAL_PROFILES).filter(
    (profileUrl) => profileUrl.trim() !== "",
  );

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PERSON_NAME,
    alternateName: ["Klaas Van Slambrouck"],
    url: SITE_URL,
    ...(PERSON_IMAGE_PATH ? { image: absoluteUrl(PERSON_IMAGE_PATH) } : {}),
    email: placeholderContent.contact.email,
    jobTitle: schemaRole.jobTitle,
    worksFor: {
      "@type": "Organization",
      name: schemaRole.employer.name,
      ...(schemaRole.employer.legalName
        ? { legalName: schemaRole.employer.legalName }
        : {}),
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Oudenaarde",
      addressCountry: "BE",
    },
    knowsAbout: [
      "AI transformation",
      "functional analysis",
      "agentic AI",
      "systems thinking",
      "Microsoft Dynamics 365",
      "AI product development",
      "biotechnology communication",
    ],
    sameAs,
  };
}

export function lowiSchema(): OrganizationNode {
  return {
    "@type": "Organization",
    "@id": LOWI_ID,
    name: "LOWI — Lab of Wonder and Imagination",
    alternateName: ["LOWI", "Lab of Wonder and Imagination"],
    url: absoluteUrl("/lowi"),
    // Afgeleid van placeholderContent.lowi.intro (en).
    description:
      "Personal learning, research and building lab of Klaas Vanslambrouck at the intersection of AI, biology, automation and creative technology.",
    disambiguatingDescription:
      "A personal lab of Klaas Vanslambrouck (Oudenaarde, Belgium). Not related to lowi.nl.",
    founder: nodeRef(PERSON_ID),
  };
}

// De homepage per taalversie. mainEntity blijft dezelfde persoon.
export function profilePageSchema(language: Language): ProfilePageNode {
  const homeRoute = PUBLIC_ROUTES.find((route) => route.path === "/");

  return {
    "@type": "ProfilePage",
    "@id": profilePageId(language),
    url: absoluteUrl(localizedPath("/", language)),
    name: SITE_NAME,
    inLanguage: inLanguageOf(language),
    dateModified: homeRoute?.lastModified ?? "",
    mainEntity: nodeRef(PERSON_ID),
  };
}

// De pagina zelf op /nidus en /lowi (en hun /en-versies).
// Geen primaryImageOfPage: de og:image-URL krijgt van Next een hash in de
// bestandsnaam, die we hier niet kennen zonder een tweede bron aan te leggen.
export function webPageSchema(
  basePath: `/${string}`,
  language: Language,
  name: string,
  aboutId: string,
): WebPageNode {
  return {
    "@type": "WebPage",
    "@id": webPageId(basePath, language),
    url: absoluteUrl(localizedPath(basePath, language)),
    name,
    inLanguage: inLanguageOf(language),
    isPartOf: nodeRef(WEBSITE_ID),
    about: nodeRef(aboutId),
  };
}

export function websiteRef(): WebSiteRefNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
  };
}

export function lowiRef(): OrganizationRefNode {
  return {
    "@type": "Organization",
    "@id": LOWI_ID,
    name: "LOWI — Lab of Wonder and Imagination",
    url: absoluteUrl("/lowi"),
  };
}

// SoftwareApplication: Nidus is draaiende software (web, mobiel, API, workers).
// Bewust geen offers/aggregateRating: die bestaan niet en mogen niet verzonnen
// worden. Google Rich Results Test meldt ze als ontbrekend voor het
// "Software App"-resultaat; het schema zelf blijft geldig.
export function nidusSchema(): SoftwareApplicationNode {
  return {
    "@type": "SoftwareApplication",
    "@id": NIDUS_ID,
    name: "Nidus",
    url: absoluteUrl("/nidus"),
    // Afgeleid van placeholderContent.lowi.projects (Nidus, en).
    description:
      "A personal operating system that brings together data from family, home and daily routines — energy usage, location data, automations, dashboards, Raspberry Pi workers, Supabase and mobile interfaces — with Jarvis as an AI layer on top.",
    applicationCategory: "LifestyleApplication",
    author: nodeRef(PERSON_ID),
    creator: nodeRef(PERSON_ID),
    isPartOf: nodeRef(LOWI_ID),
  };
}

export function crisprChicknSchema(): CreativeWorkNode {
  return {
    "@type": "CreativeWork",
    "@id": CRISPR_CHICKN_ID,
    name: "CRISPR & CHICKN",
    // Afgeleid van placeholderContent.lowi.projects (CRISPR & CHICKN, en).
    description:
      "An artistic-scientific theatre project about genetic technology, the malleability of life and how far humanity may go in rewriting it, making CRISPR, genetic modification and synthetic biology tangible for a broad audience.",
    genre: "Theatre",
    creativeWorkStatus: "In development",
    creator: nodeRef(PERSON_ID),
    isPartOf: nodeRef(LOWI_ID),
  };
}

// Eén node voor de hele site, in beide talen; de taalversies zelf zijn de
// ProfilePage- en WebPage-nodes.
export function websiteSchema(): WebSiteNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: ["nl", "en"],
    publisher: nodeRef(PERSON_ID),
  };
}

// ---------------------------------------------------------------------------
// De graaf per pagina — hier staat welke nodes een pagina meestuurt.
// De route-componenten geven enkel hun taal door.
// ---------------------------------------------------------------------------

export function homeGraph(language: Language): readonly StructuredDataNode[] {
  return [
    websiteSchema(),
    profilePageSchema(language),
    personSchema(),
    lowiSchema(),
  ];
}

export function nidusGraph(language: Language): readonly StructuredDataNode[] {
  return [
    webPageSchema("/nidus", language, "Nidus — case study", NIDUS_ID),
    nidusSchema(),
    // Nidus verwijst naar LOWI en naar de persoon; beide krijgen een korte
    // node, zodat de graaf van deze pagina geen losse @id's bevat.
    lowiRef(),
    personRef(),
    websiteRef(),
  ];
}

export function lowiGraph(language: Language): readonly StructuredDataNode[] {
  return [
    webPageSchema(
      "/lowi",
      language,
      "LOWI — Lab of Wonder and Imagination",
      LOWI_ID,
    ),
    lowiSchema(),
    crisprChicknSchema(),
    personRef(),
    websiteRef(),
  ];
}
