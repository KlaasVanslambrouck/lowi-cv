"use client";

import { useTheme } from "@/app/cv/hooks/useTheme";
import styles from "@/styles/cv.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-pressed={theme === "light"}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <span
        className={
          theme === "dark"
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        DARK
      </span>
      <span className={styles.languageDivider} aria-hidden="true">
        /
      </span>
      <span
        className={
          theme === "light"
            ? `${styles.languageOption} ${styles.languageOptionActive}`
            : styles.languageOption
        }
      >
        LIGHT
      </span>
    </button>
  );
}
