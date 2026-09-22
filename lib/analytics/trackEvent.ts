import { normalizeReferrer } from "@/lib/analytics/trackValidation";
import { initialAcquisition, publicPath } from "./session";
import { activitySignals, excludeHumanContext, isInternalBrowser } from "./browserActivity";

export type AnalyticsEventType = "section_view" | "dwell_time" | "interaction";
export type AnalyticsDeviceType = "mobile" | "tablet" | "desktop";

interface TrackEventInput {
  sessionId: string;
  eventType: AnalyticsEventType;
  eventData: Record<string, unknown>;
  path?: string;
}

interface TrackEventOptions {
  preferBeacon?: boolean;
}

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
  const eventPath = publicPath(event.path ?? window.location.pathname);
  if (!eventPath) return;

  let acquisition;
  try {
    acquisition = initialAcquisition(event.sessionId, window.sessionStorage, window.location.pathname, window.location.search, document.referrer);
  } catch { return; }
  const payload = {
    ...event,
    ...readInitialContext(),
    referrer: acquisition.referrer ?? undefined,
    eventId: crypto.randomUUID(),
    path: eventPath,
    session: { ...acquisition, is_internal: isInternalBrowser() },
    signals: activitySignals(),
  };
  const body = JSON.stringify(payload);

  if (options.preferBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/track", blob)) return;
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: options.preferBeacon,
  }).then(async (response) => {
    if (!response.ok) return;
    const result = await response.json();
    if (result.humanContextAllowed === false) excludeHumanContext();
  }).catch(() => {
    // Analytics mag de bezoekerservaring nooit blokkeren.
  });
}
