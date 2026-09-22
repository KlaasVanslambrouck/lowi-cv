import { campaignValue, publicPath, type Acquisition } from "./session";
import { normalizeReferrer } from "./privacy";

export interface SessionContext extends Acquisition { is_internal: boolean }
export interface ClientSignals {
  webdriver: boolean;
  firstInteractionMs: number | null;
  interactionCounts: Record<string, number>;
  visible: boolean;
  focused: boolean;
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function validateSession(value: unknown): SessionContext | null {
  if (!record(value) || Object.keys(value).some((k) => !["landing_path", "referrer", "source", "medium", "campaign", "content", "via", "is_internal"].includes(k))) return null;
  if (typeof value.is_internal !== "boolean") return null;
  const landing_path = publicPath(value.landing_path);
  if (!landing_path) return null;
  const labels = { source: null, medium: null, campaign: null, content: null, via: null } as Pick<Acquisition, "source" | "medium" | "campaign" | "content" | "via">;
  for (const key of Object.keys(labels) as (keyof typeof labels)[]) {
    if (value[key] !== null && value[key] !== undefined && !campaignValue(value[key])) return null;
    labels[key] = campaignValue(value[key]);
  }
  if (value.referrer !== null && value.referrer !== undefined && typeof value.referrer !== "string") return null;
  return { ...labels, landing_path, referrer: normalizeReferrer(value.referrer as string | null), is_internal: value.is_internal };
}

export function validateSignals(value: unknown): ClientSignals | null {
  if (!record(value) || Object.keys(value).some((k) => !["webdriver", "firstInteractionMs", "interactionCounts", "visible", "focused"].includes(k))) return null;
  if (typeof value.webdriver !== "boolean" || typeof value.visible !== "boolean" || typeof value.focused !== "boolean") return null;
  const first = value.firstInteractionMs;
  if (first !== null && (typeof first !== "number" || !Number.isFinite(first) || first < 0 || first > 604800000)) return null;
  if (!record(value.interactionCounts)) return null;
  const interactionCounts: Record<string, number> = {};
  for (const [key, count] of Object.entries(value.interactionCounts)) {
    if (!["pointermove", "pointerdown", "touchstart", "keydown", "scroll"].includes(key) || typeof count !== "number" || !Number.isInteger(count) || count < 0 || count > 100000) return null;
    interactionCounts[key] = count;
  }
  return { webdriver: value.webdriver, firstInteractionMs: first, interactionCounts, visible: value.visible, focused: value.focused };
}
