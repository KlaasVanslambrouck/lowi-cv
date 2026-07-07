import type { Bilingual } from "@/types/content";
import { getKnowledgeBase } from "./portfolioKnowledgeBase";
import type { RetrievalResult } from "./types";

export type AnswerResponseType = "pre-authored" | "template";

export interface GroundedAnswer {
  text: Bilingual;
  sourceChunkIds: string[];
  responseType: AnswerResponseType;
}

export const preAuthoredAnswers: Record<string, GroundedAnswer> = {
  "ai-business-engineering-fit": {
    responseType: "pre-authored",
    sourceChunkIds: ["system-about-me", "skill-ai", "skill-functional-analysis"],
    text: {
      nl: "Klaas past bij AI Business Engineering omdat zijn profiel businessanalyse, technologie en AI samenbrengt. De portfolio beschrijft hem als functioneel analist die processen begrijpt, frictie ziet en die inzichten naar praktische werkende oplossingen vertaalt. De skill-constellatie verbindt AI met LLMs, automation, data en functional analysis, terwijl Functional Analysis gekoppeld is aan productdenken en systems thinking.",
      en: "Klaas fits AI Business Engineering because his profile brings business analysis, technology and AI together. The portfolio describes him as a functional analyst who understands processes, spots friction and translates that into practical working solutions. The skill constellation connects AI with LLMs, automation, data and functional analysis, while Functional Analysis is linked to product thinking and systems thinking.",
    },
  },
  "systems-actually-built": {
    responseType: "pre-authored",
    sourceChunkIds: ["system-lowi-nidus", "project-pi-network", "project-jarvis"],
    text: {
      nl: "De concrete systemen in deze portfolio zijn Nidus, het Pi-sensornetwerk en Jarvis. Nidus wordt beschreven als het eerste echte systeem binnen LOWI, met koppelingen naar energieverbruik, locatie, automatisering, dashboards, Raspberry Pi-workers, Supabase en mobiele interfaces. Het Pi-sensornetwerk meet thuis temperatuur en energie en pusht metingen naar Supabase. Jarvis is gepositioneerd als chat-assistent bovenop de nidus-api voor CV- en projectvragen.",
      en: "The concrete systems in this portfolio are Nidus, the Pi sensor network and Jarvis. Nidus is described as the first real system inside LOWI, with connections to energy usage, location, automation, dashboards, Raspberry Pi workers, Supabase and mobile interfaces. The Pi sensor network measures temperature and energy at home and pushes readings to Supabase. Jarvis is positioned as a chat assistant on top of the nidus-api for CV and project questions.",
    },
  },
  "business-to-technical-bridge": {
    responseType: "pre-authored",
    sourceChunkIds: [
      "system-about-me",
      "skill-functional-analysis",
      "experience-egov-vzw",
    ],
    text: {
      nl: "De brug zit in de combinatie van analysewerk en bouwdrang. De over-mij tekst zegt dat Klaas snel ziet hoe processen werken, waar frictie zit en hoe dat naar werkende oplossingen vertaald wordt. Zijn functionele analyse is verbonden met productdenken en systems thinking, en bij EGOV vertaalde hij businessbehoeften naar functionele specificaties voor case management en workflow-automatisering.",
      en: "The bridge sits in the combination of analysis work and builder drive. The about text says Klaas quickly sees how processes work, where friction sits and how that can become working solutions. His functional analysis is connected to product thinking and systems thinking, and at EGOV he translated business needs into functional specifications for case management and workflow automation.",
    },
  },
  "production-systems-experience": {
    responseType: "pre-authored",
    sourceChunkIds: [
      "system-lowi-nidus",
      "project-pi-network",
      "experience-student-kick-off",
    ],
    text: {
      nl: "De keyword-gebaseerde retrieval vindt hier twee systeembronnen en een productie-ervaring. Nidus staat als LOWI-systeem in productie en is bedoeld als levend systeem dat context begrijpt en helpt beslissen. Het Pi-netwerk draait als thuisinfrastructuur met metingen richting Supabase. Daarnaast toont Student Kick-Off productie-ervaring buiten software: mainstage-programmatie en artiestencontracten voor een groot studentenevenement.",
      en: "The keyword-based retrieval finds two system sources and one production experience here. Nidus is marked as a LOWI system in production and is meant as a living system that understands context and helps with decisions. The Pi network runs as home infrastructure with readings flowing to Supabase. Student Kick-Off also shows production experience outside software: Mainstage programming and artist contracts for a large student event.",
    },
  },
  "ai-privacy-reliability": {
    responseType: "pre-authored",
    sourceChunkIds: [
      "system-privacy-analytics",
      "system-lowi-intro",
      "project-jarvis",
    ],
    text: {
      nl: "De portfolio behandelt AI als onderdeel van bruikbare systemen, niet als los effect. LOWI wordt beschreven als leer- en bouwomgeving voor AI, automatisering en creatieve technologie, met nadruk op bruikbaar, begrijpelijk en technisch degelijk bouwen. De site vermeldt beperkte, privacyvriendelijke analytics zonder advertentiecookies of cross-site tracking. Jarvis wordt als AI-assistent bovenop de nidus-api beschreven, met toolgebruik en geheugen als richting.",
      en: "The portfolio treats AI as part of usable systems, not as a standalone effect. LOWI is described as a learning and building environment for AI, automation and creative technology, with an emphasis on building something usable, understandable and technically sound. The site states that it collects limited, privacy-friendly analytics without advertising cookies or cross-site tracking. Jarvis is described as an AI assistant on top of the nidus-api, with tool use and memory as its direction.",
    },
  },
  "beyond-classic-analyst": {
    responseType: "pre-authored",
    sourceChunkIds: [
      "system-about-me",
      "skill-functional-analysis",
      "experience-egov-vzw",
    ],
    text: {
      nl: "Wat hem onderscheidt is dat analyse niet stopt bij specificaties. De content positioneert hem als functioneel analist met een sterke drang om systemen te begrijpen en te bouwen. De skill-node Functional Analysis is verbonden met AI, product en systems thinking. Zijn EGOV-ervaring onderbouwt de klassieke analysekant: businessbehoeften vertalen naar functionele specificaties voor case management en workflow-automatisering.",
      en: "What sets him apart is that analysis does not stop at specifications. The content positions him as a functional analyst with a strong drive to understand and build systems. The Functional Analysis skill node is connected to AI, product and systems thinking. His EGOV experience grounds the classic analysis side: translating business needs into functional specifications for case management and workflow automation.",
    },
  },
};

