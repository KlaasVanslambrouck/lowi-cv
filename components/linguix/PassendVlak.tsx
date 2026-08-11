"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./PassendVlak.module.css";

interface PassendVlakProps {
  children: ReactNode;
}

/**
 * Onder deze schaal worden schuifregelaars en knoppen te klein om vlot te
 * bedienen tijdens een demo. Daar stopt het krimpen; wat dan nog niet past mag
 * intern scrollen.
 */
const MINIMUM_SCHAAL = 0.72;
const MAXIMUM_SCHAAL = 1;

/**
 * Verschillen kleiner dan dit zijn niet te zien en zouden alleen een
 * meet-hermeet-lus veroorzaken.
 */
const SCHAALDREMPEL = 0.005;

function begrens(waarde: number): number {
  return Math.min(Math.max(waarde, MINIMUM_SCHAAL), MAXIMUM_SCHAAL);
}

/**
 * Schaalt een DOM-component (geen SVG, dus geen viewBox) zodat het binnen de
 * beschikbare hoogte past. De schaalfactor is hard begrensd tussen 0,72 en 1.
 *
 * `transform: scale` laat de muisaanwijzerpositie intact — browsers rekenen
 * hit-testing in het getransformeerde stelsel. Wat het wél zou breken is
 * `position: fixed` binnen het component; geen van de drie gebruikte
 * componenten doet dat. Bewust géén `will-change: transform`: de schaalfactor
 * is statisch tussen twee metingen, dus dat kost alleen geheugen.
 */
export default function PassendVlak({ children }: PassendVlakProps) {
  const buitenRef = useRef<HTMLDivElement | null>(null);
  const binnenRef = useRef<HTMLDivElement | null>(null);
  const [staat, setStaat] = useState({ schaal: MAXIMUM_SCHAAL, past: true });

  useEffect(() => {
    const buiten = buitenRef.current;
    const binnen = binnenRef.current;
    if (!buiten || !binnen) return;

    // Een transform verandert de layout niet, dus offsetHeight blijft de
    // ongeschaalde hoogte. Daardoor is er geen terugkoppeling tussen de
    // gemeten hoogte en de schaal die we erop zetten.
    const meet = (): void => {
      const beschikbaar = buiten.clientHeight;
      const nodig = binnen.offsetHeight;
      if (beschikbaar <= 0 || nodig <= 0) return;

      const schaal = begrens(beschikbaar / nodig);
      // Chromium rekent een verkleinde transform níét van het scrollgebied af:
      // scrollHeight blijft de ongeschaalde hoogte. Zonder deze vlag zou er
      // dus een scrollbalk staan bij een component dat visueel wél past.
      const past = nodig * schaal <= beschikbaar + 1;

      setStaat((huidig) =>
        Math.abs(schaal - huidig.schaal) < SCHAALDREMPEL &&
        past === huidig.past
          ? huidig
          : { schaal, past },
      );
    };

    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(buiten);
    waarnemer.observe(binnen);
    meet();

    return () => waarnemer.disconnect();
  }, []);

  return (
    <div
      ref={buitenRef}
      className={`${styles.buiten} ${staat.past ? styles.buitenPast : ""}`}
    >
      <div
        ref={binnenRef}
        className={styles.binnen}
        style={{ transform: `scale(${staat.schaal})` }}
      >
        {children}
      </div>
    </div>
  );
}
