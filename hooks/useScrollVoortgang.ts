"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Native scroll; refs for pixels, React state only for chapter boundaries. */
export function useScrollVoortgang(containerRef: RefObject<HTMLElement | null>, aantalHoofdstukken: number, actief: boolean) {
  const voortgangRef = useRef(0);
  const [actiefHoofdstukIndex, setActiefHoofdstukIndex] = useState(0);
  const [inBeeld, setInBeeld] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!actief || !container || aantalHoofdstukken < 1) return;
    let frame = 0, vorig = -1;
    let zichtbaar = false;
    const secties = [...container.querySelectorAll<HTMLElement>('[data-section-id]')];
    const meter = container.querySelector<HTMLElement>('[data-lowi-progress]');
    function meet() {
      frame = 0;
      if (!zichtbaar || document.hidden) return;
      const vh = window.innerHeight;
      let p = 0, index = 0;
      secties.forEach((sectie, i) => {
        const top = sectie.getBoundingClientRect().top;
        // Copy enters at 85% of the viewport; camera follows at 58%.
        if (top < vh * .58) {
          index = i;
          p = (i + Math.min(1, Math.max(0, (vh * .58 - top) / (vh * .36)))) / aantalHoofdstukken;
        }
      });
      voortgangRef.current = p;
      meter?.style.setProperty('--scroll-progress', String(p));
      if (index !== vorig) { vorig = index; setActiefHoofdstukIndex(index); }
    }
    function plan() { if (!frame) frame = requestAnimationFrame(meet); }
    function visibility() { setInBeeld(zichtbaar && !document.hidden); plan(); }
    const observer = new IntersectionObserver(entries => {
      zichtbaar = entries.some(e => e.isIntersecting);
      visibility();
    });
    observer.observe(container.querySelector('[data-lowi-canvas-slot]') ?? container);
    const resize = new ResizeObserver(plan);
    resize.observe(container);
    window.addEventListener('scroll', plan, { passive: true });
    window.addEventListener('resize', plan);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', plan);
      window.removeEventListener('resize', plan);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [actief, aantalHoofdstukken, containerRef]);
  return { voortgangRef, actiefHoofdstukIndex, inBeeld: actief && inBeeld };
}
