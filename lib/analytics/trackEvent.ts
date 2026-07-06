import { normalizeReferrer } from "@/lib/analytics/trackValidation";

export type AnalyticsEventType = "section_view" | "dwell_time" | "interaction";
export type AnalyticsDeviceType = "mobile" | "tablet" | "desktop";

interface TrackEventInput {
  sessionId: string;
  eventType: AnalyticsEventType;
  eventData: Record<string, unknown>;
}

interface TrackEventOptions {
  preferBeacon?: boolean;
}

let initialContextSent = false;
let initialContext:
  | { referrer?: string; deviceType?: AnalyticsDeviceType }
  | null = null;

function readDeviceType(): AnalyticsDeviceType {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function readInitialContext() {
  if (initialContext) return initialContext;

  const referrer = normalizeReferrer(document.referrer);

  initialContext = {
    referrer: referrer ?? undefined,
    deviceType: readDeviceType(),
  };

  return initialContext;
}

export function trackEvent(
  event: TrackEventInput,
  options: TrackEventOptions = {},
) {
  if (typeof window === "undefined") return;

  const payload = initialContextSent
    ? event
    : {
        ...event,
        ...readInitialContext(),
      };

  initialContextSent = true;
  const body = JSON.stringify(payload);

  if (options.preferBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/track", blob);
    return;
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: options.preferBeacon,
  }).catch(() => {
    // Analytics mag de bezoekerservaring nooit blokkeren.
  });
}
