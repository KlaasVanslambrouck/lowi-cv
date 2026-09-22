"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { localizedPath } from "@/lib/site";
import type { Bilingual } from "@/types/content";
import styles from "@/styles/cv.module.css";

const ERROR_COPY = {
  title: { nl: "Er ging iets mis.", en: "Something went wrong." },
  body: {
    nl: "De publieke CV-pagina kon niet volledig laden. Probeer opnieuw of keer terug naar de start.",
    en: "The public CV page could not load completely. Try again or go back to the start.",
  },
  retry: { nl: "Opnieuw proberen", en: "Try again" },
  home: { nl: "Naar start", en: "Back to start" },
} satisfies Record<"title" | "body" | "retry" | "home", Bilingual>;

// Foutscherm voor de publieke pagina's; gebruikt door app/(nl)/error.tsx en
// app/(en)/en/error.tsx. Rendert binnen de root layout, dus de taal komt uit
// de route zoals overal.
export default function RouteError({ reset }: { reset: () => void }) {
  const { language, t } = useLanguage();

  return (
    <main className={styles.errorPage}>
      <section className={styles.errorPanel} aria-labelledby="public-error-title">
        <p className={styles.errorEyebrow}>lowi / cv</p>
        <h1 id="public-error-title" className={styles.errorTitle}>
          {t(ERROR_COPY.title)}
        </h1>
        <p className={styles.errorCopy}>{t(ERROR_COPY.body)}</p>
        <div className={styles.errorActions}>
          <button type="button" className={styles.errorButton} onClick={reset}>
            {t(ERROR_COPY.retry)}
          </button>
          <Link className={styles.errorLink} href={localizedPath("/", language)}>
            {t(ERROR_COPY.home)}
          </Link>
        </div>
      </section>
    </main>
  );
}
