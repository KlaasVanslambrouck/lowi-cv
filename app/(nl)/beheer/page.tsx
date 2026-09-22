"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./beheer.module.css";

const GENERIC_LOGIN_ERROR = "Ongeldige combinatie";

export default function BeheerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Volledig server-side login: de route voert rate-limiting én
      // signInWithPassword uit en zet de sessie-cookie op de response.
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Bewust generiek: nooit prijsgeven of het e-mailadres bestaat.
        setErrorMessage(
          response.status === 429
            ? "Te veel pogingen. Probeer later opnieuw."
            : GENERIC_LOGIN_ERROR,
        );
        return;
      }

      router.replace("/beheer/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(GENERIC_LOGIN_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="beheer-title">
        <p className={styles.eyebrow}>lowi / beheer</p>
        <h1 id="beheer-title" className={styles.title}>
          Beheer
        </h1>
        <p className={styles.copy}>
          Log in met de gekoppelde Supabase-adminsessie.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>E-mail</span>
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Wachtwoord</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Controleren..." : "Aanmelden"}
          </button>
          <p className={styles.message} role="status" aria-live="polite">
            {errorMessage}
          </p>
        </form>
      </section>
    </main>
  );
}
