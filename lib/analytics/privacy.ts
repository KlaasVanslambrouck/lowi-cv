const MAX_RAW_REFERRER_LENGTH = 2048;
const MAX_REFERRER_LENGTH = 255;

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

