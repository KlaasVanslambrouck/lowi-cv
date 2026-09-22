import { classifyUserAgent } from "./classify";
import { normalizeReferrer } from "./privacy";
import { publicPath } from "./session";

export function requestObservation(url: URL, method: string, headers: Headers, trustedVercel = false) {
  const path = publicPath(url.pathname);
  if (!path || !["GET", "HEAD"].includes(method)) return null;
  // Navigation prefetches/RSC fetches are not independent page visits.
  if (headers.get("next-router-prefetch") || headers.get("purpose") === "prefetch" || headers.get("sec-purpose")?.includes("prefetch") || headers.get("rsc") === "1") return null;
  const classification = classifyUserAgent(headers.get("user-agent"));
  return {
    path, method,
    referrer: normalizeReferrer(headers.get("referer")),
    ...classification,
    ...coarseGeography(headers, trustedVercel),
    // Only an explicit marker is a fact here; no cookie/IP linkage to a person.
    is_internal: url.searchParams.get("internal") === "1" ? true : null,
  };
}

export function coarseGeography(headers: Headers, trustedVercel: boolean) {
  const country = trustedVercel ? headers.get("x-vercel-ip-country") : null;
  const region = trustedVercel ? headers.get("x-vercel-ip-country-region") : null;
  return {
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    region: region && /^[a-zA-Z0-9-]{1,10}$/.test(region) ? region : null,
  };
}
