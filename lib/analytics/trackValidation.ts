export const EVENT_TYPES = ["section_view", "dwell_time", "interaction"] as const;
export const DEVICE_TYPES = ["mobile", "tablet", "desktop"] as const;

export const MAX_BODY_BYTES = 4096;
export const MAX_EVENT_DATA_BYTES = 2048;
export const MAX_REFERRER_LENGTH = 255;

const MAX_RAW_REFERRER_LENGTH = 2048;
const MAX_ID_LENGTH = 64;
const MAX_INTERACTION_VALUE_LENGTH = 24;
const MAX_SUGGESTED_QUESTION_LENGTH = 240;
const MAX_DWELL_SECONDS = 24 * 60 * 60;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

const TOP_LEVEL_KEYS = [
  "sessionId",
  "eventType",
  "eventData",
  "referrer",
  "deviceType",
] as const;
const LANGUAGE_VALUES = ["nl", "en"] as const;
const THEME_VALUES = ["dark", "light"] as const;
const XRAY_VALUES = ["on", "off"] as const;
const INTERACTION_IDS = [
  "language_toggle",
  "theme_toggle",
  "xray_toggle",
  "project_exploded_open",
  "skill_node_hover",
  "jarvis_terminal_open",
  "jarvis_proactive_shown",
  "jarvis_proactive_clicked",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type DeviceType = (typeof DEVICE_TYPES)[number];
type SectionEventData = {
  sectionId: string;
};

type DwellTimeEventData = {
  sectionId: string;
  seconds: number;
};

type InteractionEventData =
  | { interactionId: "language_toggle"; value: "nl" | "en" }
  | { interactionId: "theme_toggle"; value: "dark" | "light" }
  | { interactionId: "xray_toggle"; value: "on" | "off" }
  | { interactionId: "project_exploded_open"; projectId: string }
  | { interactionId: "skill_node_hover"; skillId: string }
  | { interactionId: "jarvis_terminal_open" }
  | { interactionId: "jarvis_proactive_shown"; sectionId: string }
  | {
      interactionId: "jarvis_proactive_clicked";
      sectionId: string;
      suggestedQuestion: string;
    };

export type AnalyticsEventData =
  | SectionEventData
  | DwellTimeEventData
  | InteractionEventData;

export interface TrackPayload {
  sessionId: string;
  eventType: EventType;
  eventData: AnalyticsEventData;
  referrer: string | null;
  deviceType: DeviceType | null;
}

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function isJsonContentType(contentType: string | null): boolean {
  return (
    contentType
      ?.split(";")[0]
      ?.trim()
      .toLowerCase() === "application/json"
  );
}

export function normalizeReferrer(
  referrer: string | null | undefined,
): string | null {
  const candidate = referrer?.trim();
  if (!candidate || candidate.length > MAX_RAW_REFERRER_LENGTH) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    const normalized = url.origin === "null" ? url.hostname : url.origin;
    if (!normalized || normalized.length > MAX_REFERRER_LENGTH) return null;

    return normalized;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  record: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Object.keys(record).every((key) => allowedKeys.includes(key));
}

function readEnum<TAllowed extends readonly string[]>(
  value: unknown,
  allowedValues: TAllowed,
): TAllowed[number] | null {
  if (
    typeof value !== "string" ||
    value.length > MAX_INTERACTION_VALUE_LENGTH ||
    !allowedValues.includes(value)
  ) {
    return null;
  }

  return value;
}

function readBoundedString(
  value: unknown,
  maxLength: number,
  pattern?: RegExp,
): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  if (pattern && !pattern.test(trimmed)) return null;

  return trimmed;
}

function readSlugId(value: unknown): string | null {
  return readBoundedString(value, MAX_ID_LENGTH, SLUG_ID_PATTERN);
}

function validateSectionEventData(
  eventData: Record<string, unknown>,
): SectionEventData | null {
  if (!hasOnlyKeys(eventData, ["sectionId"])) return null;

  const sectionId = readSlugId(eventData.sectionId);
  return sectionId ? { sectionId } : null;
}

