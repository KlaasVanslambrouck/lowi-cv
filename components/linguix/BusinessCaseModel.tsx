"use client";

import { useState } from "react";
import {
  calculateLinguixBusinessCase,
  LINGUIX_BUSINESS_CASE_DEFAULTS,
  type LinguixBusinessCaseParameters,
} from "@/lib/linguixBusinessCase";
import styles from "./BusinessCaseModel.module.css";

type AdjustableParameterKey = Exclude<
  keyof LinguixBusinessCaseParameters,
  "urenPerFte"
>;

type ParameterValueFormat =
  | "currency"
  | "decimal"
  | "fraction"
  | "integer";

interface SliderDefinition {
  readonly key: AdjustableParameterKey;
  readonly label: string;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
  readonly unit: string;
  readonly valueFormat: ParameterValueFormat;
}

interface TransitionValueProps {
  readonly current: string;
  readonly future: string;
  readonly unit: string;
}

const SLIDER_DEFINITIONS: readonly SliderDefinition[] = [
  {
    key: "volumeSchrijven",
    label: "Afnames schrijven per jaar",
    minimum: 2_000,
    maximum: 60_000,
    step: 1_000,
    unit: "stuks",
    valueFormat: "integer",
  },
  {
    key: "volumeSpreken",
    label: "Afnames spreken per jaar",
    minimum: 2_000,
    maximum: 60_000,
    step: 1_000,
    unit: "stuks",
    valueFormat: "integer",
  },
  {
    key: "minutenBeoordelingSchrijven",
    label: "Beoordelingstijd per schrijfopdracht",
    minimum: 4,
    maximum: 30,
    step: 1,
    unit: "min",
    valueFormat: "integer",
  },
  {
    key: "minutenAfnameSpreken",
    label: "Afnametijd per spreekexamen (1-op-1)",
    minimum: 10,
    maximum: 45,
    step: 1,
    unit: "min",
    valueFormat: "integer",
  },
  {
    key: "minutenBeoordelingSpreken",
    label: "Beoordelingstijd per spreekexamen",
    minimum: 2,
    maximum: 20,
    step: 1,
    unit: "min",
    valueFormat: "integer",
  },
  {
    key: "minutenOverhead",
    label: "Planning/administratie per afname",
    minimum: 0,
    maximum: 30,
    step: 1,
    unit: "min",
    valueFormat: "integer",
  },
  {
    key: "kostPerUur",
    label: "Beladen kost per examinator-uur",
    minimum: 35,
    maximum: 110,
    step: 1,
    unit: "euro",
    valueFormat: "currency",
  },
  {
    key: "aandeelAutonoomSchrijven",
    label: "Aandeel schrijven dat AI autonoom afhandelt (na fase 2)",
    minimum: 0,
    maximum: 0.85,
    step: 0.05,
    unit: "fractie",
    valueFormat: "fraction",
  },
  {
    key: "minutenReviewMetAi",
    label: "Verkorte reviewtijd bij AI-ondersteunde beoordeling",
    minimum: 1,
    maximum: 12,
    step: 1,
    unit: "min",
    valueFormat: "integer",
  },
  {
    key: "wachttijdWeken",
    label: "Huidige gemiddelde wachttijd tot testmoment",
    minimum: 1,
    maximum: 20,
    step: 0.5,
    unit: "weken",
    valueFormat: "decimal",
  },
];

function formatInteger(value: number): string {
  return value.toLocaleString("nl-BE", {
    maximumFractionDigits: 0,
  });
}

