// Voorbeeldvragen voor de playground, inclusief de chunk-ids die een goede
// retrieval minstens zou moeten vinden (voor de eval-check in Run 2).
// De expectedSourceIds verwijzen naar KnowledgeChunk.id's uit
// portfolioKnowledgeBase.ts. Alle vragen zijn beantwoordbaar met claims die de
// bestaande content ondersteunt — geen verzonnen cijfers of schaal-claims.

import type { EvalCase } from "./types";

export const exampleQuestions: EvalCase[] = [
  {
    id: "ai-enabled-systems-fit",
    question: {
      nl: "Waarom past Klaas bij het bouwen van AI-gedreven systemen?",
      en: "Why is Klaas a good fit for building AI-enabled systems?",
    },
    expectedSourceIds: ["system-about-me", "skill-ai", "skill-functional-analysis"],
  },
  {
    id: "systems-actually-built",
    question: {
      nl: "Welke systemen heeft hij daadwerkelijk gebouwd?",
      en: "Which systems has he actually built?",
    },
    expectedSourceIds: ["system-lowi-nidus", "project-pi-network", "project-jarvis"],
    forbiddenClaims: [
      {
        // De liveStats-cijfers zijn expliciet placeholders (zie uiLabels.liveStatsNote).
        nl: "Concrete gebruiks- of uptime-cijfers noemen (de live-cijfers zijn placeholders).",
        en: "Citing concrete usage or uptime numbers (the live stats are placeholders).",
      },
    ],
  },
  {
    id: "business-to-technical-bridge",
    question: {
      nl: "Hoe verbindt hij businessanalyse met technische implementatie?",
      en: "How does he connect business analysis with technical implementation?",
    },
    expectedSourceIds: [
      "system-about-me",
      "skill-functional-analysis",
      "experience-egov-vzw",
    ],
  },
  {
    id: "production-systems-experience",
    question: {
      nl: "Welke ervaring heeft hij met productiegerichte systemen?",
      en: "What experience does he have with production-focused systems?",
    },
    expectedSourceIds: [
      "system-lowi-nidus",
      "project-pi-network",
      "experience-itineris-nv",
    ],
    forbiddenClaims: [
      {
        // Er bestaat geen ondersteunde claim over schaal of aantallen gebruikers.
        nl: "Schaal-claims of gebruikersaantallen noemen die nergens in de content staan.",
        en: "Making scale claims or user counts that appear nowhere in the content.",
      },
    ],
  },
  {
    id: "ai-privacy-reliability",
    question: {
      nl: "Hoe denkt hij over AI, privacy en betrouwbaarheid?",
      en: "How does he think about AI, privacy and reliability?",
    },
    expectedSourceIds: [
      "system-privacy-analytics",
      "system-lowi-intro",
      "project-jarvis",
    ],
  },
  {
    id: "beyond-classic-analyst",
    question: {
      nl: "Wat onderscheidt hem van een klassieke functioneel analist?",
      en: "What sets him apart from a classic functional analyst?",
    },
    expectedSourceIds: [
      "system-about-me",
      "system-lowi-intro",
      "experience-egov-vzw",
    ],
  },
];
