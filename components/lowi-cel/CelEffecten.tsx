"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, DepthOfFieldEffect, EffectPass, KernelSize, NoiseEffect, VignetteEffect, ToneMappingEffect, ToneMappingMode, type EffectComposer as Composer } from "postprocessing";
import { celInstellingen as c } from "./celInstellingen";
import type { CelStaat } from "./useCelInterpolatie";

function CelEffecten({ staat }: { staat: CelStaat }) {
  const camera = useThree(s => s.camera);
  const composer = useRef<Composer>(null);
  const [effecten] = useState(() => {
    const dof = new DepthOfFieldEffect(camera, { focusRange: staat.focusBereik, bokehScale: c.effecten.bokeh, resolutionScale: c.effecten.resolutie });
    dof.target = staat.focusPunt;
    const bloom = new BloomEffect({ intensity: c.effecten.bloomIntensiteit, luminanceThreshold: c.effecten.bloomDrempel, luminanceSmoothing: .15, mipmapBlur: false, kernelSize: KernelSize.SMALL, resolutionScale: .5 });
    const korrel = new NoiseEffect({ blendFunction: BlendFunction.SOFT_LIGHT }); korrel.blendMode.opacity.value = c.effecten.korrel;
    return {
      dof, bloom,
      scherpte: new EffectPass(camera, dof), gloed: new EffectPass(camera, bloom),
      afwerking: new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC }), new VignetteEffect({ darkness: c.effecten.vignette, offset: .32 }), korrel),
    };
  });
  const ref = useRef(effecten);
  // Gedeelde mutable scene-werkstaat, geen React-renderstate.
  const staatRef = useRef(staat);
  const meting = useRef({ warm: 0, tijd: 0, frames: 0, niveau: 0 });
  useEffect(() => {
    const waarde = composer.current;
    return () => {
      // De wrapper verwijdert onze passes in zijn layout-cleanup. Hun effecten
      // en render targets blijven daarom onze verantwoordelijkheid.
      effecten.scherpte.dispose();
      effecten.gloed.dispose();
      effecten.afwerking.dispose();
      waarde?.dispose();
    };
  }, [effecten]);
  useFrame(({ gl }, delta) => {
    const e = ref.current, m = meting.current;
    e.dof.cocMaterial.focusRange = staat.focusBereik;
    // Alle adaptatie gebeurt imperatief: geen componentrenders tijdens scroll.
    if (m.warm < c.effecten.meetSeconden) {
      // Shadercompilatie kan het eerste frame lang blokkeren. Begin pas na
      // een reeks zichtbare frames; tel die opstartpauze niet als GPU-budget.
      m.warm += Math.min(delta, c.effecten.opwarmDelta);
      return;
    }
    m.tijd += delta; m.frames++;
    if (m.tijd < c.effecten.meetSeconden) return;
    const fps = m.frames / m.tijd;
    if (m.niveau === 0 && fps < c.effecten.deeltjesOnderFps) {
      staatRef.current.deeltjesDichtheid = c.effecten.beperkteDichtheid; m.niveau = 1;
    } else if (m.niveau === 1 && fps < c.effecten.dofOnderFps) {
      e.scherpte.enabled = false; m.niveau = 2;
    }
    // Meetbare diagnose op het decoratieve canvas; geen zichtbare product-UI.
    gl.domElement.dataset.lowiFps = fps.toFixed(1);
    gl.domElement.dataset.lowiDof = String(e.scherpte.enabled);
    gl.domElement.dataset.lowiBloom = String(e.gloed.enabled);
    gl.domElement.dataset.lowiDeeltjes = String(staat.deeltjesDichtheid);
    m.tijd = 0; m.frames = 0;
  }, 0);
  return <EffectComposer ref={composer} multisampling={2} enableNormalPass={false}>
    <primitive object={effecten.scherpte} dispose={null}/>
    <primitive object={effecten.gloed} dispose={null}/>
    <primitive object={effecten.afwerking} dispose={null}/>
  </EffectComposer>;
}
export default memo(CelEffecten);
