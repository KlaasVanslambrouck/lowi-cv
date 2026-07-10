"use client";

import type { Bilingual } from "@/types/content";
import type {
  NidusArchitectureComponent,
  NidusArchitectureLayer,
} from "@/types/nidusCaseStudy";
import { useLanguage } from "@/hooks/useLanguage";
import styles from "@/styles/nidus.module.css";

interface NidusArchitectureProps {
  components: NidusArchitectureComponent[];
  principles: Bilingual[];
}

// Render-volgorde van de lagen: van gebruiker (client) naar intelligentie (ai).
const LAYER_ORDER: NidusArchitectureLayer[] = [
  "client",
  "api",
  "data",
  "edge",
  "ai",
];

export default function NidusArchitecture({
  components,
  principles,
}: NidusArchitectureProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.architecture}>
      {LAYER_ORDER.map((layer) => {
        const layerComponents = components.filter(
          (component) => component.layer === layer,
        );
        if (layerComponents.length === 0) {
          return null;
        }

        return (
          <div key={layer} className={styles.archLayer}>
            {/* Laagnamen zijn taalonafhankelijke systeemtermen, net als
                XrayLayer op de homepage */}
            <span className={styles.archLayerLabel}>{layer}</span>
            <div className={styles.archLayerCards}>
              {layerComponents.map((component) => (
                <article key={component.id} className={styles.archCard}>
                  <h3 className={styles.archCardName}>{component.name}</h3>
                  <p className={styles.archCardMeta}>
                    {component.tech} · {component.hosting}
                  </p>
                  <p className={styles.archCardRole}>{t(component.role)}</p>
                </article>
              ))}
            </div>
          </div>
        );
      })}

      {principles.length > 0 ? (
        <ul className={styles.archPrinciples}>
          {principles.map((principle) => (
            <li key={principle.nl} className={styles.archPrinciple}>
              {t(principle)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
