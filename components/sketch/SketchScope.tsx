"use client";

import { createContext, useContext, type ReactNode, type RefObject } from "react";
import { useSketchReveal, type SketchState } from "@/hooks/useSketchReveal";

const SketchStateContext = createContext<SketchState | null>(null);

interface SketchScopeProps {
  state: SketchState;
  children: ReactNode;
}

// Laat alle accenten in een sectie samen starten, zoals in de artboards: de
// sectie roept useSketchReveal aan en geeft de staat hier door. De delays
// (delay={1..6}) tellen dan vanaf het moment dat de sectie in beeld komt.
export function SketchScope({ state, children }: SketchScopeProps) {
  return (
    <SketchStateContext.Provider value={state}>
      {children}
    </SketchStateContext.Provider>
  );
}

// Staat van de omliggende SketchScope, of anders een eigen trigger op `ref`.
export function useSketchState(ref: RefObject<Element | null>): SketchState {
  const scoped = useContext(SketchStateContext);
  const own = useSketchReveal(ref, { enabled: scoped === null });
  return scoped ?? own;
}
