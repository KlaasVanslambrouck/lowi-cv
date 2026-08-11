export type LinguixBlockId =
  | "blok-1"
  | "blok-2"
  | "blok-3"
  | "blok-4"
  | "blok-5"
  | "blok-6"
  | "blok-7"
  | "blok-8"
  | "blok-9"
  | "blok-10";

export type LinguixBlockNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type LinguixParagraphVariant = "default" | "lead" | "small";

export interface LinguixParagraphBlock {
  type: "paragraph";
  text: string;
  label?: string;
  variant?: LinguixParagraphVariant;
}

export interface LinguixQuoteBlock {
  type: "quote";
  paragraphs: readonly string[];
  label?: string;
}

export type LinguixTableAlignment = "start" | "center" | "end";

export interface LinguixTableColumn {
  key: string;
  label: string;
  align?: LinguixTableAlignment;
  numeric?: boolean;
}

export interface LinguixTableRow {
  id: string;
  cells: readonly string[];
}

export interface LinguixTableBlock {
  type: "table";
  columns: readonly LinguixTableColumn[];
  rows: readonly LinguixTableRow[];
  caption?: string;
  note?: string;
}

export interface LinguixListItem {
  text: string;
  children?: readonly string[];
}

export interface LinguixListBlock {
  type: "list";
  items: readonly LinguixListItem[];
  ordered?: boolean;
  title?: string;
}

export type LinguixCalloutTone = "accent" | "info" | "warning" | "risk";

export interface LinguixCalloutBlock {
  type: "callout";
  paragraphs: readonly string[];
  title?: string;
  tone?: LinguixCalloutTone;
}

export type LinguixPlaceholderFeature =
  | "businesscase-model"
  | "diagram"
  | "scorer"
  | "spreekagent";

export interface LinguixPlaceholderBlock {
  type: "placeholder";
  feature: LinguixPlaceholderFeature;
  title: string;
  description: string;
  statusLabel: string;
}

export type LinguixContentBlock =
  | LinguixParagraphBlock
  | LinguixQuoteBlock
  | LinguixTableBlock
  | LinguixListBlock
  | LinguixCalloutBlock
  | LinguixPlaceholderBlock;

/**
 * Identificeert het visuele element dat een blok in presentatiemodus vult.
 * Elk id verwijst naar hetzelfde component als in documentmodus. De laatste
 * twee lezen hun tekst uit een tabel die al in de documentinhoud van het blok
 * staat — één contentbron, twee renderings.
 */
export type LinguixVisualId =
  | "drie-klokken"
  | "herkadering"
  | "businesscase-model"
  | "oplossing-schema"
  | "schrijf-scorer"
  | "spreek-agent"
  | "faserings-tijdlijn"
  | "risico-matrix";

/**
 * Maximaal drie steunpunten — als tuple-unie zodat een vierde steunpunt
 * een compileerfout geeft in plaats van een te volle slide.
 */
export type LinguixSteunpunten =
  | readonly []
  | readonly [string]
  | readonly [string, string]
  | readonly [string, string, string];

/**
 * Eén visuele stap binnen een blok — een subslide met dezelfde kernclaim en
 * steunpunten, maar een ander deel van het visuele element. Het `id` gaat als
 * `stapId` naar het component; dat bepaalt zelf wat het per stap toont.
 */
export interface LinguixVisueleStap {
  id: string;
  bijschrift?: string;
}

export interface LinguixPresentationContent {
  kernclaim: string;
  steunpunten: LinguixSteunpunten;
  visueelId?: LinguixVisualId;
  /** Ontbreekt dit, dan heeft het blok precies één scherm. */
  visueleStappen?: readonly LinguixVisueleStap[];
}

export interface LinguixSectionContent {
  id: LinguixBlockId;
  nummer: LinguixBlockNumber;
  titel: string;
  eyebrow: string;
  spreektijdMinuten: number;
  inhoud: readonly LinguixContentBlock[];
  /** De presentatielaag: dezelfde inhoud, teruggebracht tot claim en steun. */
  presentatie: LinguixPresentationContent;
  /** Alleen voor de afdrukbare notitieroute — nooit zichtbaar in beide modi. */
  spreekNotities: readonly string[];
}

export type LinguixWeergaveModus = "document" | "presentatie";

export interface LinguixCaseContent {
  titel: string;
  kernstelling: string;
  secties: readonly LinguixSectionContent[];
}

export type LinguixCriterionKey =
  | "taakvervulling"
  | "samenhang"
  | "woordenschat"
  | "grammatica"
  | "spelling";

export interface LinguixExamTask {
  taakId: string;
  niveau: string;
  type: string;
  richtlengte: {
    minimumWoorden: number;
    maximumWoorden: number;
  };
  tijdMinuten: number;
  situatie: string;
  opdracht: string;
  deelopdrachten: readonly string[];
  slotinstructie: string;
}

export interface LinguixRubricCriterion {
  sleutel: LinguixCriterionKey;
  label: string;
  gewicht: number;
  descriptoren: Readonly<Record<"0" | "1" | "2" | "3" | "4", string>>;
}

export interface LinguixRubric {
  id: string;
  maxScore: number;
  criteria: readonly LinguixRubricCriterion[];
  slaaggrens: number;
  dekkingsregel: {
    criterium: LinguixCriterionKey;
    minimumScore: number;
    oordeelBijLagereScore: "nietGeslaagd";
    toelichting: string;
  };
  escalatieCodes: readonly LinguixEscalationCode[];
  escalatiedrempels: {
    onzekerheidsmarge: {
      minimumGewogenScore: number;
      maximumGewogenScore: number;
    };
    spreiding: {
      minimumVerschil: number;
    };
    lengte: {
      minimumWoorden: number;
      maximumWoorden: number;
    };
    dekkingsregelGeraakt: {
      maximumTaakvervullingScore: number;
    };
  };
}

export interface LinguixExample {
  id: string;
  label: string;
  kandidaat: string;
  verwachtAantalWoorden: number;
  kandidaatTekst: string;
}

export interface LinguixExamplesResponse {
  examentaak: LinguixExamTask;
  beoordelingswijzer: LinguixRubric;
  voorbeelden: readonly LinguixExample[];
}

export interface LinguixScoreRequest {
  taakId: string;
  kandidaatTekst: string;
  beoordelingswijzerId: string;
}

export interface LinguixEvidence {
  fragment: string;
  toelichting: string;
}

export interface LinguixCriterionScore {
  sleutel: LinguixCriterionKey;
  label: string;
  score: number;
  maxScore: number;
  gewicht: number;
  motivering: string;
  bewijs: readonly LinguixEvidence[];
}

export type LinguixProvisionalJudgement =
  | "geslaagd"
  | "nietGeslaagd"
  | "onbeslist";

export type LinguixEscalationCode =
  | "ONZEKERHEIDSMARGE"
  | "SPREIDING"
  | "LENGTE_BUITEN_BEREIK"
  | "DEKKINGSREGEL_GERAAKT"
  | "CRITERIUM_NIET_TOEPASBAAR";

export interface LinguixEscalationReason {
  code: LinguixEscalationCode;
  toelichting: string;
}

export interface LinguixScoreResponse {
  taakId: string;
  aantalWoorden: number;
  criteria: readonly LinguixCriterionScore[];
  gewogenScore: number;
  slaaggrens: number;
  voorlopigOordeel: LinguixProvisionalJudgement;
  confidence: number;
  menselijkeReviewVereist: boolean;
  escalatieRedenen: readonly LinguixEscalationReason[];
}
