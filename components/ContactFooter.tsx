"use client";

import type { Bilingual, ContactInfo, UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import styles from "@/styles/cv.module.css";

interface ContactFooterProps {
  contact: ContactInfo;
  title: Bilingual;
  labels: UILabels;
}

export default function ContactFooter({
  contact,
  title,
  labels,
}: ContactFooterProps) {
  const { t } = useLanguage();
  const [footerRef] = useSectionTracking<HTMLElement>("contact");

  return (
    // data-section-id zodat JarvisPresence deze sectie herkent
    <footer ref={footerRef} className={styles.footer} data-section-id="contact">
      <div className={styles.footerInner}>
        <h2 className={styles.footerTitle}>{t(title)}</h2>
        <div className={styles.footerLinks}>
          <a className={styles.footerLink} href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          {contact.linkedinUrl ? (
            <a
              className={styles.footerLink}
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          ) : null}
          <span className={styles.footerLocation}>{t(contact.location)}</span>
        </div>
        {/* Knop verschijnt pas als het PDF-bestand echt in /public staat
            (contact.cvPdfAvailable) — voorkomt een 404 op de downloadlink. */}
        {contact.cvPdfAvailable ? (
          <a className={styles.downloadButton} href={contact.cvPdfUrl} download>
            {t(labels.downloadCv)}
          </a>
        ) : null}
        <p className={styles.footerNote}>
          {t(labels.analyticsTransparencyNote)}
        </p>
      </div>
    </footer>
  );
}
