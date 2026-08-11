"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LinguixVisueel from "@/components/linguix/LinguixVisueel";
import { magPresentatieToetsAfhandelen } from "@/lib/linguixPresentatieToetsen";
import type { LinguixSectionContent } from "@/types/linguix";
import styles from "./PresentatieWeergave.module.css";

interface PresentatieWeergaveProps {
  secties: readonly LinguixSectionContent[];
  actiefIndex: number;
  onGaNaarIndex: (index: number) => void;
  onVerlaat: () => void;
}

const VOLGENDE_TOETSEN = new Set([
  "ArrowRight",
  "PageDown",
  " ",
  "Spacebar",
]);
const VORIGE_TOETSEN = new Set(["ArrowLeft", "PageUp"]);
const VOLLEDIG_SCHERM_TOETSEN = new Set(["f", "F"]);

/** Hoe lang de sneltoetskaart blijft staan voor ze wegvaagt. */
const SNELTOETSEN_MS = 5000;

/**
 * In volledig scherm doet Escape twee dingen tegelijk: de browser verlaat het
 * volledige scherm, en sommige browsers leveren dezelfde toetsaanslag ook nog
 * bij ons af. Binnen dit venster negeren we die tweede, zodat één druk niet
 * meteen de hele presentatie sluit. Een bewuste tweede druk komt er ruim
 * overheen.
 */
const ESCAPE_GENADE_MS = 250;

function aantalSchermen(sectie: LinguixSectionContent): number {
  return sectie.presentatie.visueleStappen?.length ?? 1;
}

/**
 * Cijfer 1 t/m 9 gaat naar blok 1 t/m 9, cijfer 0 gaat naar blok 10.
 * Geeft -1 wanneer de toets geen cijfertoets is.
 */
function indexVoorCijfertoets(key: string): number {
  if (key.length !== 1 || key < "0" || key > "9") return -1;
  return key === "0" ? 9 : Number(key) - 1;
}

