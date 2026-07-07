import { describe, expect, it } from "vitest";
import { getPreAuthoredAnswer } from "./answers";
import { exampleQuestions } from "./exampleQuestions";
import { getKnowledgeBase } from "./portfolioKnowledgeBase";
import { LocalKeywordRetrievalProvider } from "./retrieval";

describe("pre-authored answers", () => {
  it("references existing knowledge chunks for every example question", () => {
    const chunkIds = new Set(getKnowledgeBase().map((chunk) => chunk.id));

    for (const question of exampleQuestions) {
      const answer = getPreAuthoredAnswer(question.id);

      expect(answer, question.id).not.toBeNull();
      expect(answer?.responseType, question.id).toBe("pre-authored");
      for (const sourceChunkId of answer?.sourceChunkIds ?? []) {
        expect(chunkIds.has(sourceChunkId), sourceChunkId).toBe(true);
      }
    }
  });

  it("keeps pre-authored sources inside the retrieved top-k for their question", async () => {
    const provider = new LocalKeywordRetrievalProvider();

    for (const question of exampleQuestions) {
      const answer = getPreAuthoredAnswer(question.id);
      if (answer === null) {
        throw new Error(`Missing answer for ${question.id}`);
      }

      const results = await provider.retrieve(question.question.nl, "nl", 5);
      const retrievedIds = new Set(results.map((result) => result.chunkId));

      for (const sourceChunkId of answer.sourceChunkIds) {
        expect(
          Array.from(retrievedIds),
          `${question.id} should retrieve ${sourceChunkId}; got ${results
            .map((result) => result.chunkId)
            .join(", ")}`
        ).toContain(sourceChunkId);
      }
    }
  });
});
