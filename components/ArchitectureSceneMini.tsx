"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSceneSupport } from "@/hooks/useSceneSupport";
import styles from "@/styles/cv.module.css";

// Canvas laadt lazy: de three.js-chunk wordt pas gedownload wanneer de
// sectie daadwerkelijk in de buurt van de viewport komt (zie observer)
const ArchitectureSceneMiniCanvas = dynamic(
  () => import("@/components/ArchitectureSceneMiniCanvas"),
  { ssr: false, loading: () => null },
);

// Kleine, lichtgewicht scene als visuele brug tussen "Wat ik bouw" en
// "Projecten": het netwerk gesplitst in clusters, idle met subtiele drift.
// Geen boot-sequence. Mount pas wanneer de sectie in beeld komt en unmount
// weer wanneer ze ver buiten beeld scrolt (bespaart GPU).
export default function ArchitectureSceneMini() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const support = useSceneSupport();

  const sceneAllowed = support.ready && support.showLiveScene;

  useEffect(() => {
    if (!sceneAllowed) return;
    const element = containerRef.current;
    if (!element) return;

    // Ruime marge: mount al vlak vóór de sectie in beeld komt, unmount pas
    // wanneer ze er ruim voorbij is (voorkomt flikkeren op de rand)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setInView(entry.isIntersecting));
      },
      { rootMargin: "300px 0px 300px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sceneAllowed]);

  // Puur decoratief element: zonder WebGL/op mobiel gewoon niets renderen
  if (!sceneAllowed) return null;

  return (
    <div
      ref={containerRef}
      className={styles.miniSceneWrapper}
      aria-hidden="true"
    >
      {inView ? <ArchitectureSceneMiniCanvas /> : null}
    </div>
  );
}
