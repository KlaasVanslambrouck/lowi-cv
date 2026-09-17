import { placeholderContent } from "@/content/placeholderContent";
import { PUBLIC_ROUTES, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Schema.org JSON-LD als identiteitsanker voor zoekmachines en agents.
// Eigen interfaces (geen schema-dts): enkel de types en velden die we gebruiken.
// Teksten in het Engels; inLanguage per pagina volgt later per taalversie.

// ---------------------------------------------------------------------------
// Configuratie — wijzig hier, niet in de builders.
// ---------------------------------------------------------------------------

// Vanaf 2026-10-01: jobTitle "AI Transformation Expert",
// worksFor { name: "In The Pocket", legalName: "ITP Agency NV" }
export const CURRENT_ROLE: {
  jobTitle: string;
  worksFor: { name: string; legalName?: string };
} = {
  jobTitle: "Functional Consultant",
  worksFor: { name: "Itineris NV" },
};

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
export const PROFILE_PAGE_ID = `${SITE_URL}/#profilepage`;
export const NIDUS_ID = `${SITE_URL}/#nidus`;
export const CRISPR_CHICKN_ID = `${SITE_URL}/#crispr-chickn`;

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
  inLanguage: string;
  publisher: NodeRef;
}

export type StructuredDataNode =
  | PersonNode
  | PersonRefNode
  | OrganizationNode
  | ProfilePageNode
  | SoftwareApplicationNode
  | CreativeWorkNode
  | WebSiteNode
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
    jobTitle: CURRENT_ROLE.jobTitle,
    worksFor: { "@type": "Organization", ...CURRENT_ROLE.worksFor },
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

export function profilePageSchema(): ProfilePageNode {
  const homeRoute = PUBLIC_ROUTES.find((route) => route.path === "/");

  return {
    "@type": "ProfilePage",
    "@id": PROFILE_PAGE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "nl",
    dateModified: homeRoute?.lastModified ?? "",
    mainEntity: nodeRef(PERSON_ID),
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

export function websiteSchema(): WebSiteNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "nl",
    publisher: nodeRef(PERSON_ID),
  };
}
