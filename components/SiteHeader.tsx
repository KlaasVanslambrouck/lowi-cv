"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import XrayToggle from "@/components/XrayToggle";
import type { ToggleClasses } from "@/components/toggleClasses";
import { placeholderContent } from "@/content/placeholderContent";
import { useLanguage } from "@/hooks/useLanguage";
import { localizedPath } from "@/lib/site";
import type { Bilingual, UILabels } from "@/types/content";
import styles from "@/styles/siteChrome.module.css";

export type SiteNavItem = "work" | "lowi" | "nidus" | "contact";

interface SiteHeaderProps {
  labels: UILabels;
  // Welke link de huidige pagina is (aria-current="page").
  current?: SiteNavItem;
  // X-ray bestaat alleen op de homepage.
  showXray?: boolean;
}

// TODO concept-copy: headernavigatie "Werk · LOWI · Nidus · Contact" en de
// menuknop (Main.dc.html §4).
const copy = {
  navLabel: { nl: "Hoofdnavigatie", en: "Main navigation" },
  work: { nl: "Werk", en: "Work" },
  contact: { nl: "Contact", en: "Contact" },
  menu: { nl: "Menu", en: "Menu" },
  menuClose: { nl: "Sluiten", en: "Close" },
} satisfies Record<string, Bilingual>;

const NAV_ITEMS: { id: SiteNavItem; href: string; label: Bilingual }[] = [
  { id: "work", href: "/#projects", label: copy.work },
  { id: "lowi", href: "/lowi", label: { nl: "LOWI", en: "LOWI" } },
  { id: "nidus", href: "/nidus", label: { nl: "Nidus", en: "Nidus" } },
  { id: "contact", href: "/#contact", label: copy.contact },
];

const TOGGLE_CLASSES: ToggleClasses = {
  root: styles.seg,
  option: styles.segOption,
  optionActive: `${styles.segOption} ${styles.segOptionActive}`,
  divider: styles.segDivider,
};

// Sticky kop van het redesign: naam, navigatie, taal en thema; op mobiel
// achter een menuknop. De schakelaars houden hun eigen logica.
export default function SiteHeader({
  labels,
  current,
  showXray = false,
}: SiteHeaderProps) {
  const { language, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function navLinks(onNavigate?: () => void) {
    return NAV_ITEMS.map((item) => (
      <Link
        key={item.id}
        className={styles.navLink}
        href={localizedPath(item.href, language)}
        aria-current={item.id === current ? "page" : undefined}
        onClick={onNavigate}
      >
        {t(item.label)}
      </Link>
    ));
  }

  return (
    <>
      <header id="top" className={styles.header}>
        <Link className={styles.brand} href={localizedPath("/", language)}>
          <svg
            className={styles.brandMark}
            viewBox="0 0 38 38"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M19 3 C 29 3, 35 10, 35 19 C 35 29, 28 35, 19 35 C 9 35, 3 28, 3 19 C 3 10, 10 4, 20 3" />
            <path
              className={styles.brandMarkLetter}
              d="M12 11 L12 27 M12 19 L22 11 M16 16 L23 27"
            />
          </svg>
          <span className={styles.brandName}>{placeholderContent.hero.name}</span>
        </Link>

        <nav className={styles.nav} aria-label={t(copy.navLabel)}>
          {navLinks()}
        </nav>

        <div className={styles.controls}>
          <LanguageToggle classes={TOGGLE_CLASSES} />
          <ThemeToggle labels={labels} classes={TOGGLE_CLASSES} />
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {t(menuOpen ? copy.menuClose : copy.menu)}
        </button>

        {showXray ? (
          <div className={styles.xrayBar}>
            <XrayToggle labels={labels} classes={TOGGLE_CLASSES} />
          </div>
        ) : null}
      </header>

      <div id={menuId} className={styles.menuPanel} hidden={!menuOpen}>
        <nav className={styles.menuNav} aria-label={t(copy.navLabel)}>
          {navLinks(closeMenu)}
        </nav>
        <div className={styles.menuControls}>
          <LanguageToggle classes={TOGGLE_CLASSES} />
          <ThemeToggle labels={labels} classes={TOGGLE_CLASSES} />
          {showXray ? <XrayToggle labels={labels} classes={TOGGLE_CLASSES} /> : null}
        </div>
      </div>
    </>
  );
}
