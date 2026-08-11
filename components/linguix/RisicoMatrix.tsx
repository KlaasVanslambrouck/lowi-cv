"use client";

import { useId, useState } from "react";
import type { LinguixTableBlock, LinguixTableRow } from "@/types/linguix";
import styles from "./RisicoMatrix.module.css";

interface RisicoMatrixProps {
  /** Het risicoregister van blok 8 — de enige bron voor tekst en mitigatie. */
  tabel: LinguixTableBlock;
  /**
   * Documentmodus toont de eigen kop en omkadering. In presentatiemodus draagt
   * de slide die kop al; het beeld laat ze weg en vult de beschikbare hoogte.
   */
  toonKop?: boolean;
}

interface RisicoPositie {
  rijId: string;
  /** Kort label bij het punt; de volledige tekst staat in het register. */
  label: string;
  waarschijnlijkheid: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  /** Risico 7 wordt in blok 8 apart uitgelicht. */
  uitgelicht?: boolean;
}

interface Risico extends RisicoPositie {
  nummer: string;
  beschrijving: string;
  mitigatie: string;
}

const SCHAAL = [1, 2, 3, 4, 5] as const;

/**
 * De plaatsing van de negen risico's op de assen waarschijnlijkheid en
 * impact. Alleen coördinaten en korte labels staan hier; beschrijving en
 * mitigatie komen uit het risicoregister van blok 8.
 */
