"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { publicPath } from "@/lib/analytics/session";
import { subscribeActivity } from "@/lib/analytics/browserActivity";

export default function AnalyticsObserver() {
  const path = usePathname();
  const sessionId = useAnalyticsSession();
  const lastPage = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionId || !publicPath(path)) return;
    const unsubscribe = subscribeActivity(() => {});
    if (lastPage.current !== path) {
      lastPage.current = path;
      trackEvent({ sessionId, eventType: "interaction", eventData: { interactionId: "page_view" } });
    }
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (link && new URL(link.href, location.href).pathname === "/cv.pdf") {
        trackEvent({ sessionId, eventType: "interaction", eventData: { interactionId: "cv_download" } }, { preferBeacon: true });
      }
    };
    document.addEventListener("click", click);
    return () => { unsubscribe(); document.removeEventListener("click", click); };
  }, [path, sessionId]);
  return null;
}
