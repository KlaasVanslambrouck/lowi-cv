"use client";

import { useId, useState } from "react";
import type { LinguixTableBlock, LinguixTableRow } from "@/types/linguix";
import styles from "./FaseringsTijdlijn.module.css";

interface FaseringsTijdlijnProps {
  /** De faseringstabel van blok 7 — de enige bron voor fasen en gates. */
  tabel: LinguixTableBlock;
  /**
   * Documentmodus toont de eigen kop en omkadering. In presentatiemodus draagt
   * de slide die kop al; het beeld laat ze weg en vult de beschikbare hoogte.
   */
  toonKop?: boolean;
}

type Spoor = "schrijven" | "spreken";

interface FaseOpstelling {
  rijId: string;
  spoor: Spoor;
  /** Positie binnen het spoor: 1, 2 of 3. Spoor B start op positie 2. */
  positie: 1 | 2 | 3;
  /** De gate na fase 0 draagt de beslissing die verkocht wordt. */
  nadruk?: boolean;
}

interface Fase extends FaseOpstelling {
  nummer: string;
  titel: string;
  duur: string;
  voorwaarde: string;
}

/**
 * De plaatsing van de vijf fasen op twee sporen. Fase 3 loopt parallel vanaf
 * fase 1 en staat daarom op positie 2 van het tweede spoor, recht onder
 * fase 1. Alle tekst komt uit de tabel; hier staat alleen de opstelling.
 */
const FASE_OPSTELLING: readonly FaseOpstelling[] = [
  { rijId: "fase-0", spoor: "schrijven", positie: 1, nadruk: true },
  { rijId: "fase-1", spoor: "schrijven", positie: 2 },
  { rijId: "fase-2", spoor: "schrijven", positie: 3 },
  { rijId: "fase-3", spoor: "spreken", positie: 2 },
  { rijId: "fase-4", spoor: "spreken", positie: 3 },
];

function celWaarde(
  tabel: LinguixTableBlock,
  rij: LinguixTableRow,
  kolomSleutel: string,
): string {
  const index = tabel.columns.findIndex((kolom) => kolom.key === kolomSleutel);
  if (index < 0) return "";

  return rij.cells[index] ?? "";
}

function leesFasen(tabel: LinguixTableBlock): readonly Fase[] {
  return FASE_OPSTELLING.flatMap((opstelling) => {
    const rij = tabel.rows.find((tabelRij) => tabelRij.id === opstelling.rijId);
    if (!rij) return [];

    return [
      {
        ...opstelling,
        nummer: celWaarde(tabel, rij, "fase"),
        titel: celWaarde(tabel, rij, "wat"),
        duur: celWaarde(tabel, rij, "duur"),
        voorwaarde: celWaarde(tabel, rij, "gate"),
      },
    ];
  });
}

function GateRuit({ nadruk }: { nadruk: boolean }) {
  return (
    <svg className={styles.ruit} viewBox="0 0 44 44" aria-hidden="true">
      {nadruk ? (
        <polygon className={styles.ruitRing} points="22,0 44,22 22,44 0,22" />
      ) : null}
      <polygon className={styles.ruitVlak} points="22,6 38,22 22,38 6,22" />
    </svg>
  );
}

