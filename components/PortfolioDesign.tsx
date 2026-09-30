"use client";

import type { ReactNode } from "react";
import { useXray } from "@/hooks/useXray";
import styles from "@/styles/sketchbook.module.css";

interface PortfolioDesignProps {
  as?: "div" | "main";
  className?: string;
  // X-ray bestaat alleen op de homepage; elders blijft data-xray weg, ook
  // als de (globale) XrayContext nog aan staat na een navigatie.
  allowXray?: boolean;
  children: ReactNode;
}

// Wrapper die de redesign-tokens (styles/sketchbook.module.css) activeert.
export default function PortfolioDesign({
  as: Tag = "div",
  className,
  allowXray = false,
  children,
}: PortfolioDesignProps) {
  const { xrayActive } = useXray();

  return (
    <Tag
      className={
        className
          ? `${styles.portfolioDesign} ${className}`
          : styles.portfolioDesign
      }
      data-xray={allowXray && xrayActive ? "on" : undefined}
    >
      {children}
    </Tag>
  );
}
