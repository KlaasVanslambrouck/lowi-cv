// Adapter die de BESTAANDE portfolio-content uit content/placeholderContent.ts
// transformeert naar KnowledgeChunk[]. Er wordt hier géén tekst opnieuw
// overgetypt: elke chunk verwijst naar en hergebruikt de echte content-objecten.
// Wanneer de content later uit Supabase komt, blijft deze adapter identiek —
// alleen de bron van `placeholderContent` verandert.
//
// BELANGRIJK — sensitivity: alles in dit bestand is publieke portfolio-content,
// dus elke chunk krijgt sensitivity "public". Een latere uitbreiding mag hier
// NOOIT analytics-, sessie- of admin-data aan toevoegen zonder eerst een echt
// sensitivity-filter in de retrieval-laag te bouwen.

import { placeholderContent } from "@/content/placeholderContent";
import type { Bilingual } from "@/types/content";
import type { KnowledgeChunk } from "./types";

// Maakt van vrije tekst een stabiele, URL-veilige slug (diacrieten weg via
// NFD + verwijderen van combining marks; alles behalve a-z/0-9 wordt een
// koppelteken).
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Bedrijfs-/instellingsnamen bevatten vaak toevoegingen tussen haakjes of na
// een komma/em-dash ("Soundfield NV (freelance & vast)"). Voor stabiele ids
// gebruiken we alleen het primaire naamdeel ("Soundfield NV").
function primaryName(name: string): string {
  return name.split(/[(,—]/)[0].trim();
}

// Ontdubbelt trefwoorden case-insensitief, met behoud van volgorde.
function uniqueKeywords(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const group of groups) {
    for (const keyword of group) {
      const key = keyword.toLowerCase().trim();
      if (key.length === 0 || seen.has(key)) continue;
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}

// Automatische NL+EN basistermen per sourceType, zodat vragen als "welke
// ervaring…" of "welke systemen heeft hij gebouwd…" de juiste categorie
// vinden zonder dat elke beschrijving die woorden letterlijk hoeft te bevatten.
const SOURCE_TYPE_KEYWORDS: Record<string, string[]> = {
  experience: ["ervaring", "experience", "loopbaan", "career"],
  project: ["project", "gebouwd", "built", "systeem", "system"],
  skill: ["skill", "vaardigheid"],
  education: ["opleiding", "education", "studie", "diploma"],
  architecture: ["architecture", "architectuur", "stack", "systeem", "system"],
  system: ["systeem", "system", "platform", "lowi"],
};

// Architectuurdata voor deze chunk komt uit components/ArchitectureScene.tsx:
// dezelfde node-labels en connections-array die in de hero-visualisatie zichtbaar
// zijn. We houden hier alleen de pure labels/relaties bij, zodat lib/ai geen
// client component met Three.js-runtime hoeft te importeren.
const ARCHITECTURE_NODES = [
  { id: "next-js", label: "next-js" },
  { id: "supabase", label: "supabase" },
  { id: "railway", label: "railway" },
  { id: "databricks", label: "databricks" },
  { id: "pi", label: "Raspberry Pi" },
  { id: "mobile", label: "mobile" },
  { id: "jarvis", label: "jarvis" },
];

const ARCHITECTURE_CONNECTIONS: Array<[string, string]> = [
  ["next-js", "supabase"],
  ["next-js", "railway"],
  ["railway", "supabase"],
  ["railway", "databricks"],
  ["databricks", "supabase"],
  ["pi", "supabase"],
  ["mobile", "railway"],
  ["jarvis", "railway"],
  ["jarvis", "supabase"],
];

// Handmatig gecureerde extra trefwoorden per chunk-id — alléén waar
// automatische extractie te mager is, met per entry de reden waarom.
const CURATED_KEYWORDS: Record<string, string[]> = {
  // hero.targetRole ("Bouwer van AI-gedreven systemen") is geen eigen chunk; de
  // over-mij-tekst draagt dat verhaal en de brug business↔techniek, dus de
  // termen uit hero.targetRole en hero.focusAreas horen hier thuis.
  "system-about-me": [
    "ai-gedreven systemen",
    "ai-enabled systems",
    "engineering",
    "businessanalyse",
    "technische implementatie",
    "verbinden",
  ],
  // De centrale AI-knoop moet vindbaar zijn op de actuele rolrichting uit de
  // hero, niet alleen op de losse term "AI".
  "skill-ai": [
    "ai-gedreven systemen",
    "ai-enabled systems",
    "bouwen",
    "building",
  ],
  // De skill-node heet in de content Engels "Functional Analysis"; NL-bezoekers
  // zoeken op deze Nederlandse varianten van hetzelfde begrip.
  "skill-functional-analysis": [
    "functionele analyse",
    "businessanalyse",
    "functioneel analist",
    "requirements",
  ],
  // De intro claimt letterlijk "technisch degelijk"; de losse term
  // "betrouwbaarheid/reliability" ontbreekt maar wordt door die claim gedragen.
  "system-lowi-intro": ["betrouwbaarheid", "reliability", "degelijk"],
  // De transparantienote gebruikt samenstellingen ("privacyvriendelijke",
  // "advertentiecookies"); losse kerntermen maken de chunk vindbaar.
  "system-privacy-analytics": [
    "privacy",
    "analytics",
    "tracking",
    "cookies",
    "transparantie",
    "transparency",
  ],
  // Nidus heeft in de content expliciet status "In productie" — het is dus een
  // gebouwd, draaiend systeem; die status is een Bilingual-veld en geen
  // doorzoekbare tekst, daarom hier als termen.
  "system-lowi-nidus": [
    "productie",
    "production",
    "automatisering",
    "automation",
    "gebouwd",
    "built",
  ],
  // Het Pi-netwerk is fysieke, draaiende infrastructuur; termen voor
  // hardware-/productievragen die niet letterlijk in de beschrijving staan.
  "project-pi-network": ["sensornetwerk", "hardware", "productie", "production", "iot"],
};

function curatedFor(chunkId: string): string[] {
  return CURATED_KEYWORDS[chunkId] ?? [];
}

function buildExperienceChunks(): KnowledgeChunk[] {
  return placeholderContent.experience.map((entry) => {
    const orgSlug = slugify(primaryName(entry.company));
    const id = `experience-${orgSlug}`;
    return {
      id,
      sourceType: "experience",
      sourceId: orgSlug,
      title: {
        nl: `${entry.role.nl} — ${entry.company}`,
        en: `${entry.role.en} — ${entry.company}`,
      },
      // Periode en bedrijf horen bij de doorzoekbare tekst van de ervaring.
      content: {
        nl: `${entry.description.nl} (${entry.company}, ${entry.period})`,
        en: `${entry.description.en} (${entry.company}, ${entry.period})`,
      },
      keywords: uniqueKeywords(
        [primaryName(entry.company)],
        SOURCE_TYPE_KEYWORDS.experience,
        curatedFor(id)
      ),
      tags: ["experience", entry.motif],
      sensitivity: "public",
    };
  });
}

function buildProjectChunks(): KnowledgeChunk[] {
  return placeholderContent.projects.map((project) => {
    const id = `project-${project.id}`;
    // xrayBreakdown levert extra technische termen op (lagen + items).
    const xrayLayers = project.xrayBreakdown?.map((layer) => layer.layer) ?? [];
    const xrayItems = project.xrayBreakdown?.flatMap((layer) => layer.items) ?? [];
    return {
      id,
      sourceType: "project",
      sourceId: project.id,
      title: project.title,
      content: project.description,
      keywords: uniqueKeywords(
        project.tech,
        xrayItems,
        SOURCE_TYPE_KEYWORDS.project,
        curatedFor(id)
      ),
      tags: uniqueKeywords(["project"], xrayLayers),
      sensitivity: "public",
    };
  });
}

function buildSkillChunks(): KnowledgeChunk[] {
  const nodeNameById = new Map(
    placeholderContent.skillNodes.map((node) => [node.id, node.name])
  );
  const projectTitleById = new Map(
    placeholderContent.projects.map((project) => [project.id, project.title])
  );

  return placeholderContent.skillNodes.map((node) => {
    const id = `skill-${node.id}`;
    const connectionNames = node.connections
      .map((connectionId) => nodeNameById.get(connectionId))
      .filter((name): name is string => Boolean(name));
    const relatedTitles = node.relatedProjectIds
      .map((projectId) => projectTitleById.get(projectId))
      .filter((title): title is Bilingual => Boolean(title));

    // SkillNodes hebben zelf geen beschrijving; de chunk-tekst wordt opgebouwd
    // uit de échte relaties in de graaf (verbindingen + gerelateerde projecten).
    return {
      id,
      sourceType: "skill",
      sourceId: node.id,
      title: { nl: node.name, en: node.name },
      content: {
        nl: `${node.name} is een knoop in de skill-constellatie, verbonden met ${connectionNames.join(", ")}. Toegepast in: ${relatedTitles.map((title) => title.nl).join("; ")}.`,
        en: `${node.name} is a node in the skill constellation, connected to ${connectionNames.join(", ")}. Applied in: ${relatedTitles.map((title) => title.en).join("; ")}.`,
      },
      keywords: uniqueKeywords(
        [node.name],
        connectionNames,
        SOURCE_TYPE_KEYWORDS.skill,
        curatedFor(id)
      ),
      tags: ["skill", ...node.relatedProjectIds],
      sensitivity: "public",
    };
  });
}

function buildEducationChunks(): KnowledgeChunk[] {
  return placeholderContent.education.map((entry) => {
    const institutionSlug = slugify(primaryName(entry.institution));
    const id = `education-${institutionSlug}`;
    return {
      id,
      sourceType: "education",
      sourceId: institutionSlug,
      title: {
        nl: `${entry.degree.nl} — ${entry.institution}`,
        en: `${entry.degree.en} — ${entry.institution}`,
      },
      content: {
        nl: `${entry.degree.nl} aan ${entry.institution} (${entry.period}).`,
        en: `${entry.degree.en} at ${entry.institution} (${entry.period}).`,
      },
      keywords: uniqueKeywords(
        [primaryName(entry.institution)],
        SOURCE_TYPE_KEYWORDS.education,
        curatedFor(id)
      ),
      tags: entry.motif ? ["education", entry.motif] : ["education"],
      sensitivity: "public",
    };
  });
}

function architectureLabelFor(nodeId: string): string {
  return (
    ARCHITECTURE_NODES.find((node) => node.id === nodeId)?.label ?? nodeId
  );
}

function buildArchitectureChunks(): KnowledgeChunk[] {
  const nidus = placeholderContent.lowi.projects.find(
    (project) => slugify(project.name) === "nidus"
  );
  const nodeLabels = ARCHITECTURE_NODES.map((node) => node.label);
  const connectionSummary = ARCHITECTURE_CONNECTIONS.map(
    ([fromId, toId]) =>
      `${architectureLabelFor(fromId)} -> ${architectureLabelFor(toId)}`
  ).join("; ");

  return [
    {
      id: "architecture-system-overview",
      sourceType: "architecture",
      sourceId: "components/ArchitectureScene.tsx",
      title: {
        nl: "Systeemarchitectuur",
        en: "System architecture",
      },
      content: {
        nl: `${nidus?.description.nl ?? ""} Architectuurgrafiek: ${nodeLabels.join(", ")}. Verbindingen: ${connectionSummary}.`,
        en: `${nidus?.description.en ?? ""} Architecture graph: ${nodeLabels.join(", ")}. Connections: ${connectionSummary}.`,
      },
      keywords: uniqueKeywords(
        nodeLabels,
        ARCHITECTURE_NODES.map((node) => node.id),
        SOURCE_TYPE_KEYWORDS.architecture
      ),
      tags: uniqueKeywords(
        ["architecture", "architectuur", "stack", "system"],
        ARCHITECTURE_NODES.map((node) => node.id)
      ),
      sensitivity: "public",
    },
  ];
}

function buildSystemChunks(): KnowledgeChunk[] {
  const { aboutMe, lowi, sectionTitles, uiLabels } = placeholderContent;

  const chunks: KnowledgeChunk[] = [
    // De recente over-mij-tekst (aboutMe) — kern van het profielverhaal.
    {
      id: "system-about-me",
      sourceType: "system",
      sourceId: "about-me",
      title: aboutMe.heading,
      content: aboutMe.body,
      keywords: uniqueKeywords(
        // hero.focusAreas zijn bestaande contenttermen die het profiel typeren.
        placeholderContent.hero.focusAreas,
        SOURCE_TYPE_KEYWORDS.system,
        curatedFor("system-about-me")
      ),
      tags: ["system", "profile"],
      sensitivity: "public",
    },
    // De LOWI-intro: wat het platform is en hoe Klaas denkt/bouwt.
    {
      id: "system-lowi-intro",
      sourceType: "system",
      sourceId: "lowi-intro",
      title: sectionTitles.lowi,
      content: lowi.intro,
      keywords: uniqueKeywords(
        SOURCE_TYPE_KEYWORDS.system,
        curatedFor("system-lowi-intro")
      ),
      tags: ["system", "lowi"],
      sensitivity: "public",
    },
    // De analytics-transparantienote is bestaande content die het privacy-
    // standpunt van de site draagt; zonder deze chunk zou een privacyvraag
    // geen enkele echte bron hebben.
    {
      id: "system-privacy-analytics",
      sourceType: "system",
      sourceId: "privacy-analytics",
      title: {
        nl: "Privacy & analytics-aanpak",
        en: "Privacy & analytics approach",
      },
      content: uiLabels.analyticsTransparencyNote,
      keywords: uniqueKeywords(
        SOURCE_TYPE_KEYWORDS.system,
        curatedFor("system-privacy-analytics")
      ),
      tags: ["system", "privacy"],
      sensitivity: "public",
    },
  ];

  // Elk LOWI-project (Nidus, CRISPR & CHICKN) als systeem-chunk — dit zijn de
  // echte, recent toegevoegde beschrijvingen uit lowi.projects.
  for (const project of lowi.projects) {
    const projectSlug = slugify(project.name);
    const id = `system-lowi-${projectSlug}`;
    chunks.push({
      id,
      sourceType: "system",
      sourceId: `lowi-${projectSlug}`,
      title: {
        nl: `${project.name} — ${project.tagline.nl}`,
        en: `${project.name} — ${project.tagline.en}`,
      },
      content: project.description,
      keywords: uniqueKeywords(
        [project.name],
        // De status ("In productie" / "In production") is doorzoekbare context.
        [project.status.nl, project.status.en],
        SOURCE_TYPE_KEYWORDS.system,
        curatedFor(id)
      ),
      tags: ["system", "lowi", projectSlug],
      sensitivity: "public",
    });
  }

  return chunks;
}

function buildKnowledgeBase(): KnowledgeChunk[] {
  return [
    ...buildExperienceChunks(),
    ...buildProjectChunks(),
    ...buildSkillChunks(),
    ...buildEducationChunks(),
    ...buildArchitectureChunks(),
    ...buildSystemChunks(),
  ];
}

// Module-level cache: de knowledge base is deterministisch afgeleid van
// statische content en hoeft maar één keer opgebouwd te worden.
let cachedKnowledgeBase: KnowledgeChunk[] | null = null;

export function getKnowledgeBase(): KnowledgeChunk[] {
  if (cachedKnowledgeBase === null) {
    cachedKnowledgeBase = buildKnowledgeBase();
  }
  return cachedKnowledgeBase;
}
