"use client";

import styles from "../beheer.module.css";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardShell}>
        <section
          className={styles.errorPanel}
          aria-labelledby="dashboard-error-title"
        >
          <p className={styles.eyebrow}>lowi / analytics</p>
          <h1 id="dashboard-error-title" className={styles.dashboardTitle}>
            Dashboard niet geladen
          </h1>
          <p className={styles.copy}>
            De analytics konden niet veilig worden opgehaald. Probeer opnieuw of
            log opnieuw in.
          </p>
          <button type="button" className={styles.secondaryButton} onClick={reset}>
            Opnieuw proberen
          </button>
        </section>
      </div>
    </main>
  );
}