const RISICO_POSITIES: readonly RisicoPositie[] = [
  { rijId: "risico-1", label: "Labelplafond", waarschijnlijkheid: 4, impact: 5 },
  { rijId: "risico-2", label: "Bias over subgroepen", waarschijnlijkheid: 4, impact: 5 },
  { rijId: "risico-3", label: "Digitale vaardigheid", waarschijnlijkheid: 5, impact: 4 },
  { rijId: "risico-4", label: "Adversarial gedrag", waarschijnlijkheid: 3, impact: 3 },
  { rijId: "risico-5", label: "Juridisch beroep", waarschijnlijkheid: 3, impact: 5 },
  { rijId: "risico-6", label: "Politieke weerstand", waarschijnlijkheid: 5, impact: 4 },
  {
    rijId: "risico-7",
    label: "Verkeerde AI Act-rol",
    waarschijnlijkheid: 4,
    impact: 5,
    uitgelicht: true,
  },
  { rijId: "risico-8", label: "Soevereiniteit / lock-in", waarschijnlijkheid: 2, impact: 3 },
  { rijId: "risico-9", label: "Scope-realisme", waarschijnlijkheid: 4, impact: 3 },
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

function leesRisicos(tabel: LinguixTableBlock): readonly Risico[] {
  return RISICO_POSITIES.flatMap((positie) => {
    const rij = tabel.rows.find((tabelRij) => tabelRij.id === positie.rijId);
    if (!rij) return [];

    return [
      {
        ...positie,
        nummer: celWaarde(tabel, rij, "nummer"),
        beschrijving: celWaarde(tabel, rij, "risico"),
        mitigatie: celWaarde(tabel, rij, "mitigatie"),
      },
    ];
  });
}

/** Puntgrootte volgt uit waarschijnlijkheid maal impact — geen kleurzones. */
function stipKlasse(risico: Risico): string {
  const zwaarte = risico.waarschijnlijkheid * risico.impact;
  if (zwaarte >= 20) return styles.stipGroot;
  if (zwaarte >= 12) return styles.stipMidden;

  return styles.stipKlein;
}

export default function RisicoMatrix({
  tabel,
  toonKop = true,
}: RisicoMatrixProps) {
  const risicos = leesRisicos(tabel);
  const paneelId = `${useId()}-risicopaneel`;
  const [vastgezetId, setVastgezetId] = useState<string | null>(null);
  const [aangewezenId, setAangewezenId] = useState<string | null>(null);

  const actiefId = aangewezenId ?? vastgezetId;
  const actiefRisico = risicos.find((risico) => risico.rijId === actiefId);

  if (risicos.length === 0) return null;

  const interactie = (risico: Risico) => ({
    onMouseEnter: () => setAangewezenId(risico.rijId),
    onMouseLeave: () => setAangewezenId(null),
    onFocus: () => setAangewezenId(risico.rijId),
    onBlur: () => setAangewezenId(null),
    onClick: () =>
      setVastgezetId((huidig) =>
        huidig === risico.rijId ? null : risico.rijId,
      ),
  });

  const knopLabel = (risico: Risico) =>
    `Risico ${risico.nummer}: ${risico.label}. Waarschijnlijkheid ${risico.waarschijnlijkheid} van 5, impact ${risico.impact} van 5.`;

  return (
    <figure className={`${styles.matrix} ${toonKop ? "" : styles.matrixVullend}`}>
      {toonKop ? (
        <figcaption>
          <p className={styles.eyebrow}>
            Risicoregister · waarschijnlijkheid tegen impact
          </p>
          <h3 className={styles.titel}>Negen risico&apos;s, gewogen</h3>
        </figcaption>
      ) : null}

      <div className={styles.lichaam}>
        <div
          className={styles.raster}
          role="group"
          aria-label="Risicomatrix: waarschijnlijkheid horizontaal, impact verticaal"
        >
          <span className={`${styles.asTitel} ${styles.asTitelImpact}`}>
            Impact · 1 laag → 5 hoog
          </span>

          {[...SCHAAL].reverse().map((impact) => (
            <span
              key={`impact-${impact}`}
              className={`${styles.asTick} ${styles.asTickImpact}`}
              style={{ gridRow: 6 - impact }}
              aria-hidden="true"
            >
              {impact}
            </span>
          ))}

          {[...SCHAAL].reverse().map((impact) =>
            SCHAAL.map((waarschijnlijkheid) => {
              const inCel = risicos.filter(
                (risico) =>
                  risico.impact === impact &&
                  risico.waarschijnlijkheid === waarschijnlijkheid,
              );

              return (
                <div
                  key={`cel-${waarschijnlijkheid}-${impact}`}
                  className={styles.cel}
                  style={{ gridColumn: waarschijnlijkheid + 2, gridRow: 6 - impact }}
                  data-waarschijnlijkheid={waarschijnlijkheid}
                  data-impact={impact}
                >
                  {inCel.map((risico) => (
                    <button
                      key={risico.rijId}
                      type="button"
                      className={[
                        styles.punt,
                        risico.uitgelicht ? styles.puntUitgelicht : "",
                        risico.rijId === actiefId ? styles.puntActief : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-pressed={risico.rijId === vastgezetId}
                      aria-controls={paneelId}
                      aria-label={knopLabel(risico)}
                      {...interactie(risico)}
                    >
                      <span className={`${styles.stip} ${stipKlasse(risico)}`}>
                        {risico.nummer}
                      </span>
                      <span className={styles.puntLabel}>{risico.label}</span>
                    </button>
                  ))}
                </div>
              );
            }),
          )}

          {SCHAAL.map((waarschijnlijkheid) => (
            <span
              key={`waarschijnlijkheid-${waarschijnlijkheid}`}
              className={`${styles.asTick} ${styles.asTickWaarschijnlijkheid}`}
              style={{ gridColumn: waarschijnlijkheid + 2 }}
              aria-hidden="true"
            >
              {waarschijnlijkheid}
            </span>
          ))}
          <span
            className={`${styles.asTitel} ${styles.asTitelWaarschijnlijkheid}`}
          >
            Waarschijnlijkheid · 1 laag → 5 hoog
          </span>
        </div>

        {/* Onder 700px vervangt deze lijst het raster — zelfde knoppen, zelfde
            paneel, maar leesbaar op één kolom. */}
        <ul className={styles.lijst}>
          {risicos.map((risico) => (
            <li key={risico.rijId}>
              <button
                type="button"
                className={[
                  styles.lijstKnop,
                  risico.uitgelicht ? styles.lijstKnopUitgelicht : "",
                  risico.rijId === actiefId ? styles.lijstKnopActief : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={risico.rijId === vastgezetId}
                aria-controls={paneelId}
                aria-label={knopLabel(risico)}
                {...interactie(risico)}
              >
                <span className={`${styles.stip} ${stipKlasse(risico)}`}>
                  {risico.nummer}
                </span>
                <span>
                  <span className={styles.lijstNaam}>{risico.label}</span>
                  <span className={styles.lijstCoordinaten}>
                    {" "}
                    · waarschijnlijkheid {risico.waarschijnlijkheid} · impact{" "}
                    {risico.impact}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.paneel} id={paneelId} aria-live="polite">
          {actiefRisico ? (
            <>
              <p className={styles.paneelKop}>
                Risico {actiefRisico.nummer}
                {actiefRisico.uitgelicht ? " · apart uitgelicht" : ""}
              </p>
              <p className={styles.paneelNaam}>{actiefRisico.label}</p>
              <p className={styles.paneelCoordinaten}>
                waarschijnlijkheid {actiefRisico.waarschijnlijkheid} / 5 · impact{" "}
                {actiefRisico.impact} / 5
              </p>
              <p className={styles.paneelVeldLabel}>Wat er misgaat</p>
              <p className={styles.paneelTekst}>{actiefRisico.beschrijving}</p>
              <p className={styles.paneelVeldLabel}>Mitigatie</p>
              <p className={styles.paneelTekst}>{actiefRisico.mitigatie}</p>
            </>
          ) : (
            <>
              <p className={styles.paneelKop}>Geen punt gekozen</p>
              <p className={styles.paneelHint}>
                Wijs een punt aan met de muis, of klik om het vast te zetten.
                Hier verschijnen dan de omschrijving en de mitigatie uit het
                register.
              </p>
              <p className={styles.paneelHint}>
                De grootte van een punt volgt uit waarschijnlijkheid maal
                impact.
              </p>
            </>
          )}
        </div>
      </div>
    </figure>
  );
}