function formatDecimal(value: number): string {
  return value.toLocaleString("nl-BE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatParameterValue(
  value: number,
  definition: SliderDefinition,
): string {
  switch (definition.valueFormat) {
    case "currency":
      return `€ ${formatInteger(value)}`;
    case "decimal":
      return formatDecimal(value);
    case "fraction":
      return value.toLocaleString("nl-BE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "integer":
      return formatInteger(value);
  }
}

function TransitionValue({ current, future, unit }: TransitionValueProps) {
  return (
    <div className={styles.transitionValue}>
      <span className={styles.transitionSide}>
        <span className={styles.transitionCaption}>Nu</span>
        <span className={styles.resultNumber}>{current}</span>
      </span>
      <span className={styles.transitionArrow} aria-hidden="true">
        →
      </span>
      <span className={styles.transitionSide}>
        <span className={styles.transitionCaption}>Na</span>
        <span className={`${styles.resultNumber} ${styles.resultNumberAccent}`}>
          {future}
        </span>
      </span>
      <span className={styles.resultUnit}>{unit}</span>
    </div>
  );
}

export default function BusinessCaseModel() {
  const [parameters, setParameters] =
    useState<LinguixBusinessCaseParameters>(() => ({
      ...LINGUIX_BUSINESS_CASE_DEFAULTS,
    }));
  const results = calculateLinguixBusinessCase(parameters);

  const updateParameter = (
    key: AdjustableParameterKey,
    value: number,
  ): void => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      [key]: value,
    }));
  };

  const restoreDefaults = (): void => {
    setParameters({ ...LINGUIX_BUSINESS_CASE_DEFAULTS });
  };

  return (
    <section className={styles.model} aria-labelledby="businesscase-model-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Interactief · illustratieve startwaarden</p>
          <h3 id="businesscase-model-title" className={styles.title}>
            Businesscase-model
          </h3>
        </div>
        <button
          className={styles.resetButton}
          type="button"
          onClick={restoreDefaults}
        >
          Herstel standaardwaarden
        </button>
      </header>

      <div className={styles.resultGrid} aria-label="Resultaten van het model">
        <article className={`${styles.resultCard} ${styles.resultCardPrimary}`}>
          <p className={styles.resultLabel}>Wachttijd tot certificaat</p>
          <TransitionValue
            current={formatDecimal(parameters.wachttijdWeken)}
            future={formatDecimal(results.wachttijdNa)}
            unit="weken"
          />
        </article>

        <article
          className={`${styles.resultCard} ${styles.resultCardUnknown}`}
        >
          <p className={styles.resultLabel}>Consistentie tussen beoordelaars</p>
          <p className={styles.unknownValue}>
            Te meten in fase 0 — zonder baseline is &apos;beter dan een
            mens&apos; betekenisloos.
          </p>
          <p className={styles.unknownCaption}>Bewuste nulmeting · geen schatting</p>
        </article>

        <article className={styles.resultCard}>
          <p className={styles.resultLabel}>Vrijgemaakte capaciteit</p>
          <div className={styles.singleValue}>
            <span className={`${styles.resultNumber} ${styles.resultNumberAccent}`}>
              {formatDecimal(results.fteEquivalent)}
            </span>
            <span className={styles.resultUnit}>FTE</span>
          </div>
        </article>

        <article className={styles.resultCard}>
          <p className={styles.resultLabel}>Kost per afname</p>
          <TransitionValue
            current={`€ ${formatInteger(results.kostPerAfnameNu)}`}
            future={`€ ${formatInteger(results.kostPerAfnameNa)}`}
            unit="per afname"
          />
        </article>
      </div>

      <p className={styles.disclaimer}>
        Illustratieve waarden. Geen enkel cijfer op deze pagina is afkomstig
        van de klant.
      </p>

      <p className={styles.modelNote}>
        Wachttijd is een vereenvoudiging. Ze hangt ook van planning en
        zaalcapaciteit af; het model toont de capaciteitscomponent.
      </p>

      <div className={styles.parametersHeader}>
        <h4 className={styles.parametersTitle}>Modelparameters</h4>
        <span className={styles.parametersMeta}>10 instelbaar · 1 vast</span>
      </div>

      <div className={styles.parameterGrid}>
        {SLIDER_DEFINITIONS.map((definition) => {
          const value = parameters[definition.key];
          const inputId = `businesscase-${definition.key}`;
          const formattedValue = formatParameterValue(value, definition);

          return (
            <div className={styles.parameter} key={definition.key}>
              <div className={styles.parameterHeader}>
                <label className={styles.parameterLabel} htmlFor={inputId}>
                  {definition.label}
                </label>
                <output className={styles.parameterValue} htmlFor={inputId}>
                  {formattedValue} {definition.unit}
                </output>
              </div>
              <input
                className={styles.slider}
                id={inputId}
                name={definition.key}
                type="range"
                min={definition.minimum}
                max={definition.maximum}
                step={definition.step}
                value={value}
                aria-valuetext={`${formattedValue} ${definition.unit}`}
                onChange={(event) =>
                  updateParameter(
                    definition.key,
                    Number(event.currentTarget.value),
                  )
                }
              />
              <div className={styles.rangeLabels} aria-hidden="true">
                <span>
                  {formatParameterValue(definition.minimum, definition)}
                </span>
                <span>
                  {formatParameterValue(definition.maximum, definition)}
                </span>
              </div>
            </div>
          );
        })}

        <div className={`${styles.parameter} ${styles.fixedParameter}`}>
          <div>
            <p className={styles.parameterLabel}>
              Netto productieve uren per FTE per jaar
            </p>
            <p className={styles.fixedKey}>urenPerFte · vaste modelwaarde</p>
          </div>
          <span className={styles.fixedValue}>
            {formatInteger(parameters.urenPerFte)} uren
          </span>
        </div>
      </div>
    </section>
  );
}
