import { placeholderContent } from "@/content/placeholderContent";
import { ROLE_PHASE, aboutBodyFor, resumeLabelFor } from "@/content/role";
import { experienceFor } from "@/lib/experience";
import { CV_LAST_MODIFIED, SITE_URL, absoluteUrl } from "@/lib/site";
import { SOCIAL_PROFILES } from "@/lib/structuredData";
import type { IsoDatePart, RolePhase } from "@/types/content";

// CV in JSON Resume v1 (https://jsonresume.org/schema). Engelstalig en
// afgeleid uit content/placeholderContent.ts + content/role.ts: geen kopie
// van de CV-data. Het schema kent geen verplichte velden en staat extra
// velden toe in `meta` en op de root.
//
// OPEN PUNT (technische schuld): de CV-gegevens leven vandaag op drie plekken:
//   - nidus-api   src/data/cvData.ts         (bron van de PDF, rijker: bullets,
//                                             tweede opleiding, aanbevelingen)
//   - nidus-api   src/data/portfolioContent.ts (tekst voor Jarvis/AI)
//   - lowi-cv     content/placeholderContent.ts (deze site en /cv.json)
// Die drie moeten handmatig in sync blijven. Doel op termijn: één bron.
// Bewust niet nu opgelost.

export interface ResumeProfile {
  network: string;
  username: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  url: string;
  summary: string;
  location: {
    city: string;
    countryCode: string;
  };
  profiles: ResumeProfile[];
}

export interface ResumeWork {
  name: string;
  description?: string; // korte typering van de opdracht (companyNote)
  position: string;
  startDate?: IsoDatePart;
  endDate?: IsoDatePart;
  summary?: string;
}

export interface ResumeEducation {
  institution: string;
  area: string;
  startDate?: IsoDatePart;
  endDate?: IsoDatePart;
}

export interface ResumeSkill {
  name: string;
  keywords: string[];
}

export interface ResumeLanguage {
  language: string;
  fluency: string;
}

export interface ResumeMeta {
  canonical: string;
  version: string;
  lastModified: string;
  pdf: string;
}

export interface JsonResume {
  $schema: string;
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  meta: ResumeMeta;
}

const SCHEMA_URL =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

// Netwerknaam per sleutel uit SOCIAL_PROFILES; lege URL's vallen weg,
// net als in sameAs van de JSON-LD.
const PROFILE_NETWORKS: Record<keyof typeof SOCIAL_PROFILES, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
};

// Laatste padsegment als gebruikersnaam ("…/in/klaas-…/" -> "klaas-…").
function usernameFromUrl(profileUrl: string): string {
  const segments = new URL(profileUrl).pathname.split("/").filter(Boolean);
  return segments.at(-1) ?? "";
}

function buildProfiles(): ResumeProfile[] {
  return Object.entries(SOCIAL_PROFILES)
    .filter(([, profileUrl]) => profileUrl.trim() !== "")
    .map(([key, profileUrl]) => ({
      network: PROFILE_NETWORKS[key as keyof typeof SOCIAL_PROFILES],
      username: usernameFromUrl(profileUrl),
      url: profileUrl,
    }));
}

// "2018" en "2018-01" horen bij elkaar gesorteerd te worden; een los jaar
// telt als de maand vóór januari, zodat het niet ná "2018-01" belandt.
function sortKey(date: IsoDatePart | undefined): string {
  if (!date) return "";
  return date.length === 4 ? `${date}-00` : date;
}

function buildWork(phase: RolePhase): ResumeWork[] {
  // Zelfde bron als de tijdlijn op de site (lib/experience.ts).
  const entries: ResumeWork[] = experienceFor(phase).map((entry) => ({
    name: entry.company,
    // work.description is het schemaveld voor zo'n typering; location is
    // voorbehouden aan een plaats.
    ...(entry.companyNote ? { description: entry.companyNote.en } : {}),
    position: entry.role.en,
    startDate: entry.startDate,
    ...(entry.endDate ? { endDate: entry.endDate } : {}),
    summary: entry.description.en,
  }));

  // Omgekeerd chronologisch; entries zonder startDate achteraan.
  return entries.sort((left, right) => {
    const leftKey = sortKey(left.startDate);
    const rightKey = sortKey(right.startDate);
    if (leftKey === rightKey) return 0;
    if (leftKey === "") return 1;
    if (rightKey === "") return -1;
    return rightKey.localeCompare(leftKey);
  });
}

function buildEducation(): ResumeEducation[] {
  return placeholderContent.education.map((entry) => ({
    institution: entry.institution,
    area: entry.degree.en,
    startDate: entry.startDate,
    ...(entry.endDate ? { endDate: entry.endDate } : {}),
  }));
}

function buildSkills(): ResumeSkill[] {
  return placeholderContent.skillsSection.clusters.map((cluster) => ({
    name: cluster.title.en,
    keywords: cluster.items.map((item) => item.en),
  }));
}

function buildLanguages(): ResumeLanguage[] {
  return placeholderContent.languageSkills.map((skill) => ({
    language: skill.language.en,
    fluency: skill.level.en,
  }));
}

export function buildResume(phase: RolePhase = ROLE_PHASE): JsonResume {
  return {
    $schema: SCHEMA_URL,
    basics: {
      name: placeholderContent.hero.name,
      label: resumeLabelFor(phase),
      email: placeholderContent.contact.email,
      url: SITE_URL,
      summary: aboutBodyFor(phase).en,
      location: {
        city: "Oudenaarde",
        countryCode: "BE",
      },
      profiles: buildProfiles(),
    },
    work: buildWork(phase),
    education: buildEducation(),
    skills: buildSkills(),
    languages: buildLanguages(),
    meta: {
      canonical: absoluteUrl("/cv.json"),
      version: "v1.0.0",
      lastModified: CV_LAST_MODIFIED,
      pdf: absoluteUrl("/cv.pdf"),
    },
  };
}
