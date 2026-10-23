import {
  lowiCelHoofdstukken,
  lowiCelIntro,
  lowiCelMeta,
  lowiCelSlot,
} from "@/content/lowiCellContent";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { placeholderContent } from "@/content/placeholderContent";
import { ROLE_PHASE, aboutBodyFor, roleTagline } from "@/content/role";
import { experienceFor } from "@/lib/experience";
import type { MarkdownPageSlug } from "@/lib/markdownRoutes";
import { absoluteUrl, localizedPath, otherLanguage } from "@/lib/site";
import { SOCIAL_PROFILES } from "@/lib/structuredData";
import type { Bilingual, Language, RolePhase } from "@/types/content";

// Markdown-versies van de inhoudelijke pagina's, voor agents die
// "Accept: text/markdown" sturen (zie lib/markdownRoutes.ts).
//
// Zelfde taal en zelfde inhoud als de HTML-pagina op die URL: een Markdown-
// versie van /nidus is Nederlands, die van /en/nidus Engels. Alles komt uit de
// bestaande content, zodat de twee formaten niet uit elkaar kunnen lopen.
// Interactieve en placeholder-onderdelen (Jarvis, live-statistieken, de
// nagebouwde schermen) staan er niet in: die hebben geen tekstinhoud die een
// agent iets leert.
//
// Links zijn absoluut: een agent kan de Markdown los van de site bewaren.

const LABELS = {
  otherFormats: { nl: "Andere formaten", en: "Other formats" },
  thisPageHtml: { nl: "Deze pagina als HTML", en: "This page as HTML" },
  otherLanguage: { nl: "English version", en: "Nederlandse versie" },
  cvJson: { nl: "CV als JSON Resume", en: "CV as JSON Resume" },
  cvPdf: { nl: "CV als PDF", en: "CV as PDF" },
  llmsTxt: {
    nl: "Overzicht voor AI-agents (llms.txt, Engels)",
    en: "Overview for AI agents (llms.txt)",
  },
  sitemap: { nl: "Sitemap", en: "Sitemap" },
  email: { nl: "E-mail", en: "Email" },
  location: { nl: "Locatie", en: "Location" },
  status: { nl: "Status", en: "Status" },
  inTheCell: { nl: "In de cel", en: "In the cell" },
  inLowi: { nl: "In LOWI", en: "In LOWI" },
  principles: { nl: "Architectuurprincipes", en: "Architecture principles" },
  component: { nl: "Component", en: "Component" },
  technology: { nl: "Technologie", en: "Technology" },
  hosting: { nl: "Hosting", en: "Hosting" },
  role: { nl: "Rol", en: "Role" },
  lowiVisualNote: {
    nl: "Op de HTML-pagina wordt dit verteld als scroll-gedreven verhaal over één cel, met een 3D-visualisatie (artistiek, niet op schaal).",
    en: "The HTML page tells this as a scroll-driven story about a single cell, with a 3D visualisation (artistic, not to scale).",
  },
  screenshotsNote: {
    nl: "De HTML-pagina toont nagebouwde schermen van de web-app.",
    en: "The HTML page shows rebuilt screens of the web app.",
  },
} satisfies Record<string, Bilingual>;

function link(label: string, path: string): string {
  return `[${label}](${absoluteUrl(path)})`;
}

// Een "|" in een cel zou de tabel breken.
function tableCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function profileLinks(): string[] {
  const names: Record<keyof typeof SOCIAL_PROFILES, string> = {
    linkedin: "LinkedIn",
    github: "GitHub",
    x: "X",
  };

  return Object.entries(SOCIAL_PROFILES)
    .filter(([, profileUrl]) => profileUrl.trim() !== "")
    .map(
      ([network, profileUrl]) =>
        `- ${names[network as keyof typeof SOCIAL_PROFILES]}: ${profileUrl}`,
    );
}

