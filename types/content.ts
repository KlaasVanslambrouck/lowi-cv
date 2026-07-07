// Eén bron van waarheid voor de vorm van alle CV-content.
// Deze interfaces matchen 1-op-1 met de kolommen van de toekomstige
// Supabase-tabel `portfolio_content` in het bestaande Nidus-project
// (elke top-level property van PortfolioContent = één jsonb-kolom).

export interface Bilingual {
  nl: string;
  en: string;
}

export type CareerMotif = "soundwave" | "stage-lights" | "blueprint" | "flowchart";

export interface HeroContent {
  name: string;
  currentRole: Bilingual; // nl: "Functioneel Analist", en: "Functional Analyst"
  targetRole: Bilingual; // nl/en: "AI Business Engineer" — doel, niet huidige titel
  thesis: Bilingual; // max ~18 woorden
  identityLine: Bilingual;
  focusAreas: string[];
  liveLabel: Bilingual;
}

export interface AboutMeContent {
  heading: Bilingual;
  body: Bilingual;
}

export interface ExperienceEntry {
  role: Bilingual; // max ~4 woorden
  company: string;
  period: string;
  motif: CareerMotif;
  description: Bilingual; // max ~25 woorden
}

export interface EducationEntry {
  degree: Bilingual; // max ~6 woorden
  institution: string;
  period: string;
  motif?: CareerMotif;
}

export interface LanguageSkill {
  language: Bilingual;
  level: Bilingual;
}

export interface LowiProject {
  name: string;
  tagline: Bilingual; // max ~10 woorden
  description: Bilingual;
  status: Bilingual;
  url?: string;
}

export interface LowiContent {
  intro: Bilingual;
  projects: LowiProject[];
}

export interface Skill {
  name: string;
}

// Eén architectuurlaag in de X-ray-weergave van een project
export interface XrayLayer {
  layer: string; // bv. "UI", "DATA", "OPS" — taalonafhankelijke systeemtermen
  items: string[];
}

export interface Project {
  id: string; // stabiele sleutel, gebruikt door SkillNode.relatedProjectIds
  title: Bilingual;
  description: Bilingual; // max ~25 woorden
  codeSnippet: string;
  tech: string[];
  xrayBreakdown?: XrayLayer[]; // technische boomstructuur voor X-ray modus
}

export interface LiveStat {
  value: string;
  label: Bilingual; // max ~4 woorden
}

export interface JarvisPlaceholderMessage {
  role: "user" | "jarvis";
  text: Bilingual;
}

// Systeem-observatie die JarvisPresence toont per zichtbare sectie
export interface JarvisObservation {
  sectionId: string; // matcht data-section-id van de sectie
  text: Bilingual; // max ~8 woorden, voelt als logregel
  proactiveSuggestion?: Bilingual;
  suggestedQuestion?: Bilingual;
}

export interface JarvisExplanation {
  id: string;
  title: Bilingual;
  contextLabel: Bilingual;
  summary: Bilingual;
  signals: Bilingual[];
  relevance: Bilingual;
}

// Skill-node in de SkillConstellation-graaf
export interface SkillNode {
  id: string;
  name: string; // bv. "AI", "LLMs", "Functional Analysis"
  connections: string[]; // ids van verbonden SkillNode's
  relatedProjectIds: string[]; // matcht Project.id
}

export interface ContactInfo {
  email: string;
  linkedinUrl: string;
  location: Bilingual;
  cvPdfUrl: string;
  cvPdfAvailable: boolean; // pas true zodra het PDF-bestand echt in /public staat
}

// Titels van de paginasecties — ook content, dus niet hardcoded in JSX.
export interface SectionTitles {
  experience: Bilingual;
  education: Bilingual;
  languages: Bilingual;
  skills: Bilingual;
  lowi: Bilingual;
  projects: Bilingual;
  liveStats: Bilingual;
  aiPlayground: Bilingual;
  jarvis: Bilingual;
  contact: Bilingual;
}

// Kleine UI-teksten (knoppen, hints) die per taal verschillen.
export interface UILabels {
  downloadCv: Bilingual;
  jarvisNote: Bilingual; // uitleg dat Jarvis nog niet live is
  jarvisInputPlaceholder: Bilingual;
  jarvisTerminalTitle: string; // terminal-venstertitel, taalonafhankelijk
  liveStatsNote: Bilingual; // disclaimer dat de cijfers placeholders zijn
  xrayNormalLabel: string; // modusnaam, taalonafhankelijk ("NORMAL")
  xrayActiveLabel: string; // modusnaam, taalonafhankelijk ("X-RAY")
  xrayToggleAria: Bilingual; // aria-label voor de X-ray-knop
  themeDarkLabel: string; // modusnaam, taalonafhankelijk ("DARK")
  themeLightLabel: string; // modusnaam, taalonafhankelijk ("LIGHT")
  themeToggleAria: Bilingual; // aria-label voor de theme-knop
  xrayStatDetail: Bilingual; // extra technische regel onder LiveStatBadge
  explodeToggle: Bilingual; // knoplabel voor de exploded-view op ProjectCard
  constellationHint: Bilingual; // hint in het paneel als niets gehoverd is
  constellationProjectsLabel: Bilingual; // "gebruikt in" / "used in"
  jarvisPresenceLabel: string; // prefix van het presence-paneel, taalonafhankelijk
  jarvisExplainButton: Bilingual;
  jarvisExplainClose: Bilingual;
  jarvisExplainStatus: Bilingual;
  jarvisExplainRelevanceLabel: Bilingual;
  jarvisProactiveAsk: Bilingual;
  analyticsTransparencyNote: Bilingual;
}

// De volledige content-payload zoals die later uit `portfolio_content` komt.
export interface PortfolioContent {
  hero: HeroContent;
  aboutMe: AboutMeContent;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  languageSkills: LanguageSkill[];
  skills: Skill[];
  skillNodes: SkillNode[];
  lowi: LowiContent;
  projects: Project[];
  liveStats: LiveStat[];
  jarvisMessages: JarvisPlaceholderMessage[];
  jarvisObservations: JarvisObservation[];
  jarvisExplanations: JarvisExplanation[];
  contact: ContactInfo;
  sectionTitles: SectionTitles;
  uiLabels: UILabels;
}
