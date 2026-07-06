"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useSessionInsight } from "@/hooks/useSessionInsight";

function secondsBetween(start: number, end: number): number {
  return Math.max(0, Math.round(((end - start) / 1000) * 10) / 10);
}

export function useSectionTracking<T extends Element>(sectionId: string) {
  const sessionId = useAnalyticsSession();
  const { addSectionDwellTime, recordSectionView } = useSessionInsight();
  const sessionIdRef = useRef<string | null>(null);
  const hasSentViewRef = useRef(false);
  const visibleSinceRef = useRef<number | null>(null);
  const insightCheckpointRef = useRef<number | null>(null);
  const insightIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const addLocalDwellSinceCheckpoint = useCallback(() => {
    const checkpoint = insightCheckpointRef.current;
    if (checkpoint === null) return;

    const now = performance.now();
    insightCheckpointRef.current = now;
    const seconds = secondsBetween(checkpoint, now);
    if (seconds > 0) {
      addSectionDwellTime(sectionId, seconds);
    }
  }, [addSectionDwellTime, sectionId]);

  const startLocalDwellTimer = useCallback(() => {
    if (insightIntervalRef.current !== null) return;

    insightCheckpointRef.current = performance.now();
    insightIntervalRef.current = window.setInterval(() => {
      addLocalDwellSinceCheckpoint();
    }, 1000);
  }, [addLocalDwellSinceCheckpoint]);

  const stopLocalDwellTimer = useCallback(() => {
    if (insightIntervalRef.current !== null) {
      window.clearInterval(insightIntervalRef.current);
      insightIntervalRef.current = null;
    }
    addLocalDwellSinceCheckpoint();
    insightCheckpointRef.current = null;
  }, [addLocalDwellSinceCheckpoint]);

  const flushDwellTime = useCallback(
    (preferBeacon = false) => {
      const currentSessionId = sessionIdRef.current;
      const visibleSince = visibleSinceRef.current;
      if (!currentSessionId || visibleSince === null) return;

      visibleSinceRef.current = null;
      const seconds = secondsBetween(visibleSince, performance.now());
      if (seconds <= 0) return;

      trackEvent(
        {
          sessionId: currentSessionId,
          eventType: "dwell_time",
          eventData: { sectionId, seconds },
        },
        { preferBeacon },
      );
    },
    [sectionId],
  );

  const handleEntryChange = useCallback(
    (entry: IntersectionObserverEntry) => {
      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId) return;

      if (entry.isIntersecting) {
        if (!hasSentViewRef.current) {
          hasSentViewRef.current = true;
          recordSectionView(sectionId);
          trackEvent({
            sessionId: currentSessionId,
            eventType: "section_view",
            eventData: { sectionId },
          });
        }

        if (visibleSinceRef.current === null) {
          visibleSinceRef.current = performance.now();
        }
        startLocalDwellTimer();
        return;
      }

      stopLocalDwellTimer();
      flushDwellTime();
    },
    [
      flushDwellTime,
      recordSectionView,
      sectionId,
      startLocalDwellTimer,
      stopLocalDwellTimer,
    ],
  );

  const [sectionRef, isVisible] = useInViewOnce<T>({
    keepObserving: true,
    onEntryChange: handleEntryChange,
    threshold: 0.12,
  });

  useEffect(() => {
    function handlePageHide() {
      stopLocalDwellTimer();
      flushDwellTime(true);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        stopLocalDwellTimer();
        flushDwellTime(true);
      }
    }

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopLocalDwellTimer();
      flushDwellTime(true);
    };
  }, [flushDwellTime, stopLocalDwellTimer]);

  return [sectionRef, isVisible] as const;
}
