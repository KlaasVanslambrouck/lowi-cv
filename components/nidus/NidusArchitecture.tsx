"use client";

import { Fragment, type CSSProperties } from "react";
import type { Bilingual } from "@/types/content";
import type {
  NidusArchitectureComponent,
  NidusArchitectureLayer,
} from "@/types/nidusCaseStudy";
import Arrow from "@/components/sketch/Arrow";
import HighlightPhrase from "@/components/sketch/HighlightPhrase";
import MarginNote from "@/components/sketch/MarginNote";
import type { SketchDelay } from "@/components/sketch/sketchClasses";
import { NIDUS_HIGHLIGHTS, nidusRedesignCopy as copy } from "@/components/nidus/nidusRedesignCopy";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/nidus.module.css";

interface NidusArchitectureProps {
  components: NidusArchitectureComponent[];
  principles: Bilingual[];
}

// Rijen van het raster: van gebruiker (client) naar intelligentie (ai).
const LAYER_ORDER: NidusArchitectureLayer[] = [
  "client",
  "api",
  "data",
  "edge",
  "ai",
];

// Kolom (2–5) per component, uit Nidus.dc.html. Een onbekend component krijgt
// de eerste vrije kolom in zijn laag.
const GRID_COLUMN: Record<string, number> = {
  "nidus-web": 2,
  "nidus-mobile": 3,
  "nidus-api": 3,
  supabase: 3,
  "nidus-ml": 4,
  databricks: 5,
  "nidus-pi": 2,
  "claude-haiku": 4,
};

// Alleen verbindingen die de bestaande copy bevestigt (rollen van nidus-mobile
// en nidus-api, eerste principe): een pijl naar het component eronder.
const CONNECTIONS: Record<string, { note: Bilingual; delay: SketchDelay }> = {
  "nidus-mobile": { note: copy.onlyViaApi, delay: 2 },
  "nidus-api": { note: copy.onlyWriteAccess, delay: 3 },
};

// Het bevestigde pad krijgt een accentschaduw.
const KEY_PATH = new Set(["nidus-mobile", "nidus-api", "supabase"]);

function placeInLayer(layerComponents: NidusArchitectureComponent[]) {
  const taken = new Set<number>();
  return layerComponents.map((component) => {
    let column = GRID_COLUMN[component.id];
    if (column === undefined || taken.has(column)) {
      column = 2;
      while (taken.has(column)) column++;
    }
    taken.add(column);
    return { component, column };
  });
}

export default function NidusArchitecture({
  components,
  principles,
}: NidusArchitectureProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.architecture}>
      <div className={styles.archGrid}>
        {LAYER_ORDER.map((layer, index) => {
          const layerComponents = components.filter(
            (component) => component.layer === layer,
          );
          if (layerComponents.length === 0) return null;
          const row = index + 1;

          return (
            <Fragment key={layer}>
              {/* Laagnamen zijn taalonafhankelijke systeemtermen */}
              <span
                className={styles.archLane}
                style={{ "--arch-row": row } as CSSProperties}
              >
                {layer}
              </span>
              {placeInLayer(layerComponents).map(({ component, column }) => {
                const connection = CONNECTIONS[component.id];
                return (
                  <article
                    key={component.id}
                    className={
                      KEY_PATH.has(component.id)
                        ? `${styles.archNode} ${styles.archNodeKey}`
                        : styles.archNode
                    }
                    style={
                      { "--arch-row": row, "--arch-col": column } as CSSProperties
                    }
                  >
                    <h3 className={styles.archNodeName}>{component.name}</h3>
                    <p className={styles.archNodeTech}>
                      {component.tech} · {component.hosting}
                    </p>
                    <p className={styles.archNodeRole}>{t(component.role)}</p>
                    {connection ? (
                      <div className={styles.archConnection}>
                        <Arrow shape="down" delay={connection.delay} />
                        <MarginNote
                          className={styles.archConnectionNote}
                          rotate={0}
                          delay={(connection.delay + 1) as SketchDelay}
                        >
                          {t(connection.note)}
                        </MarginNote>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </Fragment>
          );
        })}
      </div>

      {principles.length > 0 ? (
        <ul className={styles.archPrinciples}>
          {principles.map((principle) => (
            <li key={principle.nl} className={styles.archPrinciple}>
              <HighlightPhrase
                text={t(principle)}
                phrase={t(NIDUS_HIGHLIGHTS.principle)}
                delay={4}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
