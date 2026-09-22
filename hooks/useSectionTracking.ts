"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { ActiveDwell } from "@/lib/analytics/activeDwell";
import { lastMeaningfulActivity, subscribeActivity } from "@/lib/analytics/browserActivity";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useSessionInsight } from "@/hooks/useSessionInsight";

export function useSectionTracking<T extends Element>(sectionId: string) {
  const sessionId = useAnalyticsSession();
  const { addSectionDwellTime, recordSectionView } = useSessionInsight();
  const entryRef = useRef<(entry: IntersectionObserverEntry) => void>(() => {});

  useEffect(() => {
    if (!sessionId) return;
    const path = window.location.pathname;
    let intersecting = false;
    let viewSent = false;
    let clock = new ActiveDwell(performance.now(), lastMeaningfulActivity());
    let rawCheckpoint = performance.now();
    let sentActive = 0;
    let localActive = 0;
    let impressionId = crypto.randomUUID();

    function updateState(now: number) {
      clock.state(now, document.visibilityState === "visible", document.hasFocus(), intersecting);
    }

    function creditLocal(now: number) {
      const total = clock.meaningfulTotal(now);
      if (total > localActive) {
        addSectionDwellTime(sectionId, (total - localActive) / 1000);
        localActive = total;
      }
    }

    function flush(preferBeacon = false) {
      if (!intersecting || !sessionId) return;
      const now = performance.now();
      creditLocal(now);
      const rawMs = now - rawCheckpoint;
      if (rawMs < 1) return;
      const meaningfulActive = clock.meaningfulTotal(now);
      trackEvent({
        sessionId,
        path,
        eventType: "dwell_time",
        eventData: {
          sectionId,
          seconds: Math.min(86400, rawMs / 1000),
          activeSeconds: Math.min(86400, Math.max(0, meaningfulActive - sentActive) / 1000),
          impressionId,
          dwellVersion: 2,
        },
      }, { preferBeacon });
      rawCheckpoint = now;
      sentActive = meaningfulActive;
    }

    entryRef.current = (entry) => {
      const next = entry.isIntersecting;
      if (next === intersecting) return;
      const now = performance.now();
      if (!next) flush();
      intersecting = next;
      if (next) {
        clock = new ActiveDwell(now, lastMeaningfulActivity());
        rawCheckpoint = now;
        sentActive = 0;
        localActive = 0;
        impressionId = crypto.randomUUID();
        if (!viewSent) {
          viewSent = true;
          recordSectionView(sectionId);
          trackEvent({ sessionId, path, eventType: "section_view", eventData: { sectionId } });
        }
      }
      updateState(now);
    };

    const unsubscribe = subscribeActivity((now, meaningful) => {
      if (meaningful) clock.activity(now);
      updateState(now);
      if (document.visibilityState !== "visible" || !document.hasFocus()) flush(true);
    });
    const localTimer = window.setInterval(() => creditLocal(performance.now()), 1000);
    const sendTimer = window.setInterval(() => flush(), 30_000);
    const hide = () => { flush(true); clock.state(performance.now(), false, false, intersecting); };
    const show = () => updateState(performance.now());
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    return () => {
      flush(true);
      unsubscribe();
      window.clearInterval(localTimer);
      window.clearInterval(sendTimer);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      entryRef.current = () => {};
    };
  }, [sessionId, sectionId, addSectionDwellTime, recordSectionView]);

  // Reobserve when the session becomes available, even if the element never moves.
  const handleEntry = useCallback((entry: IntersectionObserverEntry) => {
    if (sessionId) entryRef.current(entry);
  }, [sessionId]);
  return useInViewOnce<T>({ keepObserving: true, onEntryChange: handleEntry, threshold: 0.12 });
}
