// Typecontracten voor de AI Engineering Playground (fase 1).
// Dit is een eerlijke, deterministische, keyword-gebaseerde retrieval-laag:
// er draait hier GEEN LLM, GEEN embedding-model en GEEN vector search.
// De interfaces zijn wél zo ontworpen dat een latere embedding-provider
// (bv. pgvector) achter hetzelfde RetrievalProvider-contract kan schuiven.

import type { Bilingual } from "@/types/content";
// Language leeft in de LanguageContext, niet in types/content.ts. We importeren
// het type-only zodat deze pure lib geen React-runtime meetrekt en het type
// niet opnieuw gedefinieerd wordt (één bron van waarheid).
import type { Language } from "@/context/LanguageContext";

// Waar een kennis-chunk vandaan komt. "architecture" is gereserveerd voor
// latere chunks uit ARCHITECTURE.md; fase 1 vult die nog niet.
export type KnowledgeSourceType =
  | "experience"
  | "project"
  | "skill"
  | "education"
  | "architecture"
  | "system";

export interface KnowledgeChunk {
  id: string;
  sourceType: KnowledgeSourceType;
  // Verwijst naar de bron-entry in placeholderContent (bv. Project.id of een
  // afgeleide slug), zodat een chunk altijd herleidbaar is naar echte content.
  sourceId: string;
  title: Bilingual;
  content: Bilingual;
  keywords: string[];
  tags: string[];
  // Bewust een literal type: alle content in deze knowledge base is publieke
  // portfolio-content. Een latere uitbreiding mag hier pas andere niveaus
  // toevoegen als er ook echt een filter op sensitivity bestaat.
  sensitivity: "public";
  updatedAt?: string;
}

export type RetrievalMatchTier = "title" | "keyword" | "tag" | "content";

export interface RetrievalMatchBreakdown {
  term: string;
  tier: RetrievalMatchTier;
  factor: number;
  weightedScore: number;
}

export interface QueryAnalysisTerm {
  raw: string;
  normalized: string;
}

export interface QueryAnalysis {
  originalQuery: string;
  retrievalMode: "local-keyword";
  terms: QueryAnalysisTerm[];
  ignoredTerms: string[];
}

export interface RetrievalResult {
  chunkId: string;
  // Genormaliseerde score in [0, 1] — zie retrieval.ts voor de exacte formule.
  score: number;
  // De query-termen (genormaliseerd) die daadwerkelijk matchten.
  matchedTerms: string[];
  // Per gematchte term de echte scoring-tier uit retrieval.ts. Optioneel zodat
  // bestaande testfixtures niet hoeven te doen alsof ze door de provider komen.
  matchBreakdown?: RetrievalMatchBreakdown[];
  // Menselijk leesbare uitleg van wát er matchte (bv. "titel-match op 'nidus'"),
  // opgebouwd uit de echte matches — nooit een generieke tekst.
  reason: Bilingual;
}

export interface EvaluationResult {
  // Proxy-metric afgeleid van retrieval-scores — geen gevalideerde ML-metric.
  groundedness: number;
  // Aandeel van de top-k resultaten met een score boven de relevantiedrempel.
  sourceCoverage: number;
  confidence: "low" | "medium" | "high";
  warnings: Bilingual[];
}

// Contract waar élke retrieval-implementatie aan voldoet. Fase 1 levert een
// keyword-gebaseerde implementatie; een latere embedding-provider implementeert
// exact dit interface zodat de rest van de codebase niet hoeft te wijzigen.
export interface RetrievalProvider {
  retrieve(
    query: string,
    language: Language,
    limit?: number
  ): Promise<RetrievalResult[]>;
}

// Eval-case voor de latere evaluatie-UI (Run 2): een vraag met de chunk-ids
// die een goede retrieval minstens zou moeten vinden.
export interface EvalCase {
  id: string;
  question: Bilingual;
  expectedSourceIds: string[];
  // Claims die een antwoord op deze vraag NIET mag maken omdat de bestaande
  // content ze niet ondersteunt (bv. verzonnen cijfers of schaal-claims).
  forbiddenClaims?: Bilingual[];
}
