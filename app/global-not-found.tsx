import type { Metadata } from "next";
import Link from "next/link";
import { FONT_CLASS_NAMES } from "@/components/RootDocument";
import styles from "@/styles/cv.module.css";
import "./globals.css";

// 404 voor URL's die op geen enkele route passen. Nodig omdat er twee root
// layouts zijn (app/(nl) en app/(en)/en) en dus geen gedeelde layout om een
// not-found in te renderen. Rendert buiten de layouts: fonts en globale CSS
// worden hier zelf geladen. Vereist experimental.globalNotFound in next.config.ts.
// Agents die text/markdown vragen, krijgen in de plaats app/markdown/missing
// (fallback-rewrite in next.config.ts).
export const metadata: Metadata = {
  // Geen robots-veld: Next zet zelf noindex op een 404.
  title: "Pagina niet gevonden | Klaas Vanslambrouck",
};

export default function GlobalNotFound() {
  return (
    <html lang="nl" className={FONT_CLASS_NAMES}>
      <body>
        <main className={styles.errorPage}>
          <section className={styles.errorPanel} aria-labelledby="not-found-title">
            <p className={styles.errorEyebrow}>lowi / cv · 404</p>
            <h1 id="not-found-title" className={styles.errorTitle}>
              Deze pagina bestaat niet.
            </h1>
            <p className={styles.errorCopy}>
              Misschien is de pagina verplaatst, of zit er een tikfout in de
              link. Dit is de website van Klaas Vanslambrouck: cv, loopbaan en
              projecten.
            </p>
            <p className={styles.errorCopy} lang="en">
              This page does not exist. It may have moved, or the link may
              contain a typo.
            </p>
            <div className={styles.errorActions}>
              <Link className={styles.errorLink} href="/">
                Naar start
              </Link>
              <Link className={styles.errorLink} href="/en" lang="en">
                English version
              </Link>
            </div>
            {/* Voor crawlers en agents: waar de volledige lijst staat. Gewone
                <a>'s: het zijn bestanden, geen pagina's van de app. */}
            <p className={styles.errorMeta} lang="en">
              All pages: <a href="/sitemap.xml">sitemap.xml</a> · For AI
              agents: <a href="/llms.txt">llms.txt</a>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
