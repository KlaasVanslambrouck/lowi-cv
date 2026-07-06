"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOnceOptions {
  rootMargin?: string;
  threshold?: number;
  keepObserving?: boolean;
  onEntryChange?: (entry: IntersectionObserverEntry) => void;
}

// Gedeelde eenmalige reveal-trigger voor secties en decoratieve motieven.
export function useInViewOnce<T extends Element>({
  rootMargin = "0px",
  threshold = 0.12,
  keepObserving = false,
  onEntryChange,
}: UseInViewOnceOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Reduced motion: meteen eindstaat tonen, zonder scroll-animatie.
    if (reducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- bewust: media query is pas na mount leesbaar, eenmalige init
      setIsVisible(true);
      if (!keepObserving) return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          onEntryChange?.(entry);
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (!keepObserving) {
              observer.disconnect();
            }
          }
        });
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [keepObserving, onEntryChange, rootMargin, threshold]);

  return [ref, isVisible] as const;
}
