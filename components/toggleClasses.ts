import styles from "@/styles/cv.module.css";

// Opmaak van de drie schakelaars (taal, thema, X-ray). De logica zit in de
// componenten zelf; alleen de klassen verschillen per plek: ControlStack
// (standaard) of de SiteHeader van het redesign.
export interface ToggleClasses {
  root: string;
  option: string;
  optionActive: string;
  divider: string;
}

type ControlStackRoot = "languageToggle" | "themeToggle" | "xrayToggle";

export function controlStackToggleClasses(root: ControlStackRoot): ToggleClasses {
  return {
    root: styles[root],
    option: styles.languageOption,
    optionActive: `${styles.languageOption} ${styles.languageOptionActive}`,
    divider: styles.languageDivider,
  };
}