function validateDwellTimeEventData(
  eventData: Record<string, unknown>,
): DwellTimeEventData | null {
  if (!hasOnlyKeys(eventData, ["sectionId", "seconds"])) return null;

  const sectionId = readSlugId(eventData.sectionId);
  const seconds = eventData.seconds;

  if (
    !sectionId ||
    typeof seconds !== "number" ||
    !Number.isFinite(seconds) ||
    seconds <= 0 ||
    seconds > MAX_DWELL_SECONDS
  ) {
    return null;
  }

  return { sectionId, seconds };
}

function validateInteractionEventData(
  eventData: Record<string, unknown>,
): InteractionEventData | null {
  const interactionId = readEnum(eventData.interactionId, INTERACTION_IDS);
  if (!interactionId) return null;

  switch (interactionId) {
    case "language_toggle": {
      if (!hasOnlyKeys(eventData, ["interactionId", "value"])) return null;
      const value = readEnum(eventData.value, LANGUAGE_VALUES);
      return value ? { interactionId, value } : null;
    }
    case "theme_toggle": {
      if (!hasOnlyKeys(eventData, ["interactionId", "value"])) return null;
      const value = readEnum(eventData.value, THEME_VALUES);
      return value ? { interactionId, value } : null;
    }
    case "xray_toggle": {
      if (!hasOnlyKeys(eventData, ["interactionId", "value"])) return null;
      const value = readEnum(eventData.value, XRAY_VALUES);
      return value ? { interactionId, value } : null;
    }
    case "project_exploded_open": {
      if (!hasOnlyKeys(eventData, ["interactionId", "projectId"])) return null;
      const projectId = readSlugId(eventData.projectId);
      return projectId ? { interactionId, projectId } : null;
    }
    case "skill_node_hover": {
      if (!hasOnlyKeys(eventData, ["interactionId", "skillId"])) return null;
      const skillId = readSlugId(eventData.skillId);
      return skillId ? { interactionId, skillId } : null;
    }
    case "jarvis_terminal_open": {
      return hasOnlyKeys(eventData, ["interactionId"])
        ? { interactionId }
        : null;
    }
    case "jarvis_proactive_shown": {
      if (!hasOnlyKeys(eventData, ["interactionId", "sectionId"])) return null;
      const sectionId = readSlugId(eventData.sectionId);
      return sectionId ? { interactionId, sectionId } : null;
    }
    case "jarvis_proactive_clicked": {
      if (
        !hasOnlyKeys(eventData, [
          "interactionId",
          "sectionId",
          "suggestedQuestion",
        ])
      ) {
        return null;
      }

      const sectionId = readSlugId(eventData.sectionId);
      const suggestedQuestion = readBoundedString(
        eventData.suggestedQuestion,
        MAX_SUGGESTED_QUESTION_LENGTH,
      );

      return sectionId && suggestedQuestion
        ? { interactionId, sectionId, suggestedQuestion }
        : null;
    }
  }
}

function validateEventData(
  eventType: EventType,
  eventData: unknown,
): AnalyticsEventData | null {
  if (!isRecord(eventData)) return null;
  if (byteLength(JSON.stringify(eventData)) > MAX_EVENT_DATA_BYTES) return null;

  switch (eventType) {
    case "section_view":
      return validateSectionEventData(eventData);
    case "dwell_time":
      return validateDwellTimeEventData(eventData);
    case "interaction":
      return validateInteractionEventData(eventData);
  }
}

export function validateTrackPayload(body: unknown): TrackPayload | null {
  if (!isRecord(body) || !hasOnlyKeys(body, TOP_LEVEL_KEYS)) return null;

  const sessionId = readBoundedString(body.sessionId, 36, UUID_PATTERN);
  const eventType = readEnum(body.eventType, EVENT_TYPES);
  if (!sessionId || !eventType) return null;

  const eventData = validateEventData(eventType, body.eventData);
  if (!eventData) return null;

  if (body.referrer !== undefined && typeof body.referrer !== "string") {
    return null;
  }

  const deviceType =
    body.deviceType === undefined
      ? null
      : readEnum(body.deviceType, DEVICE_TYPES);
  if (body.deviceType !== undefined && !deviceType) return null;

  return {
    sessionId: sessionId.toLowerCase(),
    eventType,
    eventData,
    referrer:
      typeof body.referrer === "string"
        ? normalizeReferrer(body.referrer)
        : null,
    deviceType,
  };
}
