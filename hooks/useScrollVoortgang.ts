"use client";

import { useEffect, useState, type RefObject } from "react";

// Een stand of hoofdstuk "gaat in" zodra de bovenrand deze lijn passeert
// (50 % van de viewporthoogte), zoals in docs/redesign (Overdracht §3).
export const FASE_LIJN = 0.5;

// Het laatste element (in documentvolgorde) waarvan de bovenrand boven de lijn
// ligt; null als er nog geen voorbij is.
export function laatsteBovenLijn<T>(
  elementen: readonly T[],
  bovenrand: (element: T) => number,
  lijn: number,
): T | null {
  let laatste: T | null = null;
  for (const element of elementen) {
    if (bovenrand(element) < lijn) laatste = element;
  }
  return laatste;
}

// Native scroll, geen scroll-hijacking. Leest binnen de container:
// - [data-phase]: de stand van de cel (hoofdstukken en de drie deelstanden
//   van de deling);
// - [data-section-id]: het actieve hoofdstuk voor de hoofdstukbalk. De
//   deelstanden hebben bewust geen data-section-id, zodat analytics en het
//   aantal hoofdstukken gelijk blijven.
// Metingen gaan per animatieframe, zodat scrollen niet elke pixel rendert.
export function useScrollVoortgang(
  containerRef: RefObject<HTMLElement | null>,
  actief = true,
): { actieveFase: string | null; actiefHoofdstukIndex: number } {
  const [actieveFase, setActieveFase] = useState<string | null>(null);
  const [actiefHoofdstukIndex, setActiefHoofdstukIndex] = useState(-1);

  useEffect(() => {
    const container = containerRef.current;
    if (!actief || !container) return;

    const fasen = [...container.querySelectorAll<HTMLElement>("[data-phase]")];
    const hoofdstukken = [...container.querySelectorAll<HTMLElement>("[data-section-id]")];
    const bovenrand = (element: HTMLElement) => element.getBoundingClientRect().top;
    let frame = 0;

    function meet() {
      frame = 0;
      const lijn = window.innerHeight * FASE_LIJN;
      setActieveFase(laatsteBovenLijn(fasen, bovenrand, lijn)?.dataset.phase ?? null);
      const hoofdstuk = laatsteBovenLijn(hoofdstukken, bovenrand, lijn);
      setActiefHoofdstukIndex(hoofdstuk ? hoofdstukken.indexOf(hoofdstuk) : -1);
    }

    function plan() {
      if (!frame) frame = requestAnimationFrame(meet);
    }

    plan();
    const resize = new ResizeObserver(plan);
    resize.observe(container);
    window.addEventListener("scroll", plan, { passive: true });
    window.addEventListener("resize", plan);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", plan);
      window.removeEventListener("resize", plan);
    };
  }, [actief, containerRef]);

  return { actieveFase, actiefHoofdstukIndex };
}
