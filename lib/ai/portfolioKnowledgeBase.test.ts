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
});
