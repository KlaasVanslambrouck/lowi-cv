"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { JarvisExplanation } from "@/types/content";

interface JarvisExplainContextValue {
  activeId: string | null;
  activeExplanation: JarvisExplanation | null;
  openExplanation: (id: string) => void;
  closeExplanation: () => void;
  isExplanationActive: (id: string) => boolean;
}

export const JarvisExplainContext = createContext<JarvisExplainContextValue>({
  activeId: null,
  activeExplanation: null,
  openExplanation: () => {},
  closeExplanation: () => {},
  isExplanationActive: () => false,
});

interface JarvisExplainProviderProps {
  children: ReactNode;
  explanations: JarvisExplanation[];
}

export function JarvisExplainProvider({
  children,
  explanations,
}: JarvisExplainProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeExplanation = useMemo(() => {
    if (!activeId) return null;
    return explanations.find((explanation) => explanation.id === activeId) ?? null;
  }, [activeId, explanations]);

  const openExplanation = useCallback(
    (id: string) => {
      const explanationExists = explanations.some(
        (explanation) => explanation.id === id,
      );
      if (!explanationExists) return;

      // TODO: later koppelen aan echte Jarvis-agent of server action.
      setActiveId(id);
    },
    [explanations],
  );

  const closeExplanation = useCallback(() => {
    setActiveId(null);
  }, []);

  const isExplanationActive = useCallback(
    (id: string) => activeId === id,
    [activeId],
  );

  const value = useMemo(
    () => ({
      activeId,
      activeExplanation,
      openExplanation,
      closeExplanation,
      isExplanationActive,
    }),
    [
      activeExplanation,
      activeId,
      closeExplanation,
      isExplanationActive,
      openExplanation,
    ],
  );

  return (
    <JarvisExplainContext.Provider value={value}>
      {children}
    </JarvisExplainContext.Provider>
  );
}
