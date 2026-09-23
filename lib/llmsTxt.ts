import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { placeholderContent } from "@/content/placeholderContent";
import { ROLE_PHASE, resumeLabelFor } from "@/content/role";
import { absoluteUrl, localizedPath } from "@/lib/site";
import { SOCIAL_PROFILES, lowiSchema } from "@/lib/structuredData";
import type { RolePhase } from "@/types/content";

// /llms.txt volgens de conventie van llmstxt.org: H1, blockquote-samenvatting,
// korte context, daarna H2-secties met links en één zin per link.
// Engels, want dit bestand is voor agents; de site zelf is Nederlands.
// Alle inhoud komt uit de bestaande bronnen, zodat dit bestand niet los kan
// gaan lopen van de site.
//
// DERDE PERSOON: agents citeren dit bestand vaak letterlijk, en dan als
// beschrijving van Klaas, niet als zijn eigen woorden. De sitecopy staat in de
// ik-vorm ("Ik vertaal…", "my daily life"), dus waar die vorm doorwerkt staat
// hieronder een eigen Engelse variant in de derde persoon.

// Derde-persoonsvariant van hero.thesis.en.
const THESIS_SUMMARY =
  "Translates complex business and systems context into working AI systems: from analysis to prototype, product architecture and rollout.";

// Derde-persoonsvariant van de tagline van Nidus (die zegt "my daily life").
const NIDUS_SUMMARY =
  "household intelligence platform that Klaas built and uses daily (web, mobile, API, ML workers)";

function markdownLink(label: string, path: string): string {
  return `[${label}](${absoluteUrl(path)})`;
}

// Elke inhoudelijke pagina bestaat in twee talen. Eén bullet per pagina, met de
// Engelse URL erbij, houdt de beschrijving op één plek: een aparte Engelse
// sectie zou elke zin verdubbelen en kan uit elkaar gaan lopen. De vorm blijft
// "link: één zin", zoals de rest van het bestand.
function pageLine(label: string, basePath: `/${string}`, description: string): string {
  const englishPath = localizedPath(basePath, "en");
  return `- ${markdownLink(label, basePath)} (English: ${markdownLink(englishPath, englishPath)}): ${description}`;
}

// De schemabeschrijving noemt de eigenaar ("lab of Klaas Vanslambrouck"); in
// deze alinea staat die naam al in de zin ervoor. We laten de schema-tekst
// ongemoeid en knippen hier alleen die ene bezitsvorm eruit.
function withoutOwnerName(description: string, ownerName: string): string {
  return description.replace(` of ${ownerName}`, "");
}

function profileLine(): string {
  const profiles = Object.entries(SOCIAL_PROFILES)
    .filter(([, profileUrl]) => profileUrl.trim() !== "")
    .map(([network, profileUrl]) => {
      const label =
        network === "linkedin" ? "LinkedIn" : network === "github" ? "GitHub" : "X";
      return `[${label}](${profileUrl})`;
    });

  return `Canonical profiles: ${profiles.join(", ")}.`;
}

export function buildLlmsTxt(phase: RolePhase = ROLE_PHASE): string {
  const { hero, contact, lowi } = placeholderContent;
  const lowiOrganization = lowiSchema();
  const [lowiShortName, lowiLongName] = lowiOrganization.alternateName;
  const [nidus, crisprChickn] = lowi.projects;

  const lines = [
    `# ${hero.name}`,
    "",
    // Rol, locatie en de kern van de hero-thesis.
    `> ${resumeLabelFor(phase)} — ${contact.location.en} (Ghent area). ${THESIS_SUMMARY}`,
    "",
    "The website is in Dutch at / and in English under /en; both versions carry the same content. This file is in English for machine readers.",
    "",
    [
      `${lowiShortName} (${lowiLongName}) is ${hero.name}'s personal lab.`,
      `It is not related to lowi.nl (Landelijk Orgaan Wetenschappelijke Integriteit).`,
      withoutOwnerName(lowiOrganization.description, hero.name),
      profileLine(),
    ].join(" "),
    "",
    "## Pages",
    "",
    pageLine(
      `${hero.name} — ${resumeLabelFor(phase)}`,
      "/",
      "CV, career timeline, skills and projects; the main profile page.",
    ),
    pageLine(
      nidusCaseStudy.intro.title.en,
      "/nidus",
      `${nidusCaseStudy.intro.subtitle.en} — architecture, decision log and screenshots.`,
    ),
    pageLine(
      lowiOrganization.name,
      "/lowi",
      "the lab itself, told as a scroll-driven story about a cell.",
    ),
    "",
    "## Machine-readable",
    "",
    `- ${markdownLink("CV in JSON Resume format", "/cv.json")}: the full CV as structured JSON (jsonresume.org schema v1).`,
    `- ${markdownLink("CV as PDF", "/cv.pdf")}: the same CV as a downloadable document.`,
    `- ${markdownLink("Sitemap", "/sitemap.xml")}: every indexable page on this domain.`,
    "",
    "## Projects",
    "",
    `- ${markdownLink(nidus.name, "/nidus")}: ${NIDUS_SUMMARY}. Status: ${nidus.status.en}.`,
    `- ${crisprChickn.name}: ${crisprChickn.tagline.en}. Status: ${crisprChickn.status.en}.`,
    "",
    "## Contact",
    "",
    `- [${contact.email}](mailto:${contact.email}): direct email; the fastest way to reach ${hero.name}.`,
    // Een "## Optional"-sectie met /blog volgt zodra die route bestaat.
    "",
  ];

  return lines.join("\n");
}
