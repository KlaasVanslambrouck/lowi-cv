"use client";

import { memo, useRef, type MutableRefObject, type ReactElement } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, FogExp2, PerspectiveCamera } from "three";
import { lowiCelBeginStaat } from "@/content/lowiCellContent";
import CelModel from "./CelModel";
import CelMedium from "./CelMedium";
import CelEffecten from "./CelEffecten";
import { celPalet } from "./celPalet";
import { useCelInterpolatie } from "./useCelInterpolatie";
import styles from "./LowiCelPagina.module.css";
import { celInstellingen as c } from "./celInstellingen";

const cameraInstellingen = { position: [...lowiCelBeginStaat.cameraPositie] as [number, number, number], fov: lowiCelBeginStaat.fov, near: c.camera.near, far: c.camera.far };
const fogKleur = new Color(celPalet.weefsel).multiplyScalar(c.instrument.fogWarmte);

interface CelCanvasProps { voortgangRef: MutableRefObject<number>; inBeeld: boolean; onFailure: () => void; }
function CelScene({ voortgangRef }: { voortgangRef: MutableRefObject<number> }): ReactElement {
  const staat = useCelInterpolatie(voortgangRef);
  const afmeting = useRef({ breedte: 0, hoogte: 0 });
  useFrame(({ camera, clock, size, scene }) => {
    const t = clock.elapsedTime * c.camera.driftSnelheid;
    camera.position.copy(staat.cameraPositie);
    camera.position.x += Math.sin(t)*c.camera.drift;
    camera.position.y += Math.sin(t*.73+1)*c.camera.drift*.6;
    camera.position.z += Math.cos(t*.51)*c.camera.drift*.4;
    camera.lookAt(staat.kijkNaar);
    // Het medium hoort binnen de cel; een verre observatie kijkt niet door
    // vijf extra wereldeenheden even dichte vloeistof heen.
    if (scene.fog instanceof FogExp2) scene.fog.density = c.instrument.fogDichtheid / Math.max(1, camera.position.lengthSq() / 1.44);
    if (camera instanceof PerspectiveCamera) {
      const gewijzigd = Math.abs(camera.fov-staat.fov) > .001;
      camera.fov = staat.fov;
      if (afmeting.current.breedte!==size.width || afmeting.current.hoogte!==size.height) {
        camera.setViewOffset(size.width,size.height,-size.width*c.camera.onderwerpRechts,0,size.width,size.height);
        afmeting.current={breedte:size.width,hoogte:size.height};
      } else if (gewijzigd) camera.updateProjectionMatrix();
    }
  }, -1);
  return <>
    <color attach="background" args={[fogKleur]}/>
    <fogExp2 attach="fog" args={[fogKleur,c.instrument.fogDichtheid]}/>
    <ambientLight color="#b8c4d5" intensity={c.licht.omgeving}/>
    <directionalLight position={[...c.licht.hoofdPositie]} intensity={c.licht.hoofd} color="#eee9df"/>
    <directionalLight position={[...c.licht.vulPositie]} intensity={c.licht.vulling} color={celPalet.violet}/>
    <CelModel staat={staat}/><CelMedium staat={staat}/><CelEffecten staat={staat}/>
  </>;
}
function CelCanvas({ voortgangRef, inBeeld, onFailure }: CelCanvasProps): ReactElement {
  return <div className={styles.canvasVlak}>
    <Canvas dpr={[...c.camera.dpr]} frameloop={inBeeld ? "always" : "never"}
      gl={{alpha:false,antialias:false,powerPreference:"default"}} camera={cameraInstellingen}
      onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }}>
      <CelScene voortgangRef={voortgangRef}/>
    </Canvas>
  </div>;
}
export default memo(CelCanvas);
