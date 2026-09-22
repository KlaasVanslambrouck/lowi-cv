import { describe, expect, it } from "vitest";
import { getKnowledgeBase } from "./portfolioKnowledgeBase";
import type { KnowledgeSourceType } from "./types";

describe("getKnowledgeBase", () => {
  it("returns a non-empty memoized array instance", () => {
    const first = getKnowledgeBase();
    const second = getKnowledgeBase();

    expect(first.length).toBeGreaterThan(0);
    expect(second).toBe(first);
  });

  it("keeps every chunk public and populated", () => {
    const chunks = getKnowledgeBase();

    for (const chunk of chunks) {
      expect(chunk.sensitivity).toBe("public");
      expect(chunk.id.trim()).not.toBe("");
      expect(chunk.title.nl.trim()).not.toBe("");
      expect(chunk.title.en.trim()).not.toBe("");
      expect(chunk.content.nl.trim()).not.toBe("");
      expect(chunk.content.en.trim()).not.toBe("");
    }
  });

  it("contains at least one chunk for every knowledge source type", () => {
    const chunks = getKnowledgeBase();
    const requiredSourceTypes: KnowledgeSourceType[] = [
      "experience",
      "project",
      "skill",
      "education",
      "architecture",
      "system",
    ];

    for (const sourceType of requiredSourceTypes) {
      const count = chunks.filter((chunk) => chunk.sourceType === sourceType)
        .length;
      if (count === 0) {
        throw new Error(
          `Expected at least one KnowledgeChunk with sourceType "${sourceType}"`
        );
      }
    }
  });

  // De ervaring-chunks komen uit lib/experience.ts, dus de functie uit
  // content/role.ts hoort er ook in te zitten.
  it("bevat de functie bij In The Pocket als ervaring-chunk", () => {
    const chunk = getKnowledgeBase().find(
      (candidate) => candidate.id === "experience-in-the-pocket"
    );

    expect(chunk).toBeDefined();
    expect(chunk?.sourceType).toBe("experience");
    expect(chunk?.title.en).toContain("AI Transformation Expert");
    expect(chunk?.content.en).toContain("AI ambition to adoption");
    // Periodetekst hoort bij de doorzoekbare inhoud.
    expect(chunk?.content.nl).toContain("vanaf okt 2026");
  });

  it("neemt de periode van Student Kick-Off mee in de chunk", () => {
    const chunk = getKnowledgeBase().find(
      (candidate) => candidate.id === "experience-student-kick-off"
    );

    expect(chunk).toBeDefined();
    expect(chunk?.content.nl).toContain("2012 — 2016");
    expect(chunk?.content.en).toContain("2012 — 2016");
  });
});
