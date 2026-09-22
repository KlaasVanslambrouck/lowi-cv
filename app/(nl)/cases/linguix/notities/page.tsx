import type { Metadata } from "next";
import { linguixContent } from "@/content/linguixContent";
import styles from "./notities.module.css";

export const metadata: Metadata = {
  title: `${linguixContent.titel} — spreeknotities`,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Afdrukbare spreeknotities. Deze route wordt nooit tijdens de presentatie
 * geopend — hij bestaat om op papier naast de laptop te liggen. Geen
 * navigatie, geen modusschakelaar, één blok per afgedrukte pagina.
 */
export default function LinguixNotitiesPagina() {
  return (
    <div className={styles.pagina}>
      <div className={styles.binnen}>
        <header className={styles.kop}>
          <h1 className={styles.titel}>
            {linguixContent.titel} — spreeknotities
          </h1>
          <p className={styles.ondertitel}>
            {linguixContent.secties.length} blokken ·{" "}
            {linguixContent.secties.reduce(
              (totaal, sectie) => totaal + sectie.spreektijdMinuten,
              0,
            )}{" "}
            min · niet voor projectie
          </p>
        </header>

        <div className={styles.blokken}>
          {linguixContent.secties.map((sectie) => (
            <article key={sectie.id} className={styles.blok}>
              <div className={styles.blokKop}>
                <span className={styles.blokNummer}>
                  {String(sectie.nummer).padStart(2, "0")}
                </span>
                <h2 className={styles.blokTitel}>{sectie.titel}</h2>
                <span className={styles.blokEyebrow}>
                  {sectie.eyebrow} · {sectie.spreektijdMinuten} min
                </span>
              </div>

              <p className={styles.kernclaim}>{sectie.presentatie.kernclaim}</p>

              <span className={styles.notitieLabel}>Spreeknotities</span>
              {sectie.spreekNotities.length > 0 ? (
                <ul className={styles.notities}>
                  {sectie.spreekNotities.map((notitie) => (
                    <li key={notitie} className={styles.notitie}>
                      {notitie}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.geenNotities}>
                  Nog geen notities voor dit blok.
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
