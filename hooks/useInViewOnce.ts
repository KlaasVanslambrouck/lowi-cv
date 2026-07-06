"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOnceOptions {
  rootMargin?: string;
  threshold?: number;
}

// Gedeelde eenmalige reveal-trigger voor secties en decoratieve motieven.
export function useInViewOnce<T extends Element>({
  rootMargin = "0px",
  threshold = 0.12,
}: UseInViewOnceOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Reduced motion: meteen eindstaat tonen, zonder scroll-animatie.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, isVisible] as const;
}
