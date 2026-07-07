import { afterEach, describe, expect, it, vi } from "vitest";
import type { KnowledgeChunk } from "./types";

function makeChunk(
  overrides: Partial<KnowledgeChunk> & Pick<KnowledgeChunk, "id">
): KnowledgeChunk {
  return {
    id: overrides.id,
    sourceType: overrides.sourceType ?? "system",
    sourceId: overrides.sourceId ?? overrides.id,
    title: overrides.title ?? { nl: "Neutral title", en: "Neutral title" },
    content: overrides.content ?? { nl: "Neutral body", en: "Neutral body" },
    keywords: overrides.keywords ?? [],
    tags: overrides.tags ?? [],
    sensitivity: "public",
  };
}

async function providerFor(chunks: KnowledgeChunk[]) {
  vi.resetModules();
  vi.doMock("./portfolioKnowledgeBase", () => ({
    getKnowledgeBase: () => chunks,
  }));
  const { LocalKeywordRetrievalProvider } = await import("./retrieval");
  return new LocalKeywordRetrievalProvider();
}

afterEach(() => {
  vi.doUnmock("./portfolioKnowledgeBase");
  vi.resetModules();
});

describe("LocalKeywordRetrievalProvider tokenization and normalization", () => {
  it("lowercases, removes punctuation, and splits on whitespace", async () => {
    const provider = await providerFor([
      makeChunk({
        id: "normalization",
        keywords: ["alpha", "beta"],
      }),
    ]);

    const results = await provider.retrieve("  ALPHA,\n\tBETA!!  ", "nl");

    expect(results).toHaveLength(1);
    expect(results[0].matchedTerms).toEqual(["alpha", "beta"]);
  });

  it("matches Dutch compounds through the documented prefix rule", async () => {
    const provider = await providerFor([
      makeChunk({
        id: "production-keyword",
        keywords: ["productie"],
      }),
    ]);

    const results = await provider.retrieve("productiegerichte", "nl");

    expect(results).toHaveLength(1);
    expect(results[0].chunkId).toBe("production-keyword");
    expect(results[0].matchedTerms).toEqual(["productiegerichte"]);
    expect(results[0].score).toBeCloseTo(0.666666, 5);
  });
});

describe("LocalKeywordRetrievalProvider scoring", () => {
  it("orders exact matches by the documented title/keyword/tag/content weights", async () => {
    const provider = await providerFor([
      makeChunk({
        id: "content-match",
        content: { nl: "zephyr", en: "neutral" },
      }),
      makeChunk({
        id: "tag-match",
        tags: ["zephyr"],
      }),
      makeChunk({
        id: "keyword-match",
        keywords: ["zephyr"],
      }),
      makeChunk({
        id: "title-match",
        title: { nl: "zephyr", en: "neutral" },
      }),
    ]);

    const results = await provider.retrieve("zephyr", "en");

    expect(results.map((result) => result.chunkId)).toEqual([
      "title-match",
      "keyword-match",
      "tag-match",
      "content-match",
    ]);
    expect(results.map((result) => result.score)).toEqual([
      1,
      expect.closeTo(0.866666, 5),
      expect.closeTo(0.733333, 5),
      expect.closeTo(0.466666, 5),
    ]);
  });
});

describe("LocalKeywordRetrievalProvider result behavior", () => {
  it("returns the same sorted results for repeated calls with tied scores", async () => {
    const provider = await providerFor([
      makeChunk({ id: "gamma", content: { nl: "orbit", en: "neutral" } }),
      makeChunk({ id: "alpha", content: { nl: "orbit", en: "neutral" } }),
      makeChunk({ id: "beta", content: { nl: "orbit", en: "neutral" } }),
    ]);

    const first = await provider.retrieve("orbit", "en");
    const second = await provider.retrieve("orbit", "en");

    expect(first).toEqual(second);
    expect(first.map((result) => result.chunkId)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("never returns more than the requested top-k limit", async () => {
    const provider = await providerFor(
      ["one", "two", "three", "four", "five"].map((id) =>
        makeChunk({ id, content: { nl: "orbit", en: "neutral" } })
      )
    );

    const results = await provider.retrieve("orbit", "nl", 3);

    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("handles empty and nonsense queries without crashing", async () => {
    const provider = await providerFor([
      makeChunk({
        id: "known-content",
        content: { nl: "bekende portfolio inhoud", en: "known portfolio content" },
      }),
    ]);

    await expect(provider.retrieve(" de, het, and !!! ", "nl")).resolves.toEqual(
      []
    );

    const nonsenseResults = await provider.retrieve("zzzzzzzz", "en");
    expect(
      nonsenseResults.length === 0 ||
        nonsenseResults.every((result) => result.score < 0.25)
    ).toBe(true);
  });
});