export default function PresentatieWeergave({
  secties,
  actiefIndex,
  onGaNaarIndex,
  onVerlaat,
}: PresentatieWeergaveProps) {
  const deckRef = useRef<HTMLElement | null>(null);
  const [stapIndex, setStapIndex] = useState(0);
  const [toonSneltoetsen, setToonSneltoetsen] = useState(true);
  // Op welke stap we willen uitkomen zodra het volgende blok binnenkomt.
  // Vooruit is dat altijd de eerste, achteruit de laatste van dat blok.
  const gewensteStapRef = useRef(0);
  const volledigSchermVerlatenOpRef = useRef(0);

  const sectie = secties[actiefIndex];
  const stappen = sectie?.presentatie.visueleStappen;
  const totaalStappen = stappen?.length ?? 1;
  const veiligeStapIndex = Math.min(Math.max(stapIndex, 0), totaalStappen - 1);
  const huidigeStap = stappen?.[veiligeStapIndex];

  const volgende = useCallback(() => {
    if (veiligeStapIndex + 1 < totaalStappen) {
      setStapIndex(veiligeStapIndex + 1);
      return;
    }
    if (actiefIndex + 1 >= secties.length) return;

    gewensteStapRef.current = 0;
    onGaNaarIndex(actiefIndex + 1);
  }, [actiefIndex, onGaNaarIndex, secties.length, totaalStappen, veiligeStapIndex]);

  const vorige = useCallback(() => {
    if (veiligeStapIndex > 0) {
      setStapIndex(veiligeStapIndex - 1);
      return;
    }
    const vorigeSectie = secties[actiefIndex - 1];
    if (!vorigeSectie) return;

    // Terug het vorige blok in kom je op zijn laatste scherm uit, niet op zijn
    // eerste — anders sla je bij terugbladeren stappen over.
    gewensteStapRef.current = aantalSchermen(vorigeSectie) - 1;
    onGaNaarIndex(actiefIndex - 1);
  }, [actiefIndex, onGaNaarIndex, secties, veiligeStapIndex]);

  const naarBlok = useCallback(
    (index: number) => {
      if (index < 0 || index >= secties.length) return;

      gewensteStapRef.current = 0;
      if (index === actiefIndex) {
        setStapIndex(0);
        return;
      }
      onGaNaarIndex(index);
    },
    [actiefIndex, onGaNaarIndex, secties.length],
  );

  const wisselVolledigScherm = useCallback(() => {
    const deck = deckRef.current;
    if (!deck) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }
    void deck.requestFullscreen?.().catch(() => undefined);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape werkt altijd: het typt geen teken en is de ontsnapping wanneer
      // de focus in een demo vastzit.
      if (event.key === "Escape") {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();

        // Eerste Escape verlaat alleen het volledige scherm; de presentatie
        // blijft staan. Pas een tweede Escape sluit haar af.
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => undefined);
          return;
        }
        if (Date.now() - volledigSchermVerlatenOpRef.current < ESCAPE_GENADE_MS) {
          return;
        }

        onVerlaat();
        return;
      }

      // Alles hieronder mag niet doorschieten naar de presentatie wanneer de
      // focus in een tekstveld, op een schuifregelaar of op een knop staat.
      if (!magPresentatieToetsAfhandelen(event)) return;

      if (VOLLEDIG_SCHERM_TOETSEN.has(event.key)) {
        event.preventDefault();
        wisselVolledigScherm();
        return;
      }

      if (VOLGENDE_TOETSEN.has(event.key)) {
        event.preventDefault();
        volgende();
        return;
      }

      if (VORIGE_TOETSEN.has(event.key)) {
        event.preventDefault();
        vorige();
        return;
      }

      const cijferIndex = indexVoorCijfertoets(event.key);
      if (cijferIndex >= 0 && cijferIndex < secties.length) {
        event.preventDefault();
        naarBlok(cijferIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    naarBlok,
    onVerlaat,
    secties.length,
    volgende,
    vorige,
    wisselVolledigScherm,
  ]);

  useEffect(() => {
    const opWissel = () => {
      if (!document.fullscreenElement) {
        volledigSchermVerlatenOpRef.current = Date.now();
      }
    };

    document.addEventListener("fullscreenchange", opWissel);
    return () => document.removeEventListener("fullscreenchange", opWissel);
  }, []);

  // Presentatiemodus verlaten laat het volledige scherm niet achter.
  useEffect(
    () => () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    },
    [],
  );

  // De sneltoetsen één keer tonen bij het betreden, daarna vervagend.
  useEffect(() => {
    const id = window.setTimeout(
      () => setToonSneltoetsen(false),
      SNELTOETSEN_MS,
    );

    return () => window.clearTimeout(id);
  }, []);

  // Bij een blokwissel de stap zetten waar we naartoe navigeerden en de focus
  // uit een eventueel invoerveld van het vorige blok halen.
  useEffect(() => {
    const gewenst = gewensteStapRef.current;
    gewensteStapRef.current = 0;
    setStapIndex(gewenst);
    deckRef.current?.focus({ preventScroll: true });
  }, [actiefIndex]);

  if (!sectie) return null;

  const heeftVisueel = Boolean(sectie.presentatie.visueelId);
  const genummerd = String(sectie.nummer).padStart(2, "0");
  const totaal = secties.length;

  return (
    <section
      ref={deckRef}
      className={styles.deck}
      tabIndex={-1}
      aria-roledescription="presentatie"
      aria-label={`Blok ${sectie.nummer} van ${totaal}: ${sectie.titel}`}
    >
      <div
        // key forceert een verse boom per blok: de demo's van blok 3, 5 en 6
        // starten schoon en houden geen state van een ander blok vast. Bewust
        // niet op de stap: binnen één blok blijft de demo staan.
        key={sectie.id}
        className={`${styles.slide} ${heeftVisueel ? "" : styles.slideZonderVisueel}`}
      >
        <div className={styles.claimRij}>
          <p className={styles.kopRegel}>
            <span className={styles.kopNummer}>{genummerd}</span>
            <span className={styles.kopTitel}>{sectie.titel}</span>
            {huidigeStap?.bijschrift ? (
              <span className={styles.stapBijschrift}>
                {huidigeStap.bijschrift}
              </span>
            ) : null}
          </p>
          <h2 className={styles.kernclaim}>{sectie.presentatie.kernclaim}</h2>
        </div>

        {/* Altijd gerenderd, ook leeg: de steunpunten zijn rij 2 van het
            rooster, en het visuele element moet in rij 3 blijven staan. Een
            lege lijst verdwijnt via `:empty`. */}
        <ul className={styles.steunpunten}>
          {sectie.presentatie.steunpunten.map((steunpunt) => (
            <li key={steunpunt} className={styles.steunpunt}>
              <span className={styles.steunpuntMarkering} aria-hidden="true">
                —
              </span>
              <span>{steunpunt}</span>
            </li>
          ))}
        </ul>

        {heeftVisueel ? (
          <div className={styles.visueel}>
            <LinguixVisueel
              section={sectie}
              stapId={huidigeStap?.id}
              toonKop={false}
              compact
            />
          </div>
        ) : null}
      </div>

      <footer className={styles.voet}>
        <span className={styles.voortgang}>
          {sectie.nummer} / {totaal}
          {totaalStappen > 1
            ? ` · ${veiligeStapIndex + 1} van ${totaalStappen}`
            : ""}
        </span>
        <div className={styles.voortgangBalk} aria-hidden="true">
          {secties.map((andereSectie, index) => (
            <span
              key={andereSectie.id}
              className={[
                styles.voortgangStap,
                index < actiefIndex ? styles.voortgangStapGezien : "",
                index === actiefIndex ? styles.voortgangStapActief : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </footer>

      {toonSneltoetsen ? (
        <aside className={styles.sneltoetsen} aria-hidden="true">
          <span>
            <kbd>P</kbd> document
          </span>
          <span>
            <kbd>F</kbd> volledig scherm
          </span>
          <span>
            <kbd>←</kbd>
            <kbd>→</kbd> bladeren
          </span>
          <span>
            <kbd>1</kbd>–<kbd>0</kbd> blok
          </span>
        </aside>
      ) : null}
    </section>
  );
}
