"use client";

import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";

interface ScrollVoortgang {
  voortgangRef: MutableRefObject<number>;
  actiefHoofdstukIndex: number;
  inBeeld: boolean;
}

export function useScrollVoortgang(
  containerRef: RefObject<HTMLElement | null>,
  aantalHoofdstukken: number,
  actief: boolean,
): ScrollVoortgang {
  // De scène leest deze ref later per frame. React-state voor de voortgang
  // zou de componentboom bij het scrollen tot zestig keer per seconde renderen.
  const voortgangRef = useRef<number>(0);
  const [actiefHoofdstukIndex, setActiefHoofdstukIndex] = useState<number>(0);
  const [inBeeld, setInBeeld] = useState<boolean>(false);

  useEffect(() => {
    if (!actief || aantalHoofdstukken < 1) {
      voortgangRef.current = 0;
      return;
    }

    let frameId: number | null = null;
    let zichtbaar: boolean = false;
    let vorigHoofdstukIndex: number = -1;

    function updateVoortgang(): void {
      frameId = null;
      if (!zichtbaar) return;
      const container = containerRef.current;

      if (container) {
        // Iedere frame opnieuw meten vangt ook resize en gewijzigde dvh op.
        const { top, height } = container.getBoundingClientRect();
        // Een hoofdstuk bereikt zijn eindstaat zodra zijn tekst gecentreerd
        // staat (sectietop = viewporttop). Begin de eerste overgang daarom
        // al bij binnenkomst. Zo is ook de deling klaar vóór het canvas vertrekt.
        const sectieHoogte = height / aantalHoofdstukken;
        const voortgang = height > 0 ? Math.min(1, Math.max(0, (sectieHoogte - top) / height)) : 0;
        voortgangRef.current = voortgang;

        // De DOM-indicator volgt de tekstsectie, onafhankelijk van de overgang.
        const index = Math.min(
          aantalHoofdstukken - 1,
          Math.max(0, Math.floor(-top / sectieHoogte)),
        );

        if (index !== vorigHoofdstukIndex) {
          vorigHoofdstukIndex = index;
          setActiefHoofdstukIndex(index);
        }
      }

      frameId = window.requestAnimationFrame(updateVoortgang);
    }

    const observer = new IntersectionObserver((entries) => {
      zichtbaar = entries.some((entry) => entry.isIntersecting);
      setInBeeld(zichtbaar);
      if (zichtbaar && frameId === null) {
        // Behoud de laatste refwaarde; de scène dempt vanaf haar huidige staat.
        frameId = window.requestAnimationFrame(updateVoortgang);
      } else if (!zichtbaar && frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    });

    function observeerContainer(): boolean {
      const container = containerRef.current;
      if (!container) return false;
      observer.observe(container);
      return true;
    }

    // Alleen bij een later gemounte container tijdelijk de DOM volgen;
    // geen wachtende rAF-loop buiten beeld.
    const mountObserver = new MutationObserver(() => {
      if (observeerContainer()) mountObserver.disconnect();
    });
    if (!observeerContainer()) {
      mountObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      zichtbaar = false;
      observer.disconnect();
      mountObserver.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [actief, aantalHoofdstukken, containerRef]);

  return {
    voortgangRef,
    actiefHoofdstukIndex: actief ? actiefHoofdstukIndex : 0,
    inBeeld: actief && inBeeld,
  };
}