// Vaste voet onder elke pagina: waar de HTML, de vertaling en de
// machineleesbare bestanden staan.
function footer(basePath: `/${string}`, language: Language): string[] {
  const htmlPath = localizedPath(basePath, language);
  const translatedPath = localizedPath(basePath, otherLanguage(language));

  return [
    "---",
    "",
    `## ${LABELS.otherFormats[language]}`,
    "",
    `- ${link(LABELS.thisPageHtml[language], htmlPath)}`,
    `- ${link(LABELS.otherLanguage[language], translatedPath)}`,
    `- ${link(LABELS.cvJson[language], "/cv.json")}`,
    `- ${link(LABELS.cvPdf[language], "/cv.pdf")}`,
    `- ${link(LABELS.llmsTxt[language], "/llms.txt")}`,
    `- ${link(LABELS.sitemap[language], "/sitemap.xml")}`,
  ];
}

export function homeMarkdown(
  language: Language,
  phase: RolePhase = ROLE_PHASE,
): string {
  const {
    hero,
    aboutMe,
    education,
    languageSkills,
    skillsSection,
    lowi,
    projects,
    contact,
    sectionTitles,
  } = placeholderContent;

  // Nieuwste functie eerst, zoals in /cv.json: een agent zoekt de huidige rol.
  const experience = [...experienceFor(phase)].reverse().flatMap((entry) => {
    const note = entry.companyNote ? ` (${entry.companyNote[language]})` : "";
    const period = entry.periodLabel?.[language] ?? entry.period;
    return [
      `### ${entry.role[language]} — ${entry.company}${note}`,
      "",
      period,
      "",
      entry.description[language],
      "",
    ];
  });

  const lowiProjects = lowi.projects.flatMap((project) => [
    `### ${project.name}`,
    "",
    `*${project.tagline[language]}* · ${LABELS.status[language]}: ${project.status[language]}`,
    "",
    project.description[language],
    "",
    ...(project.caseStudyPath
      ? [
          link(
            project.caseStudyLinkLabel?.[language] ?? project.name,
            localizedPath(project.caseStudyPath, language),
          ),
          "",
        ]
      : []),
  ]);

  const lines = [
    `# ${hero.name}`,
    "",
    `> ${roleTagline[language]} · ${contact.location[language]}`,
    "",
    hero.thesis[language],
    "",
    `## ${aboutMe.heading[language]}`,
    "",
    aboutBodyFor(phase)[language],
    "",
    `## ${sectionTitles.experience[language]}`,
    "",
    ...experience,
    `## ${sectionTitles.lowi[language]}`,
    "",
    lowi.intro[language],
    "",
    link(lowi.celLinkLabel[language], localizedPath(lowi.celPath, language)),
    "",
    ...lowiProjects,
    `## ${sectionTitles.education[language]}`,
    "",
    ...education.map(
      (entry) =>
        `- **${entry.degree[language]}**, ${entry.institution} (${entry.period})`,
    ),
    "",
    `## ${sectionTitles.languages[language]}`,
    "",
    ...languageSkills.map(
      (skill) => `- ${skill.language[language]}: ${skill.level[language]}`,
    ),
    "",
    `## ${sectionTitles.skills[language]}`,
    "",
    ...skillsSection.clusters.flatMap((cluster) => [
      `### ${cluster.title[language]}`,
      "",
      cluster.context[language],
      "",
      cluster.items.map((item) => item[language]).join(", "),
      "",
    ]),
    `## ${sectionTitles.projects[language]}`,
    "",
    ...projects.map(
      (project) =>
        `- **${project.title[language]}**: ${project.description[language]} (${project.tech.join(", ")})`,
    ),
    "",
    `## ${sectionTitles.contact[language]}`,
    "",
    `- ${LABELS.email[language]}: [${contact.email}](mailto:${contact.email})`,
    ...profileLinks(),
    `- ${LABELS.location[language]}: ${contact.location[language]}`,
    "",
    ...footer("/", language),
  ];

  return `${lines.join("\n")}\n`;
}

