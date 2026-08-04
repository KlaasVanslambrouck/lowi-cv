import { describe, expect, it } from "vitest";
import {
  isJsonContentType,
  validateTrackPayload,
  type NidusCtaInteractionId,
} from "./trackValidation";

const SESSION_ID = "123e4567-e89b-42d3-a456-426614174000";
const NIDUS_CTA_INTERACTION_IDS = [
  "nidus_cta_hero",
  "nidus_cta_about",
  "nidus_cta_projects",
  "nidus_cta_lowi",
  "nidus_cta_skills",
] as const satisfies readonly NidusCtaInteractionId[];

function interactionPayload(interactionId: string) {
  return {
    sessionId: SESSION_ID,
    eventType: "interaction",
    eventData: { interactionId },
  };
}

describe("Nidus CTA interaction validation", () => {
  it.each(NIDUS_CTA_INTERACTION_IDS)("accepts %s", (interactionId) => {
    expect(validateTrackPayload(interactionPayload(interactionId))).toEqual({
      sessionId: SESSION_ID,
      eventType: "interaction",
      eventData: { interactionId },
      referrer: null,
      deviceType: null,
    });
  });

  it("rejects an unknown Nidus CTA interaction id", () => {
    expect(
      validateTrackPayload(interactionPayload("nidus_cta_unknown")),
    ).toBeNull();
  });

  it("rejects extra event data for a Nidus CTA interaction", () => {
    expect(
      validateTrackPayload({
        ...interactionPayload("nidus_cta_hero"),
        eventData: {
          interactionId: "nidus_cta_hero",
          sectionId: "hero",
        },
      }),
    ).toBeNull();
  });
});

describe("Jarvis interaction validation", () => {
  it("accepts jarvis_panel_open", () => {
    expect(
      validateTrackPayload(interactionPayload("jarvis_panel_open")),
    ).toEqual({
      sessionId: SESSION_ID,
      eventType: "interaction",
      eventData: { interactionId: "jarvis_panel_open" },
      referrer: null,
      deviceType: null,
    });
  });

  it("rejects extra event data for jarvis_panel_open", () => {
    expect(
      validateTrackPayload({
        ...interactionPayload("jarvis_panel_open"),
        eventData: {
          interactionId: "jarvis_panel_open",
          questionSource: "typed",
        },
      }),
    ).toBeNull();
  });

  it.each(["suggested", "typed"] as const)(
    "accepts jarvis_question_asked with a %s source",
    (questionSource) => {
      expect(
        validateTrackPayload({
          ...interactionPayload("jarvis_question_asked"),
          eventData: {
            interactionId: "jarvis_question_asked",
            questionSource,
          },
        }),
      ).toEqual({
        sessionId: SESSION_ID,
        eventType: "interaction",
        eventData: {
          interactionId: "jarvis_question_asked",
          questionSource,
        },
        referrer: null,
        deviceType: null,
      });
    },
  );

  it("rejects jarvis_question_asked without a question source", () => {
    expect(
      validateTrackPayload(interactionPayload("jarvis_question_asked")),
    ).toBeNull();
  });

  it("rejects jarvis_question_asked with an unknown question source", () => {
    expect(
      validateTrackPayload({
        ...interactionPayload("jarvis_question_asked"),
        eventData: {
          interactionId: "jarvis_question_asked",
          questionSource: "unknown",
        },
      }),
    ).toBeNull();
  });

  it("rejects extra event data for jarvis_question_asked", () => {
    expect(
      validateTrackPayload({
        ...interactionPayload("jarvis_question_asked"),
        eventData: {
          interactionId: "jarvis_question_asked",
          questionSource: "typed",
          question: "What did Klaas build?",
        },
      }),
    ).toBeNull();
  });
});

describe("analytics JSON content type validation", () => {
  it("accepts the JSON content types used by fetch and the existing beacon blob", () => {
    expect(isJsonContentType("application/json")).toBe(true);
    expect(isJsonContentType("application/json; charset=utf-8")).toBe(true);
  });

  it("rejects the default text content type of a string beacon body", () => {
    expect(isJsonContentType("text/plain;charset=UTF-8")).toBe(false);
  });
});
