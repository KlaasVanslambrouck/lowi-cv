"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DIAGRAM_MATEN,
  diagramSleutel,
  effectieveSchaal,
  kleinsteTekstInPixels,
  LEESBAARHEIDSDREMPEL_PX,
} from "@/lib/linguixDiagramSchaal";
import type {
  LinguixSectionContent,
  LinguixTableBlock,
  LinguixVisualId,
} from "@/types/linguix";
import BusinessCaseModel from "./BusinessCaseModel";
import DrieKlokken from "./DrieKlokken";
import FaseringsTijdlijn from "./FaseringsTijdlijn";
import Herkadering from "./Herkadering";
import OplossingSchema, { type OplossingSpoor } from "./OplossingSchema";
import PassendVlak from "./PassendVlak";
import RisicoMatrix from "./RisicoMatrix";
import SchrijfScorer from "./SchrijfScorer";
import SpreekAgent from "./SpreekAgent";
import styles from "./LinguixVisueel.module.css";

interface LinguixVisueelProps {
  section: LinguixSectionContent;
  /** De actieve visuele stap; alleen gezet wanneer het blok subslides heeft. */
  stapId?: string;
  /** Documentmodus laat het diagram zijn eigen kop tonen, de slide niet. */
  toonKop?: boolean;
  /** Presentatiemodus: DOM-componenten compact en begrensd geschaald. */
  compact?: boolean;
}

function eersteTabel(
  section: LinguixSectionContent,
): LinguixTableBlock | undefined {
  return section.inhoud.find(
    (block): block is LinguixTableBlock => block.type === "table",
  );
}

function spoorVoorStap(stapId: string | undefined): OplossingSpoor {
  if (stapId === "spoorA") return "A";
  if (stapId === "spoorB") return "B";

  return "beide";
}

/**
 * Meet het vlak waarin een SVG-diagram terechtkomt en rekent daaruit de
 * effectieve schaalfactor en de gerenderde grootte van de kleinste tekst uit.
 *
 * De uitkomst staat als `data-`attribuut op het vlak, zodat je ze tijdens het
 * testen op elke schermmaat kunt aflezen zonder de slide te vervuilen; buiten
 * productie komt er ook een waarschuwing in de console.
 */
function DiagramVlak({
  sleutel,
  children,
}: {
  sleutel: string;
  children: ReactNode;
}) {
  const vlakRef = useRef<HTMLDivElement | null>(null);
  const [schaal, setSchaal] = useState(0);
  const maat = DIAGRAM_MATEN[sleutel];

  useEffect(() => {
    const vlak = vlakRef.current;
    if (!vlak || !maat) return;

    const meet = (): void => {
      setSchaal(effectieveSchaal(vlak.clientWidth, vlak.clientHeight, maat));
    };

    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(vlak);
    meet();

    return () => waarnemer.disconnect();
  }, [maat]);

  const kleinsteTekst = maat && schaal > 0 ? kleinsteTekstInPixels(schaal, maat) : 0;
  const leesbaar = kleinsteTekst === 0 || kleinsteTekst >= LEESBAARHEIDSDREMPEL_PX;

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (leesbaar || kleinsteTekst === 0) return;

    console.warn(
      `[linguix] ${sleutel}: kleinste tekst ${kleinsteTekst.toFixed(1)}px ` +
        `(schaal ${schaal.toFixed(3)}) — onder de drempel van ` +
        `${LEESBAARHEIDSDREMPEL_PX}px.`,
    );
  }, [kleinsteTekst, leesbaar, schaal, sleutel]);

  return (
    <div
      ref={vlakRef}
      className={styles.diagram}
      data-diagram={sleutel}
      data-schaal={schaal > 0 ? schaal.toFixed(3) : undefined}
      data-kleinste-tekst-px={
        kleinsteTekst > 0 ? kleinsteTekst.toFixed(1) : undefined
      }
      data-leesbaar={leesbaar ? "ja" : "nee"}
    >
      {children}
    </div>
  );
}

/**
 * Zet de `visueelId` van een blok om in het visuele element dat in
 * presentatiemodus het grootste deel van het scherm vult.
 *
 * De interactieve componenten zijn dezelfde componenten als in documentmodus
 * en behouden dus hun volledige functionaliteit; ze krijgen alleen een
 * compacte maatvoering en een begrensde schaalfactor. De tijdlijn en de
 * risicomatrix halen hun tekst uit de tabel in de documentinhoud van hetzelfde
 * blok — één contentbron.
 */
export default function LinguixVisueel({
  section,
  stapId,
  toonKop = true,
  compact = false,
}: LinguixVisueelProps) {
  const visueelId: LinguixVisualId | undefined = section.presentatie.visueelId;

  if (!visueelId) return null;

  switch (visueelId) {
    case "drie-klokken":
      return (
        <DiagramVlak sleutel={diagramSleutel(visueelId)}>
          <DrieKlokken toonKop={toonKop} />
        </DiagramVlak>
      );
    case "herkadering":
      return (
        <DiagramVlak sleutel={diagramSleutel(visueelId)}>
          <Herkadering toonKop={toonKop} />
        </DiagramVlak>
      );
    case "oplossing-schema":
      return (
        <DiagramVlak sleutel={diagramSleutel(visueelId, stapId)}>
          <OplossingSchema toonKop={toonKop} spoor={spoorVoorStap(stapId)} />
        </DiagramVlak>
      );
    case "businesscase-model":
      return (
        <PassendVlak>
          <BusinessCaseModel compact={compact} />
        </PassendVlak>
      );
    case "schrijf-scorer":
      return (
        <PassendVlak>
          <SchrijfScorer compact={compact} />
        </PassendVlak>
      );
    case "spreek-agent":
      return (
        <PassendVlak>
          <SpreekAgent compact={compact} />
        </PassendVlak>
      );
    case "faserings-tijdlijn": {
      const tabel = eersteTabel(section);
      if (!tabel) return null;
      return <FaseringsTijdlijn tabel={tabel} toonKop={toonKop} />;
    }
    case "risico-matrix": {
      const tabel = eersteTabel(section);
      if (!tabel) return null;
      return <RisicoMatrix tabel={tabel} toonKop={toonKop} />;
    }
    default:
      return null;
  }
}