export default function FaseringsTijdlijn({
  tabel,
  toonKop = true,
}: FaseringsTijdlijnProps) {
  const fasen = leesFasen(tabel);
  const paneelId = `${useId()}-gatepaneel`;
  // De gate na fase 0 staat standaard open: dat is de beslissing waar het
  // gesprek over gaat, en het paneel is zo nooit leeg.
  const [vastgezetteFase, setVastgezetteFase] = useState<string>(
    fasen[0]?.rijId ?? "",
  );
  const [aangewezenFase, setAangewezenFase] = useState<string | null>(null);

  const actieveFaseId = aangewezenFase ?? vastgezetteFase;
  const actieveFase = fasen.find((fase) => fase.rijId === actieveFaseId);

  if (fasen.length === 0) return null;

  const renderFase = (fase: Fase) => {
    const isActief = fase.rijId === actieveFaseId;

    return [
      <article
        key={`fase-${fase.rijId}`}
        className={`${styles.faseKaart} ${fase.spoor === "spreken" ? styles.faseKaartSpreken : ""} ${
          fase.spoor === "schrijven" ? styles.rijSchrijven : styles.rijSpreken
        }`}
        data-kolom={fase.positie * 2 - 1}
      >
        <span className={styles.faseNummer}>Fase {fase.nummer}</span>
        <h4 className={styles.faseTitel}>{fase.titel}</h4>
        <p className={styles.faseDuur}>{fase.duur}</p>
      </article>,
      <button
        key={`gate-${fase.rijId}`}
        type="button"
        className={[
          styles.gate,
          fase.nadruk ? styles.gateNadruk : "",
          isActief ? styles.gateActief : "",
          fase.spoor === "schrijven" ? styles.rijSchrijven : styles.rijSpreken,
        ]
          .filter(Boolean)
          .join(" ")}
        data-kolom={fase.positie * 2}
        aria-pressed={fase.rijId === vastgezetteFase}
        aria-controls={paneelId}
        aria-label={`Go/no-go-gate na fase ${fase.nummer}: ${fase.titel}`}
        onMouseEnter={() => setAangewezenFase(fase.rijId)}
        onMouseLeave={() => setAangewezenFase(null)}
        onFocus={() => setAangewezenFase(fase.rijId)}
        onBlur={() => setAangewezenFase(null)}
        onClick={() => setVastgezetteFase(fase.rijId)}
      >
        <GateRuit nadruk={Boolean(fase.nadruk)} />
        <span className={styles.gateLabel}>Gate</span>
        <span className={styles.gateOvergang}>na {fase.nummer}</span>
      </button>,
    ];
  };

  const spoorSchrijven = fasen.filter((fase) => fase.spoor === "schrijven");
  const spoorSpreken = fasen.filter((fase) => fase.spoor === "spreken");

  return (
    <figure
      className={`${styles.tijdlijn} ${toonKop ? "" : styles.tijdlijnVullend}`}
    >
      {toonKop ? (
        <figcaption>
          <p className={styles.eyebrow}>
            Fasering · elke fase eindigt op een gate
          </p>
          <h3 className={styles.titel}>{tabel.caption ?? "Fasering en gates"}</h3>
        </figcaption>
      ) : null}

      <div className={styles.raster}>
        <p className={`${styles.spoorLabel} ${styles.spoorLabelSchrijven}`}>
          Spoor A · schrijven
        </p>
        {spoorSchrijven.map(renderFase)}

        <p className={`${styles.spoorLabel} ${styles.spoorLabelSpreken}`}>
          Spoor B · spreken
        </p>
        <p className={styles.parallel}>
          <span className={styles.parallelTekst}>parallel vanaf fase 1</span>
        </p>
        {spoorSpreken.map(renderFase)}
      </div>

      <div className={styles.paneel} id={paneelId} aria-live="polite">
        {actieveFase ? (
          <>
            <p className={styles.paneelKop}>
              Go/no-go-gate na fase {actieveFase.nummer}
            </p>
            <p className={styles.paneelFase}>
              {actieveFase.titel} · {actieveFase.duur}
            </p>
            <p className={styles.paneelVoorwaarde}>{actieveFase.voorwaarde}</p>
          </>
        ) : (
          <p className={styles.paneelVoorwaarde}>
            Wijs een gate aan om de go/no-go-voorwaarde te zien.
          </p>
        )}
        <p className={styles.paneelHint}>
          Wijs een ruit aan met de muis, of klik om de voorwaarde vast te
          zetten.
        </p>
      </div>
    </figure>
  );
}
