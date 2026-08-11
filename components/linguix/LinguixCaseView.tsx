"use client";

import { useCallback, useEffect, useState } from "react";
import LinguixLayout from "@/components/linguix/LinguixLayout";
import PresentatieWeergave from "@/components/linguix/PresentatieWeergave";
import { magPresentatieToetsAfhandelen } from "@/lib/linguixPresentatieToetsen";
import type {
  LinguixBlockId,
  LinguixCaseContent,
  LinguixWeergaveModus,
} from "@/types/linguix";
import styles from "./LinguixCaseView.module.css";

interface LinguixCaseViewProps {
  content: LinguixCaseContent;
}

const MODUS_PARAMETER = "modus";

function leesModusUitUrl(): LinguixWeergaveModus {
  const parameter = new URLSearchParams(window.location.search).get(
    MODUS_PARAMETER,
  );
  return parameter === "presentatie" ? "presentatie" : "document";
}

function schrijfModusNaarUrl(modus: LinguixWeergaveModus) {
  const url = new URL(window.location.href);

  if (modus === "presentatie") {
    url.searchParams.set(MODUS_PARAMETER, "presentatie");
  } else {
    url.searchParams.delete(MODUS_PARAMETER);
  }

  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Eén contentbron, twee renderings. Deze component houdt bij welke modus
 * actief is en bij welk blok de spreker staat, zodat heen-en-weer schakelen
 * op hetzelfde blok uitkomt.
 *
 * Documentmodus is de standaard; `?modus=presentatie` en de toets P openen
 * de presentatie.
 */
export default function LinguixCaseView({ content }: LinguixCaseViewProps) {
  const [modus, setModus] = useState<LinguixWeergaveModus>("document");
  const [actiefIndex, setActiefIndex] = useState(0);
  // Bij terugkeer naar documentmodus scrollen we hierheen. Blijft null zolang
  // er niet vanuit de presentatie is teruggeschakeld, zodat een eerste bezoek
  // gewoon bovenaan begint.
  const [terugkeerBlok, setTerugkeerBlok] = useState<LinguixBlockId | null>(
    null,
  );

  const secties = content.secties;

  // De modus kan pas na mount uit de URL gelezen worden (SSR kent de query
  // niet), net zoals de themavoorkeur.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bewust: de query is pas na mount beschikbaar
    setModus(leesModusUitUrl());
  }, []);

  const openPresentatie = useCallback(() => {
    setModus("presentatie");
    setTerugkeerBlok(null);
    schrijfModusNaarUrl("presentatie");
  }, []);

  const sluitPresentatie = useCallback(() => {
    setModus("document");
    setTerugkeerBlok(secties[actiefIndex]?.id ?? null);
    schrijfModusNaarUrl("document");
  }, [actiefIndex, secties]);

  const wisselModus = useCallback(() => {
    if (modus === "presentatie") {
      sluitPresentatie();
      return;
    }
    openPresentatie();
  }, [modus, openPresentatie, sluitPresentatie]);

  // P schakelt heen en weer — maar niet terwijl er getypt wordt.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "p" && event.key !== "P") return;
      if (!magPresentatieToetsAfhandelen(event)) return;

      event.preventDefault();
      wisselModus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wisselModus]);

  // Documentscroll blokkeren zolang de presentatie het scherm vult.
  useEffect(() => {
    if (modus !== "presentatie") return;

    const vorigeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = vorigeOverflow;
    };
  }, [modus]);

  // Onthoudt waar de spreker in het document staat, zodat P vanuit een
  // gescrollde positie op hetzelfde blok opent.
  const handleActiefBlokInDocument = useCallback(
    (sectionId: LinguixBlockId) => {
      const index = secties.findIndex((sectie) => sectie.id === sectionId);
      if (index >= 0) setActiefIndex(index);
    },
    [secties],
  );

  const inPresentatie = modus === "presentatie";

  return (
    <>
      <button
        type="button"
        className={`${styles.modusKnop} ${inPresentatie ? styles.modusKnopPresentatie : ""}`}
        onClick={wisselModus}
        aria-pressed={inPresentatie}
        title={
          inPresentatie
            ? "Terug naar documentmodus (P of Escape)"
            : "Naar presentatiemodus (P)"
        }
      >
        <span>{inPresentatie ? "Document" : "Presentatie"}</span>
        <kbd className={styles.modusToets}>P</kbd>
      </button>

      {inPresentatie ? (
        <PresentatieWeergave
          secties={secties}
          actiefIndex={actiefIndex}
          onGaNaarIndex={setActiefIndex}
          onVerlaat={sluitPresentatie}
        />
      ) : (
        <LinguixLayout
          content={content}
          startSectionId={terugkeerBlok}
          onActiveSectionChange={handleActiefBlokInDocument}
        />
      )}
    </>
  );
}
