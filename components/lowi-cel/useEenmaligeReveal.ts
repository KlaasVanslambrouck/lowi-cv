"use client";

import { useEffect, type RefObject } from 'react';

/** SSR and failures keep content visible; only unseen copy is armed. */
export function useEenmaligeReveal(ref: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const nodes = [...(ref.current?.querySelectorAll<HTMLElement>('[data-lowi-reveal]') ?? [])];
    if (reducedMotion) { nodes.forEach(n => { n.dataset.reveal = 'visible'; }); return; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.reveal = 'visible';
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });
    nodes.forEach(node => {
      if (node.dataset.reveal === 'visible' || node.getBoundingClientRect().top < innerHeight * .85) {
        node.dataset.reveal = 'visible';
      } else { node.dataset.reveal = 'pending'; observer.observe(node); }
    });
    return () => { observer.disconnect(); nodes.forEach(n => { n.dataset.reveal = 'visible'; }); };
  }, [ref, reducedMotion]);
}
