"use client";

import type { Bilingual, ContactInfo, UILabels } from "@/types/content";
import SketchSection from "@/components/SketchSection";
import Highlight from "@/components/sketch/Highlight";
import { useLanguage } from "@/hooks/useLanguage";
import ctaStyles from "@/components/CtaLink.module.css";
import styles from "@/styles/home.module.css";

interface ContactFooterProps {
  contact: ContactInfo;
  title: Bilingual;
  labels: UILabels;
}

// Contactsectie (#contact). Sinds het redesign een gewone sectie: de
// eigenlijke paginavoet is SiteFooter. Sectie-id en anker blijven "contact"
// (analytics, SiteHeader, JarvisAsk).
export default function ContactFooter({ contact, title, labels }: ContactFooterProps) {
  const { t } = useLanguage();

  return (
    <SketchSection
      id="contact"
      eyebrow={{ nl: "08", en: "08" }}
      title={title}
      layout="split"
      className={styles.contactSection}
    >
      <div className={styles.contactBody}>
        <a className={styles.contactMail} href={`mailto:${contact.email}`}>
          <Highlight delay={1}>{contact.email}</Highlight>
        </a>
        <div className={styles.contactRow}>
          {contact.linkedinUrl ? (
            <a
              className={styles.textLink}
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          ) : null}
          <span className={styles.contactPlace}>{t(contact.location)}</span>
          {/* Zelfde origin dankzij de rewrite in next.config.ts, dus `download` werkt. */}
          {contact.cvPdfAvailable ? (
            <a
              className={`${ctaStyles.cta} ${ctaStyles.primary}`}
              href={contact.cvPdfUrl}
              download
            >
              {t(labels.downloadCv)}
            </a>
          ) : null}
        </div>
        <p className={`${styles.small} ${styles.privacy}`}>
          {t(labels.analyticsTransparencyNote)}
        </p>
      </div>
    </SketchSection>
  );
}
