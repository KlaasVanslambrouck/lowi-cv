"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { useLanguage } from "@/hooks/useLanguage";
import { trackEvent } from "@/lib/analytics/trackEvent";
import type { CtaInteractionId } from "@/lib/analytics/trackValidation";
import { localizedPath } from "@/lib/site";
import styles from "@/components/NidusCta.module.css";

interface NidusCtaProps {
  children: ReactNode;
  interactionId: CtaInteractionId;
  variant: "primary" | "secondary";
  className?: string;
}

export default function NidusCta({
  children,
  interactionId,
  variant,
  className,
}: NidusCtaProps) {
  const { language } = useLanguage();
  const sessionId = useAnalyticsSession();
  const classNames = [styles.cta, styles[variant], className]
    .filter(Boolean)
    .join(" ");

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
      className={classNames}
      href={localizedPath("/nidus", language)}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
