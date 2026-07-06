"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SectionInsight {
  sectionId: string;
  views: number;
  totalSeconds: number;
  lastViewedAt: number;
}

interface SessionInsightContextValue {
  sectionInsights: SectionInsight[];
  activeProactiveSectionId: string | null;
  recordSectionView: (sectionId: string) => void;
  addSectionDwellTime: (sectionId: string, seconds: number) => void;
  hasShownProactiveSuggestion: (sectionId: string) => boolean;
  markProactiveSuggestionShown: (sectionId: string) => void;
  setActiveProactiveSuggestion: (sectionId: string | null) => void;
}

export const SessionInsightContext =
  createContext<SessionInsightContextValue>({
    sectionInsights: [],
    activeProactiveSectionId: null,
    recordSectionView: () => {},
    addSectionDwellTime: () => {},
    hasShownProactiveSuggestion: () => false,
    markProactiveSuggestionShown: () => {},
    setActiveProactiveSuggestion: () => {},
  });

export function SessionInsightProvider({ children }: { children: ReactNode }) {
  const [insightsBySection, setInsightsBySection] = useState<
    Record<string, SectionInsight>
  >({});
  const [shownSuggestions, setShownSuggestions] = useState<Record<string, true>>(
    {},
  );
  const [activeProactiveSectionId, setActiveProactiveSectionId] = useState<
    string | null
  >(null);

  const recordSectionView = useCallback((sectionId: string) => {
    setInsightsBySection((previous) => {
      const current = previous[sectionId];
      return {
        ...previous,
        [sectionId]: {
          sectionId,
          views: (current?.views ?? 0) + 1,
          totalSeconds: current?.totalSeconds ?? 0,
          lastViewedAt: Date.now(),
        },
      };
    });
  }, []);

  const addSectionDwellTime = useCallback(
    (sectionId: string, seconds: number) => {
      if (seconds <= 0) return;

      setInsightsBySection((previous) => {
        const current = previous[sectionId];
        return {
          ...previous,
          [sectionId]: {
            sectionId,
            views: current?.views ?? 0,
            totalSeconds:
              Math.round(((current?.totalSeconds ?? 0) + seconds) * 10) / 10,
            lastViewedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const hasShownProactiveSuggestion = useCallback(
    (sectionId: string) => Boolean(shownSuggestions[sectionId]),
    [shownSuggestions],
  );

  const markProactiveSuggestionShown = useCallback((sectionId: string) => {
    setShownSuggestions((previous) => ({
      ...previous,
      [sectionId]: true,
    }));
  }, []);

  const setActiveProactiveSuggestion = useCallback(
    (sectionId: string | null) => {
      setActiveProactiveSectionId(sectionId);
    },
    [],
  );

  const sectionInsights = useMemo(
    () =>
      Object.values(insightsBySection).sort(
        (left, right) => right.lastViewedAt - left.lastViewedAt,
      ),
    [insightsBySection],
  );

  const value = useMemo(
    () => ({
      sectionInsights,
      activeProactiveSectionId,
      recordSectionView,
      addSectionDwellTime,
      hasShownProactiveSuggestion,
      markProactiveSuggestionShown,
      setActiveProactiveSuggestion,
    }),
    [
      activeProactiveSectionId,
      addSectionDwellTime,
      hasShownProactiveSuggestion,
      markProactiveSuggestionShown,
      recordSectionView,
      sectionInsights,
      setActiveProactiveSuggestion,
    ],
  );

  return (
    <SessionInsightContext.Provider value={value}>
      {children}
    </SessionInsightContext.Provider>
  );
}
