"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import LinguixSection from "@/components/linguix/LinguixSection";
import type {
  LinguixBlockId,
  LinguixCaseContent,
  LinguixSectionContent,
} from "@/types/linguix";
import styles from "./LinguixLayout.module.css";

interface LinguixLayoutProps {
  content: LinguixCaseContent;
  /**
   * Blok waar het document bij het openen naartoe springt. Wordt gebruikt om
   * terug te keren uit de presentatiemodus op het blok waar de spreker stond.
   */
  startSectionId?: LinguixBlockId | null;
  /** Meldt welk blok in beeld is, zodat de presentatiemodus daar kan openen. */
  onActiveSectionChange?: (sectionId: LinguixBlockId) => void;
}

interface NavigationLinkProps {
  section: LinguixSectionContent;
  active: boolean;
  compact?: boolean;
  onNavigate: (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: LinguixBlockId,
  ) => void;
}

function NavigationLink({
  section,
  active,
  compact = false,
  onNavigate,
}: NavigationLinkProps) {
  const formattedNumber = String(section.nummer).padStart(2, "0");

  if (compact) {
    return (
      <a
        href={`#${section.id}`}
        className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
        aria-label={`${section.nummer}. ${section.titel}`}
        aria-current={active ? "location" : undefined}
        onClick={(event) => onNavigate(event, section.id)}
      >
        {formattedNumber}
      </a>
    );
  }

  return (
    <a
      href={`#${section.id}`}
      className={`${styles.desktopLink} ${active ? styles.desktopLinkActive : ""}`}
      aria-current={active ? "location" : undefined}
      onClick={(event) => onNavigate(event, section.id)}
    >
      <span className={styles.desktopLinkNumber}>{formattedNumber}</span>
      <span className={styles.desktopLinkTitle}>{section.titel}</span>
    </a>
  );
}

export default function LinguixLayout({
  content,
  startSectionId = null,
  onActiveSectionChange,
}: LinguixLayoutProps) {
  const sectionIds = useMemo(
    () => content.secties.map((section) => section.id),
    [content.secties],
  );
  const [activeSectionId, setActiveSectionId] = useState<LinguixBlockId>(
    startSectionId ?? content.secties[0].id,
  );

  // Bij terugkeer uit de presentatiemodus meteen naar het juiste blok springen,
  // zonder animatie: de spreker verwacht het blok waar hij stond.
  useEffect(() => {
    if (!startSectionId) return;

    const target = document.getElementById(startSectionId);
    if (!target) return;

    target.scrollIntoView({ behavior: "auto", block: "start" });
  }, [startSectionId]);

  useEffect(() => {
    if (!onActiveSectionChange) return;
    onActiveSectionChange(activeSectionId);
  }, [activeSectionId, onActiveSectionChange]);

  useEffect(() => {
    const sectionElements = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) return;

    const updateActiveSection = () => {
      const activationLine = window.innerHeight * 0.24;
      let nextActiveElement = sectionElements[0];

      for (const sectionElement of sectionElements) {
        if (sectionElement.getBoundingClientRect().top <= activationLine) {
          nextActiveElement = sectionElement;
          continue;
        }

        break;
      }

      setActiveSectionId(nextActiveElement.id as LinguixBlockId);
    };

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    });

    sectionElements.forEach((sectionElement) => observer.observe(sectionElement));
    updateActiveSection();

    return () => observer.disconnect();
  }, [sectionIds]);

  const activeSection =
    content.secties.find((section) => section.id === activeSectionId) ??
    content.secties[0];

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: LinguixBlockId,
  ) => {
    event.preventDefault();
    const target = document.getElementById(sectionId);

    if (!target) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setActiveSectionId(sectionId);
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.mobileNavigation} aria-label="Sectienavigatie">
        <div className={styles.mobileNavigationInner}>
          <span className={styles.mobileCurrentSection}>
            {String(activeSection.nummer).padStart(2, "0")} ·{" "}
            {activeSection.titel}
          </span>
          <div className={styles.mobileLinks}>
            {content.secties.map((section) => (
              <NavigationLink
                key={section.id}
                section={section}
                active={section.id === activeSectionId}
                compact
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <nav className={styles.desktopNavigation} aria-label="Sectienavigatie">
            <a className={styles.caseTitle} href="#top">
              {content.titel}
            </a>
            <ol className={styles.desktopLinks}>
              {content.secties.map((section) => (
                <li key={section.id}>
                  <NavigationLink
                    section={section}
                    active={section.id === activeSectionId}
                    onNavigate={handleNavigate}
                  />
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <main id="top" className={styles.main}>
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>{content.titel}</h1>
            <p className={styles.heroThesis}>{content.kernstelling}</p>
          </header>

          <div className={styles.sections}>
            {content.secties.map((section) => (
              <LinguixSection key={section.id} section={section} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
