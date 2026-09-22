import { normalizeReferrer } from "./privacy";

export const INTERNAL_KEY = "portfolio-internal";
export const ACQUISITION_KEY = "portfolio-acquisition-v1";
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function internalFlag(search: string, storage: StorageLike): boolean {
  const flag = new URLSearchParams(search).get("internal");
  if (flag === "1") storage.setItem(INTERNAL_KEY, "1");
  if (flag === "0") storage.removeItem(INTERNAL_KEY);
  return flag === "1" || (flag !== "0" && storage.getItem(INTERNAL_KEY) === "1");
}

// Only public routes; do not persist arbitrary URLs, query strings or fragments.
export function publicPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 200) return null;
  const path = value.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return /^(?:\/(?:en(?:\/(?:nidus|lowi))?|nidus|lowi|robots\.txt|sitemap\.xml|llms\.txt|cv\.pdf|cv\.json)?|\/(?:cases|projects)\/[a-z0-9-]+(?:\/[a-z0-9-]+)?)$/.test(path) ? path : null;
}

export function campaignValue(value: unknown): string | null {
  // Campaign labels only, not arbitrary URLs, email addresses or free text.
  return typeof value === "string" && /^[a-zA-Z0-9 _.-]{1,100}$/.test(value) ? value : null;
}

export function parseAcquisition(path: string, search: string, referrer: string) {
  const query = new URLSearchParams(search);
  return {
    landing_path: publicPath(path),
    referrer: normalizeReferrer(referrer),
    source: campaignValue(query.get("utm_source")),
    medium: campaignValue(query.get("utm_medium")),
    campaign: campaignValue(query.get("utm_campaign")),
    content: campaignValue(query.get("utm_content")),
    via: campaignValue(query.get("via")),
  };
}
export type Acquisition = ReturnType<typeof parseAcquisition>;

export function initialAcquisition(sessionId: string, storage: StorageLike, path: string, search: string, referrer: string): Acquisition {
  try {
    const stored = JSON.parse(storage.getItem(ACQUISITION_KEY) ?? "null");
    if (stored?.sessionId === sessionId && publicPath(stored.acquisition?.landing_path)) return stored.acquisition;
  } catch { /* Replace an invalid local cache. */ }
  const acquisition = parseAcquisition(path, search, referrer);
  storage.setItem(ACQUISITION_KEY, JSON.stringify({ sessionId, acquisition }));
  return acquisition;
}
