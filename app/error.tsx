"use client";

import Link from "next/link";
import styles from "@/styles/cv.module.css";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className={styles.errorPage}>
      <section className={styles.errorPanel} aria-labelledby="public-error-title">
        <p className={styles.errorEyebrow}>lowi / cv</p>
        <h1 id="public-error-title" className={styles.errorTitle}>
          Er ging iets mis.
        </h1>
        <p className={styles.errorCopy}>
          De publieke CV-pagina kon niet volledig laden. Probeer opnieuw of keer
          terug naar de start.
        </p>
        <div className={styles.errorActions}>
          <button type="button" className={styles.errorButton} onClick={reset}>
            Opnieuw proberen
          </button>
          <Link className={styles.errorLink} href="/">
            Naar start
          </Link>
        </div>
      </section>
    </main>
  );
}