export function nidusMarkdown(language: Language): string {
  const { intro, meta, architecture, principles, decisionLog, sectionTitles } =
    nidusCaseStudy;

  const lines = [
    `# ${intro.title[language]}`,
    "",
    `> ${intro.subtitle[language]}`,
    "",
    meta.description[language],
    "",
    `## ${sectionTitles.architecture[language]}`,
    "",
    `| ${LABELS.component[language]} | ${LABELS.technology[language]} | ${LABELS.hosting[language]} | ${LABELS.role[language]} |`,
    "| --- | --- | --- | --- |",
    ...architecture.map(
      (component) =>
        `| ${[
          component.name,
          component.tech,
          component.hosting,
          component.role[language],
        ]
          .map(tableCell)
          .join(" | ")} |`,
    ),
    "",
    `### ${LABELS.principles[language]}`,
    "",
    ...principles.map((principle) => `- ${principle[language]}`),
    "",
    `## ${sectionTitles.decisionLog[language]}`,
    "",
    ...decisionLog.flatMap((entry) => [
      `### ${entry.title[language]}`,
      "",
      entry.date,
      "",
      entry.description[language],
      "",
    ]),
    `## ${sectionTitles.screenshots[language]}`,
    "",
    `${LABELS.screenshotsNote[language]} ${nidusCaseStudy.mockupNote[language]}`,
    "",
    ...footer("/nidus", language),
  ];

  return `${lines.join("\n")}\n`;
}

export function lowiMarkdown(language: Language): string {
  const chapters = lowiCelHoofdstukken.flatMap((chapter, index) => [
    `## ${String(index + 1).padStart(2, "0")} · ${chapter.titel[language]}`,
    "",
    `**${chapter.kernzin[language]}**`,
    "",
    `${LABELS.inTheCell[language]}: ${chapter.biologie[language]}`,
    "",
    `${LABELS.inLowi[language]}: ${chapter.lowi[language]}`,
    "",
  ]);

  const lines = [
    `# ${lowiCelMeta.title[language]}`,
    "",
    `> ${lowiCelIntro.ondertitel[language]}`,
    "",
    lowiCelMeta.description[language],
    "",
    LABELS.lowiVisualNote[language],
    "",
    ...chapters,
    `## ${lowiCelSlot.titel[language]}`,
    "",
    lowiCelSlot.tekst[language],
    "",
    link(lowiCelSlot.ctaLabel[language], localizedPath(lowiCelSlot.ctaHref, language)),
    "",
    ...footer("/lowi", language),
  ];

  return `${lines.join("\n")}\n`;
}

export function markdownFor(slug: MarkdownPageSlug, language: Language): string {
  switch (slug) {
    case "home":
      return homeMarkdown(language);
    case "nidus":
      return nidusMarkdown(language);
    case "lowi":
      return lowiMarkdown(language);
  }
}

// Antwoord voor een URL die niet bestaat. Tweetalig in één bestand: de URL
// zegt niets over de gevraagde taal. Engels eerst, zoals llms.txt.
export function notFoundMarkdown(): string {
  const lines = [
    "# 404 — Page not found",
    "",
    "This URL does not exist on the website of Klaas Vanslambrouck. It may have been moved, or the link may contain a typo.",
    "",
    "Deze URL bestaat niet op de website van Klaas Vanslambrouck.",
    "",
    "## Where to go instead",
    "",
    `- ${link("Homepage (Dutch)", "/")}: CV, career, skills and projects.`,
    `- ${link("Homepage (English)", "/en")}: the same content in English.`,
    `- ${link("llms.txt", "/llms.txt")}: overview of the site for AI agents, with every page and when to use this profile.`,
    `- ${link("Sitemap", "/sitemap.xml")}: every indexable URL on this domain.`,
    `- ${link("CV as JSON Resume", "/cv.json")}: the full CV as structured data.`,
    "",
    "Every page on this site is also available as Markdown: request it with `Accept: text/markdown`.",
  ];

  return `${lines.join("\n")}\n`;
}
