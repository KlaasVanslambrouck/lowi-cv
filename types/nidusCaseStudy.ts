// Vorm van de content voor de losstaande Nidus case-study pagina (/nidus).
// Los van PortfolioContent/content.ts omdat dit geen kolom is van de
// toekomstige `portfolio_content`-tabel, maar contentbron van een eigen route.

import type { Bilingual } from "@/types/content";

export interface NidusIntroContent {
  title: Bilingual;
  subtitle: Bilingual;
  pitch: Bilingual; // max 2 zinnen
}

// Lagen van het gelaagde architectuurdiagram, in render-volgorde.
export type NidusArchitectureLayer = "client" | "api" | "data" | "edge" | "ai";

// Eén component (service/systeem) in het Nidus-architectuurdiagram.
export interface NidusArchitectureComponent {
  id: string;
  layer: NidusArchitectureLayer;
  name: string;
  tech: string; // bv. "Fastify 5 / TypeScript"
  hosting: string; // bv. "Railway · Frankfurt"
  role: Bilingual; // één regel: wat doet dit component in het geheel
}

// Eén entry in de decision log — invulling volgt in een latere stap.
export interface NidusDecisionLogEntry {
  date: string;
  title: Bilingual;
  description: Bilingual;
}

// Eén datakaart binnen een gereconstrueerd Nidus-scherm.
export interface NidusMockupWidget {
  label: Bilingual;
  value: string;
  meta?: Bilingual;
}

export interface NidusMockupScreen {
  id: string;
  navLabel: Bilingual;
  title: Bilingual;
  widgets: NidusMockupWidget[];
}

export interface NidusSidebarItem {
  id: string;
  icon: string;
  label: Bilingual;
  enabled: boolean;
}

export interface NidusWeekrapportLine {
  category: string;
  amount: string;
  changeLabel: Bilingual;
  detail: Bilingual;
}

export interface NidusAgendaItem {
  time: string;
  title: Bilingual;
}

export interface NidusHealthMetric {
  label: Bilingual;
  value: string;
  percent: number;
}

export interface NidusDashboardDetail {
  greetingName: string;
  greetingDate: Bilingual;
  aiInsightLabel: Bilingual;
  aiInsight: Bilingual;
  weekrapportLabel: Bilingual;
  weekrapport: NidusWeekrapportLine[];
  weather: {
    temp: string;
    condition: Bilingual;
    range: string;
    tomorrow: Bilingual;
  };
  agendaLabel: Bilingual;
  agenda: NidusAgendaItem[];
  health: {
    score: number;
    scoreLabel: Bilingual;
    metrics: NidusHealthMetric[];
  };
  energyLive: {
    watts: string;
    badge: Bilingual;
  };
}

export interface NidusEnergyStat {
  label: Bilingual;
  value: string;
  unit: string;
}

export interface NidusEnergyDetail {
  hero: {
    label: Bilingual;
    value: string;
    unit: string;
    badge: Bilingual;
  };
  tip: Bilingual;
  stats: NidusEnergyStat[];
  powerChart: {
    title: Bilingual;
    subtitle: Bilingual;
  };
  gasChart: {
    title: Bilingual;
    subtitle: Bilingual;
  };
  deviceCard: {
    title: Bilingual;
    subtitle: Bilingual;
    buttonLabel: Bilingual;
    selectValue: Bilingual;
  };
  peakCard: {
    title: Bilingual;
    period: Bilingual;
    peakLabel: Bilingual;
    peakValue: string;
    thresholdLabel: Bilingual;
    thresholdValue: string;
    remaining: Bilingual;
    statusOk: boolean;
  };
  meterCard: {
    title: Bilingual;
    value: string;
    unit: string;
    subtitle: Bilingual;
  };
}

// Eén codevoorbeeld met korte duiding — invulling volgt in een latere stap.
export interface NidusCodeSnippet {
  title: Bilingual;
  language: string;
  code: string;
}

export interface NidusSectionTitles {
  architecture: Bilingual;
  decisionLog: Bilingual;
  screenshots: Bilingual;
  code: Bilingual;
}

export interface NidusCaseStudyContent {
  intro: NidusIntroContent;
  architecture: NidusArchitectureComponent[];
  principles: Bilingual[]; // 2-3 korte architectuurprincipes onder het diagram
  decisionLog: NidusDecisionLogEntry[];
  mockups: NidusMockupScreen[];
  sidebarItems: NidusSidebarItem[];
  dashboardDetail: NidusDashboardDetail;
  energyDetail: NidusEnergyDetail;
  mockupNote: Bilingual;
  codeSnippets: NidusCodeSnippet[];
  sectionTitles: NidusSectionTitles;
  // Herbruikbare "binnenkort"-tekst voor nog lege secties.
  placeholderNote: Bilingual;
}
