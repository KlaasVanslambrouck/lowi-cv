"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { trackEvent } from "@/lib/analytics/trackEvent";
import type { CtaInteractionId } from "@/lib/analytics/trackValidation";
import { localizedPath } from "@/lib/site";
import styles from "@/components/CtaLink.module.css";

// primary: gevulde knop (.btn), outline: omlijnde knop (.btn2),
// link: onderstreepte tekstlink (.tlink) — zoals in de artboards.
export type CtaVariant = "primary" | "outline" | "link";

interface CtaLinkProps {
  // NL-basispad; de taalversie komt uit localizedPath.
  href: string;
  interactionId: CtaInteractionId;
  variant: CtaVariant;
  // Pijl achter de tekst (decoratief).
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

// Interne call-to-action met een getrackte klik.
export default function CtaLink({
  href,
  interactionId,
  variant,
  arrow = false,
  className,
  children,
}: CtaLinkProps) {
  const { language } = useLanguage();
  const sessionId = useAnalyticsSession();

  function handleClick() {
    if (!sessionId) return;

    trackEvent({
      sessionId,
      eventType: "interaction",
      eventData: { interactionId },
    });
  }

  return (
    <Link
      className={[styles.cta, styles[variant], className].filter(Boolean).join(" ")}
      href={localizedPath(href, language)}
      onClick={handleClick}
    >
      {children}
      {arrow ? (
        variant === "link" ? (
          <span aria-hidden="true">→</span>
        ) : (
          <svg
            className={styles.arrow}
            viewBox="0 0 18 14"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M2 7 H15 M10 2 L15 7 L10 12" />
          </svg>
        )
      ) : null}
    </Link>
  );
}
