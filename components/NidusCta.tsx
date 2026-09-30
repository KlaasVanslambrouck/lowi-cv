"use client";

import type { ReactNode } from "react";
import CtaLink, { type CtaVariant } from "@/components/CtaLink";
import type { CtaInteractionId } from "@/lib/analytics/trackValidation";

interface NidusCtaProps {
  children: ReactNode;
  interactionId: CtaInteractionId;
  variant: CtaVariant;
  arrow?: boolean;
  className?: string;
}

// Getrackte link naar de Nidus-case (/nidus of /en/nidus).
export default function NidusCta(props: NidusCtaProps) {
  return <CtaLink href="/nidus" {...props} />;
}