export function getPreAuthoredAnswer(questionId: string): GroundedAnswer | null {
  return preAuthoredAnswers[questionId] ?? null;
}

function formatTemplateFragment(chunkId: string, language: keyof Bilingual): string | null {
  const chunk = getKnowledgeBase().find((entry) => entry.id === chunkId);
  if (!chunk) return null;
  return `${chunk.title[language]}: ${chunk.content[language]}`;
}

export function buildTemplateAnswer(
  results: RetrievalResult[],
  limit = 3
): GroundedAnswer {
  const sourceChunkIds = results.slice(0, limit).map((result) => result.chunkId);
  const nlFragments = sourceChunkIds
    .map((chunkId) => formatTemplateFragment(chunkId, "nl"))
    .filter((fragment): fragment is string => Boolean(fragment));
  const enFragments = sourceChunkIds
    .map((chunkId) => formatTemplateFragment(chunkId, "en"))
    .filter((fragment): fragment is string => Boolean(fragment));

  if (sourceChunkIds.length === 0) {
    return {
      responseType: "template",
      sourceChunkIds: [],
      text: {
        nl: "Geen passend portfoliofragment gevonden voor deze vraag.",
        en: "No matching portfolio fragment was found for this question.",
      },
    };
  }

  return {
    responseType: "template",
    sourceChunkIds,
    text: {
      nl: nlFragments.join("\n\n"),
      en: enFragments.join("\n\n"),
    },
  };
}
