"use client";

import type { Bilingual, ContactInfo, UILabels } from "@/types/content";
import { useLanguage } from "@/hooks/useLanguage";
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

  return (
    // data-section-id zodat JarvisPresence deze sectie herkent
    <footer className={styles.footer} data-section-id="contact">
      <div className={styles.footerInner}>
        <h2 className={styles.footerTitle}>{t(title)}</h2>
        <div className={styles.footerLinks}>
          <a className={styles.footerLink} href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <a
            className={styles.footerLink}
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <span className={styles.footerLocation}>{t(contact.location)}</span>
        </div>
        {/* TODO: PDF-bestand nog manueel toevoegen aan /public,
            later evt. dynamisch genereren */}
        <a className={styles.downloadButton} href={contact.cvPdfUrl} download>
          {t(labels.downloadCv)}
        </a>
      </div>
    </footer>
  );
}
