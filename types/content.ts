// Eén bron van waarheid voor de vorm van alle CV-content.
// Deze interfaces matchen 1-op-1 met de kolommen van de toekomstige
// Supabase-tabel `portfolio_content` in het bestaande Nidus-project
// (elke top-level property van PortfolioContent = één jsonb-kolom).

export interface Bilingual {
  nl: string;
  en: string;
}

// Taal van een pagina; komt uit de route ("/" = nl, "/en/…" = en).
export type Language = keyof Bilingual;

export type CareerMotif = "soundwave" | "stage-lights" | "blueprint" | "flowchart";

// Datum zoals JSON Resume ze toelaat: "2021", "2021-02" of "2021-02-01".
// Alles na het jaar is optioneel; de bron bepaalt hoe precies we kunnen zijn.
export type IsoDatePart =
  | `${number}`
  | `${number}-${number}`
  | `${number}-${number}-${number}`;

// Rolfase: "incoming" = nieuwe functie aangekondigd maar nog niet begonnen,
// "current" = de functie loopt. Handmatig schakelen, geen datumlogica.
export type RolePhase = "incoming" | "current";

export interface EmployerInfo {
  name: string;
  legalName?: string;
  shortName?: string; // hoe de werkgever in lopende tekst genoemd wordt
}

// Centrale rolgegevens (content/role.ts). Alles wat per fase verschilt —
// metadata, JSON-LD, statuslabel, about, Jarvis, OG-ondertitel — leidt hieruit af.
export interface RoleInfo {
  role: string; // Engelse functietitel, ook in JSON-LD
  employer: EmployerInfo;
  // ISO 8601 (YYYY-MM-DD). Enige bron van de startdatum: de leesbare tekst
  // wordt eruit afgeleid met formatLongDate() in content/role.ts.
  startDate: string;
  previousRole: {
    title: string;
    employer: EmployerInfo;
    endDate: IsoDatePart; // laatste maand, gebruikt zodra de fase "current" is
  };
}

export interface HeroContent {
  name: string;
  currentRole: Bilingual; // nl: "Functioneel Analist", en: "Functional Analyst"
  targetRole: Bilingual; // doelrichting, niet huidige titel
  thesis: Bilingual; // max ~18 woorden
  identityLine: Bilingual;
  focusAreas: string[];
  liveLabel: Bilingual | null; // null = geen statusbadge tonen
}

export interface AboutMeContent {
  heading: Bilingual;
  body: Bilingual;
}

export interface ExperienceEntry {
  role: Bilingual; // max ~4 woorden
  company: string; // enkel de eigennaam
  // Kwalificatie bij de opdracht ("vrijwilliger", "project bij FOD Financiën").
  // De site toont hem tussen haakjes achter de naam; /cv.json zet hem in
  // work.description.
  companyNote?: Bilingual;
  period: string; // weergave op de site; blijft leidend voor de UI
  // Tweetalige override op `period`, gebruikt door fase-afhankelijke entries.
  periodLabel?: Bilingual;
  // Gestructureerde datums voor /cv.json. Geen endDate = lopend.
  startDate: IsoDatePart;
  endDate?: IsoDatePart;
  motif: CareerMotif;
  description: Bilingual; // max ~25 woorden
}

export interface EducationEntry {
  degree: Bilingual; // max ~6 woorden
  institution: string;
  period: string; // weergave op de site
  startDate: IsoDatePart;
  endDate?: IsoDatePart;
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
  // NL-basispad naar een uitgebreide case study, bv. "/nidus". Componenten
  // zetten het per taal om met localizedPath(); geen aparte /en-waarde.
  caseStudyPath?: string;
  caseStudyLinkLabel?: Bilingual; // project-specifieke override op het generieke label
  jarvisExplanationId?: string; // toont CTA en koppelt aan een bestaande Jarvis-uitleg
}

export interface LowiContent {
  intro: Bilingual;
  // NL-basispad naar de scroll-gedreven celpagina, "/lowi"; per taal omgezet
  // met localizedPath().
  celPath: string;
  celLinkLabel: Bilingual; // knoplabel vanuit de sectie-intro naar die pagina
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

// Eén vaardigheidscluster in de proof-first Skills-sectie ("Wat ik bouw").
// Geen niveaus of scores — de context-regel verankert de skill in wat live
// draait, niet in een zelfverklaarde score.
export interface SkillCluster {
  id: string;
  title: Bilingual;
  context: Bilingual; // één eerlijke zin: waar de skill echt gebruikt is
  // Tweetalige chips. Eigennamen (Next.js, RAG, Supabase…) zijn in beide talen
  // gelijk; NL en EN blijven per item gekoppeld, zodat volgorde en aantal
  // niet uit elkaar kunnen lopen.
  items: Bilingual[];
  proofAnchor?: "nidus" | null; // toont een subtiele "→ Nidus"-link naar de /nidus case-study
}

// De volledige Skills-sectie: proof-first onderregel + de clusters.
export interface SkillsSection {
  lead: Bilingual; // korte proof-first onderregel onder de sectietitel
  proofLinkLabel: Bilingual; // zichtbare tekst van de bewijslink ("→ Nidus")
  clusters: SkillCluster[];
}

export interface ContactInfo {
  email: string;
  linkedinUrl: string;
  location: Bilingual;
  cvPdfUrl: string; // pad op het eigen domein, bv. "/cv.pdf" (rewrite in next.config.ts)
  cvPdfAvailable: boolean; // false verbergt de downloadknop
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
  caseStudyLinkLabel: Bilingual; // knoplabel naar een interne case-study route
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
  skillsSection: SkillsSection;
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
