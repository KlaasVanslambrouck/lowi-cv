// Deterministische, keyword-gebaseerde retrieval over de portfolio knowledge
// base. Er is hier bewust GEEN semantic search en GEEN embedding-model: alles
// is lexicaal (tokens, prefixen, gewichten) en daardoor volledig uitlegbaar
// en reproduceerbaar. De `reason` per resultaat wordt opgebouwd uit wat er
// ECHT matchte, nooit uit een generieke tekst.

import type { Language } from "@/context/LanguageContext";
import type {
  KnowledgeChunk,
  KnowledgeSourceType,
  RetrievalProvider,
  RetrievalResult,
} from "./types";
import { getKnowledgeBase } from "./portfolioKnowledgeBase";

// ---------------------------------------------------------------------------
// Tokenisatie & normalisatie
// ---------------------------------------------------------------------------

// Kleine NL+EN stopwoordenlijst: hoogfrequente woorden die geen onderscheidend
// vermogen hebben in een keyword-zoekopdracht. Bewust klein gehouden.
const STOPWORDS = new Set([
  // Nederlands
  "de", "het", "een", "en", "of", "in", "op", "te", "is", "zijn", "was",
  "voor", "naar", "met", "van", "aan", "bij", "dat", "die", "dit", "deze",
  "hij", "zij", "hem", "haar", "ik", "je", "jij", "wat", "wie", "hoe",
  "waarom", "welke", "welk", "waar", "wanneer", "ook", "als", "maar", "over",
  "heeft", "heb", "hebben", "wordt", "worden", "kan", "kunnen", "niet", "wel",
  // Engels
  "the", "a", "an", "and", "or", "in", "on", "to", "of", "for", "with",
  "from", "at", "by", "that", "this", "these", "those", "he", "she", "him",
  "his", "her", "it", "its", "what", "who", "how", "why", "which", "where", "when",
  "also", "as", "but", "about", "has", "have", "had", "does", "do", "did",
  "can", "could", "not",
]);

// Zeer eenvoudige, taal-naïeve suffix-stripping — géén echte stemmer. Doel is
// alleen dat veelvoorkomende NL/EN vormvarianten op elkaar afbeelden
// ("systemen"→"system", "verbindt"/"verbinden"→"verbind", "klassieke"→
// "klassiek"). Omdat dezelfde functie op zowel index als query draait, is
// consistentie belangrijker dan taalkundige correctheid.
function stemToken(token: string): string {
  if (token.length >= 6 && token.endsWith("en")) return token.slice(0, -2);
  if (token.length >= 5 && token.endsWith("t")) return token.slice(0, -1);
  if (token.length >= 5 && token.endsWith("s")) return token.slice(0, -1);
  if (token.length >= 6 && token.endsWith("e")) return token.slice(0, -1);
  return token;
}

