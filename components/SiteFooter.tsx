"use client";

import Link from "next/link";
import { placeholderContent } from "@/content/placeholderContent";
import { useLanguage } from "@/hooks/useLanguage";
import { localizedPath } from "@/lib/site";
import type { Bilingual } from "@/types/content";
import styles from "@/styles/siteChrome.module.css";

export type SitePage = "home" | "lowi" | "nidus";

interface SiteFooterProps {
  // De huidige pagina; de footer linkt naar de andere twee.
  current: SitePage;
}

// TODO concept-copy: "Naar boven" (Main.dc.html §4).
const toTop: Bilingual = { nl: "Naar boven", en: "Back to top" };

const PAGES: { id: SitePage; href: string; label: Bilingual }[] = [
  { id: "home", href: "/", label: { nl: "Home", en: "Home" } },
  { id: "lowi", href: "/lowi", label: { nl: "LOWI", en: "LOWI" } },
  { id: "nidus", href: "/nidus", label: { nl: "Nidus", en: "Nidus" } },
];

export default function SiteFooter({ current }: SiteFooterProps) {
  const { language, t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <span className={styles.footerName}>{placeholderContent.hero.name}</span>
      <nav className={styles.footerNav} aria-label="Footer">
        {/* #top = de SiteHeader */}
        <a className={styles.footerLink} href="#top">
          {t(toTop)}
        </a>
        {PAGES.filter((page) => page.id !== current).map((page) => (
          <Link
            key={page.id}
            className={styles.footerLink}
            href={localizedPath(page.href, language)}
          >
            {t(page.label)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
