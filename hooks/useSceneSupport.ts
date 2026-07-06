"use client";

import { useEffect, useState } from "react";

export interface SceneSupport {
  // false tot de checks na mount gedraaid hebben (SSR-veilig)
  ready: boolean;
  webglOk: boolean;
  reducedMotion: boolean;
  smallScreen: boolean;
  // Afgeleide: mag er een live WebGL-scene getoond worden?
  showLiveScene: boolean;
}

function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Gedeelde detectielogica voor alle WebGL-scenes (Hero, SkillConstellation,
// ArchitectureSceneMini): reduced motion, schermbreedte <768px en WebGL-support.
// Media queries worden live gevolgd, zodat bv. een window-resize of het
// omzetten van de OS-instelling meteen doorwerkt.
export function useSceneSupport(): SceneSupport {
  const [support, setSupport] = useState<SceneSupport>({
    ready: false,
    webglOk: false,
    reducedMotion: false,
    smallScreen: false,
    showLiveScene: false,
  });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const smallScreenQuery = window.matchMedia("(max-width: 767px)");

    const evaluate = () => {
      const webglOk = detectWebGLSupport();
      const reducedMotion = reducedMotionQuery.matches;
      const smallScreen = smallScreenQuery.matches;
      setSupport({
        ready: true,
        webglOk,
        reducedMotion,
        smallScreen,
        showLiveScene: webglOk && !reducedMotion && !smallScreen,
      });
    };

    evaluate();
    reducedMotionQuery.addEventListener("change", evaluate);
    smallScreenQuery.addEventListener("change", evaluate);
    return () => {
      reducedMotionQuery.removeEventListener("change", evaluate);
      smallScreenQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return support;
}
