"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAnalyticsSession } from "@/hooks/useAnalyticsSession";
import { trackEvent } from "@/lib/analytics/trackEvent";
import type { NidusCtaInteractionId } from "@/lib/analytics/trackValidation";
import styles from "@/components/NidusCta.module.css";

interface NidusCtaProps {
  children: ReactNode;
  interactionId: NidusCtaInteractionId;
  variant: "primary" | "secondary";
  className?: string;
}

export default function NidusCta({
  children,
  interactionId,
  variant,
  className,
}: NidusCtaProps) {
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
    <Link className={classNames} href="/nidus" onClick={handleClick}>
      {children}
    </Link>
  );
}