// Normaliseert vrije tekst naar ruwe tokens: lowercase, diacrieten weg (NFD),
// leestekens eruit, splitsen op whitespace, stopwoorden en te korte tokens
// weg. Taal-onafhankelijk: NL en EN gaan door exact dezelfde pijplijn.
function cleanTokens(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

// Index-kant: unieke, gestemde tokens.
function uniqueTokens(text: string): string[] {
  return Array.from(new Set(cleanTokens(text).map(stemToken)));
}

// Querytoken met zowel de leesbare vorm (voor matchedTerms en reason) als de
// gestemde vorm (voor het matchen zelf). Zo toont de uitleg 'databricks' en
// niet een intern gestript token als 'busines'.
interface QueryToken {
  raw: string;
  stem: string;
}

function tokenizeQuery(text: string): QueryToken[] {
  const seen = new Set<string>();
  const tokens: QueryToken[] = [];
  for (const raw of cleanTokens(text)) {
    const stem = stemToken(raw);
    if (seen.has(stem)) continue;
    seen.add(stem);
    tokens.push({ raw, stem });
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Scoring-gewichten (allemaal gedocumenteerd, niets "magisch")
// ---------------------------------------------------------------------------

// Waar een match plaatsvindt bepaalt het gewicht: een match in de titel zegt
// meer over relevantie dan een match ergens in de lopende tekst.
const TITLE_WEIGHT = 3;
const KEYWORD_WEIGHT = 2.5;
const TAG_WEIGHT = 2;
const CONTENT_WEIGHT = 1;

// Een prefix-match (bv. query "businessanalyse" op indexterm "business", of
// "productiegerichte" op "productie") telt mee, maar lichter dan een exacte
// match. Nodig omdat Nederlands veel samenstellingen kent. De minimumlengte
// van 6 is bewust: NL-samenstellingsdelen zijn zelden korter, en kortere
// prefixen (bv. "think" op "thinking") gaven te veel toevalstreffers.
const PREFIX_MATCH_FACTOR = 0.7;
const MIN_PREFIX_LENGTH = 6;

// Optionele source-type weging, bewust dicht bij 1 zodat lexicale relevantie
// dominant blijft. Keuze: projecten en ervaring zijn concreet bewijs van wat
// er gebouwd/gedaan is en krijgen een lichte boost; skills en opleiding zijn
// ondersteunend. "architecture" wordt pas in een latere fase gevuld.
const SOURCE_TYPE_WEIGHT: Record<KnowledgeSourceType, number> = {
  experience: 1.1,
  project: 1.1,
  system: 1.0,
  architecture: 1.0,
  skill: 0.95,
  education: 0.95,
};

// De eindscore is genormaliseerd naar [0, 1]:
//   tierScore   = som van matchgewichten / (aantal querytokens × TITLE_WEIGHT)
//                 (1.0 = elk querytoken exact gematcht in een titel)
//   overlap     = gematchte querytokens / totaal querytokens
//   score       = min(1, (0.8 × tierScore + 0.2 × overlap) × sourceTypeWeight)
// De overlap-term beloont antwoorden die de héle vraag dekken boven chunks
// die één term heel sterk matchen.
const TIER_SCORE_SHARE = 0.8;
const OVERLAP_SHARE = 0.2;

// ---------------------------------------------------------------------------
// Vooraf getokeniseerde index over de knowledge base (eenmalig opgebouwd)
// ---------------------------------------------------------------------------

// Volgorde = gewichtsvolgorde; de best scorende tier per querytoken telt.
type MatchTier = "title" | "keyword" | "tag" | "content";

const TIER_WEIGHTS: Record<MatchTier, number> = {
  title: TITLE_WEIGHT,
  keyword: KEYWORD_WEIGHT,
  tag: TAG_WEIGHT,
  content: CONTENT_WEIGHT,
};

// NL/EN-labels per tier voor de reason-teksten.
const TIER_LABELS: Record<MatchTier, { nl: string; en: string }> = {
  title: { nl: "titel-match op", en: "title match on" },
  keyword: { nl: "trefwoord-match op", en: "keyword match on" },
  tag: { nl: "tag-match op", en: "tag match on" },
  content: { nl: "tekst-match op", en: "body match on" },
};

interface IndexedChunk {
  chunk: KnowledgeChunk;
  tokensByTier: Record<MatchTier, string[]>;
}

let cachedIndex: IndexedChunk[] | null = null;

function getIndex(): IndexedChunk[] {
  if (cachedIndex === null) {
    cachedIndex = getKnowledgeBase().map((chunk) => ({
      chunk,
      tokensByTier: {
        // Beide talen worden samen geïndexeerd: zo vindt een NL-vraag ook
        // chunks waarvan alleen de EN-tekst de term letterlijk bevat.
        title: uniqueTokens(`${chunk.title.nl} ${chunk.title.en}`),
        keyword: uniqueTokens(chunk.keywords.join(" ")),
        tag: uniqueTokens(chunk.tags.join(" ")),
        content: uniqueTokens(`${chunk.content.nl} ${chunk.content.en}`),
      },
    }));
  }
  return cachedIndex;
}

// ---------------------------------------------------------------------------
// Matching & scoring
// ---------------------------------------------------------------------------

// Exacte match telt volledig; een prefix-match (in beide richtingen, minimaal
// MIN_PREFIX_LENGTH tekens gedeeld) telt met PREFIX_MATCH_FACTOR.
function matchFactor(queryToken: string, indexToken: string): number {
  if (queryToken === indexToken) return 1;
  const shorter = queryToken.length <= indexToken.length ? queryToken : indexToken;
  const longer = queryToken.length <= indexToken.length ? indexToken : queryToken;
  if (shorter.length >= MIN_PREFIX_LENGTH && longer.startsWith(shorter)) {
    return PREFIX_MATCH_FACTOR;
  }
  return 0;
}

interface TokenMatch {
  tier: MatchTier;
  factor: number;
}

// Zoekt per querytoken de best mogelijke match binnen één chunk: eerst op
// tier-gewicht, daarbinnen op matchsterkte (exact > prefix).
function bestMatchForToken(
  queryToken: string,
  indexed: IndexedChunk
): TokenMatch | null {
  let best: TokenMatch | null = null;
  for (const tier of ["title", "keyword", "tag", "content"] as MatchTier[]) {
    for (const indexToken of indexed.tokensByTier[tier]) {
      const factor = matchFactor(queryToken, indexToken);
      if (factor === 0) continue;
      const weighted = TIER_WEIGHTS[tier] * factor;
      if (best === null || weighted > TIER_WEIGHTS[best.tier] * best.factor) {
        best = { tier, factor };
      }
    }
  }
  return best;
}

// Bouwt de tweetalige reason-tekst uit de echte matches, gegroepeerd per tier,
// bv. "titel-match op 'nidus'; trefwoord-match op 'supabase', 'productie'".
function buildReason(matchesByTier: Map<MatchTier, string[]>): { nl: string; en: string } {
  const nlParts: string[] = [];
  const enParts: string[] = [];
  for (const tier of ["title", "keyword", "tag", "content"] as MatchTier[]) {
    const terms = matchesByTier.get(tier);
    if (!terms || terms.length === 0) continue;
    const quoted = terms.map((term) => `'${term}'`).join(", ");
    nlParts.push(`${TIER_LABELS[tier].nl} ${quoted}`);
    enParts.push(`${TIER_LABELS[tier].en} ${quoted}`);
  }
  return { nl: nlParts.join("; "), en: enParts.join("; ") };
}

function scoreChunk(
  queryTokens: QueryToken[],
  indexed: IndexedChunk
): RetrievalResult | null {
  const matchesByTier = new Map<MatchTier, string[]>();
  const matchedTerms: string[] = [];
  let weightedSum = 0;

  for (const queryToken of queryTokens) {
    const match = bestMatchForToken(queryToken.stem, indexed);
    if (match === null) continue;
    weightedSum += TIER_WEIGHTS[match.tier] * match.factor;
    // Voor de uitleg gebruiken we de leesbare vorm zoals de bezoeker die
    // typte, niet het gestemde token.
    matchedTerms.push(queryToken.raw);
    const bucket = matchesByTier.get(match.tier) ?? [];
    bucket.push(queryToken.raw);
    matchesByTier.set(match.tier, bucket);
  }

  if (matchedTerms.length === 0) return null;

  const tierScore = weightedSum / (queryTokens.length * TITLE_WEIGHT);
  const overlap = matchedTerms.length / queryTokens.length;
  const raw =
    (TIER_SCORE_SHARE * tierScore + OVERLAP_SHARE * overlap) *
    SOURCE_TYPE_WEIGHT[indexed.chunk.sourceType];

  return {
    chunkId: indexed.chunk.id,
    score: Math.min(1, raw),
    matchedTerms,
    reason: buildReason(matchesByTier),
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 5;

// TODO: later vervangen of aanvullen met een embedding-gebaseerde retrieval
// provider, bijvoorbeeld pgvector, zonder de UI-contracten (RetrievalProvider-
// interface) te wijzigen.
export class LocalKeywordRetrievalProvider implements RetrievalProvider {
  // `language` verandert de scoring niet: beide talen zijn samen geïndexeerd
  // en de reason is altijd tweetalig. De parameter blijft deel van het
  // contract omdat een latere (embedding-)provider er wél iets mee kan.
  // Async om het RetrievalProvider-contract te delen met toekomstige providers
  // die echt I/O doen; deze implementatie is volledig synchroon en lokaal.
  async retrieve(
    query: string,
    language: Language,
    limit: number = DEFAULT_LIMIT
  ): Promise<RetrievalResult[]> {
    void language;
    const queryTokens = tokenizeQuery(query);
    if (queryTokens.length === 0) return [];

    const results: RetrievalResult[] = [];
    for (const indexed of getIndex()) {
      const result = scoreChunk(queryTokens, indexed);
      if (result !== null) results.push(result);
    }

    // Deterministische volgorde: score aflopend, daarna chunkId alfabetisch
    // als tie-breaker zodat gelijke scores altijd dezelfde volgorde geven.
    results.sort(
      (a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId)
    );
    return results.slice(0, Math.max(1, limit));
  }
}
