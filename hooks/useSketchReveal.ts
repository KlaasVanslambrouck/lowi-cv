"use client";

import { useEffect, useState, type RefObject } from "react";

// "wait": accent staat klaar om te tekenen; "on": eindtoestand.
export type SketchState = "wait" | "on";

// Deel van de viewporthoogte dat een element binnen moet zijn voor het tekent.
export const SKETCH_THRESHOLD = 0.18;

// "Volledig in beeld". Niet exact 1: bij een gedraaid of geschaald element
// (bv. Stamp in de wachttoestand) rondt Chrome de ratio net onder 1 af.
const FULLY_VISIBLE = 0.95;

interface UseSketchRevealOptions {
  threshold?: number;
  enabled?: boolean;
}

// Eenmalige trigger voor de schetsaccenten (docs/redesign, Stijl.dc.html).
//
// Progressive enhancement: de beginstaat is "on", dus zonder JS, bij SSR,
// zonder IntersectionObserver, bij reduced motion en bij print staat alles in
// de eindtoestand. Alleen een element dat bij de eerste meting nog onder de
// viewport ligt gaat naar "wait" en tekent zodra het in beeld scrolt. Wat bij
// het laden al zichtbaar is of erboven ligt (bv. via een anker) blijft "on".
//
// De drempel werkt via rootMargin in plaats van intersectionRatio, zodat ook
// secties die hoger zijn dan de viewport betrouwbaar triggeren. Een element
// dat volledig in beeld staat tekent ook (einde van de pagina).
export function useSketchReveal(
  ref: RefObject<Element | null>,
  { threshold = SKETCH_THRESHOLD, enabled = true }: UseSketchRevealOptions = {},
): SketchState {
  const [state, setState] = useState<SketchState>("on");

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    if (typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (reducedMotion?.matches) return;

    let measured = false;

    function handle(entry: IntersectionObserverEntry | undefined, revealed: boolean) {
      if (!entry) return;

      if (!measured) {
        measured = true;
        // Al (deels) zichtbaar of erboven: eindtoestand houden, niets animeren.
        if (entry.boundingClientRect.top < window.innerHeight) {
          reveal();
        } else {
          setState("wait");
        }
        return;
      }

      if (revealed) reveal();
    }

    // Trigger: de bovenrand passeert (1 - threshold) van de viewporthoogte.
    const lineObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        handle(entry, entry?.isIntersecting ?? false);
      },
      { rootMargin: `0px 0px -${Math.round(threshold * 100)}% 0px` },
    );

    // Onderaan de pagina haalt een laag element die lijn soms nooit, omdat er
    // niet verder te scrollen valt. Volledig in beeld telt daarom ook.
    const fullObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        handle(entry, (entry?.intersectionRatio ?? 0) >= FULLY_VISIBLE);
      },
      { threshold: FULLY_VISIBLE },
    );

    function reveal() {
      stop();
      setState("on");
    }

    function stop() {
      lineObserver.disconnect();
      fullObserver.disconnect();
      window.removeEventListener("beforeprint", reveal);
      reducedMotion?.removeEventListener?.("change", reveal);
    }

    lineObserver.observe(element);
    fullObserver.observe(element);
    window.addEventListener("beforeprint", reveal);
    reducedMotion?.addEventListener?.("change", reveal);

    return stop;
  }, [ref, threshold, enabled]);

  return state;
}
