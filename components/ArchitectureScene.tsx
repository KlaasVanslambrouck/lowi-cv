"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Line2 } from "three-stdlib";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/context/ThemeContext";
import styles from "@/styles/cv.module.css";

// Kleuren als constanten — matchen de CSS design tokens in globals.css
interface ScenePalette {
  background: string;
  infrastructure: string;
  activity: string;
  live: string;
  ai: string;
  line: string;
  pointLight: string;
  ambientIntensity: number;
  pointLightIntensity: number;
  coreEmissive: number;
  infrastructureEmissive: number;
  jarvisEmissive: number;
  coreLineOpacity: number;
  meshLineOpacity: number;
  haloBaseOpacity: number;
  haloPulseOpacity: number;
  bloomIntensity: number;
  bloomThreshold: number;
}

const SCENE_PALETTES: Record<Theme, ScenePalette> = {
  dark: {
    background: "#101118",
    infrastructure: "#F1ECE2",
    activity: "#C98245",
    live: "#669CFF",
    ai: "#9878FF",
    line: "#F1ECE2",
    pointLight: "#F1ECE2",
    ambientIntensity: 0.4,
    pointLightIntensity: 26,
    coreEmissive: 1.05,
    infrastructureEmissive: 0.28,
    jarvisEmissive: 0.8,
    coreLineOpacity: 0.18,
    meshLineOpacity: 0.28,
    haloBaseOpacity: 0.08,
    haloPulseOpacity: 0.18,
    bloomIntensity: 0.45,
    bloomThreshold: 0.28,
  },
  light: {
    background: "#F3EFE7",
    infrastructure: "#171820",
    activity: "#A95F2C",
    live: "#2864D7",
    ai: "#6945D6",
    line: "#171820",
    pointLight: "#FAF7F1",
    ambientIntensity: 0.9,
    pointLightIntensity: 8,
    coreEmissive: 0.28,
    infrastructureEmissive: 0.04,
    jarvisEmissive: 0.22,
    coreLineOpacity: 0.2,
    meshLineOpacity: 0.2,
    haloBaseOpacity: 0.04,
    haloPulseOpacity: 0.1,
    bloomIntensity: 0.12,
    bloomThreshold: 0.6,
  },
};

// Camera-drift-amplitudes. Deze worden OOK meegerekend in de safe-zone-
// berekening hieronder, zodat nodes ook tijdens de drift buiten de tekstzone
// blijven (niet enkel in de initiële pose).
const DRIFT_X = 0.55;
const DRIFT_Y = 0.35;
const DRIFT_Z = 0.3;
const CAMERA_BASE_Z = 6.5;

// SAFE ZONE (bugfix): de hero-tekst (naam, rol, thesis) staat onderaan de
// hero. In scene-coördinaten op het z=0-vlak correspondeert dat met alles
// onder deze y-grens. Geen enkele node of label mag daar komen.
const SAFE_ZONE_TOP = -0.1;
// Extra marge boven de safe zone én ruimte bovenaan voor de Html-labels
const NODE_BAND_BOTTOM_MARGIN = 0.4;
const LABEL_HEADROOM = 0.55;

// Tijdlijn van de boot-sequence (seconden sinds mount)
const BOOT_CORE_START = 0.0;
const BOOT_CORE_DURATION = 0.3;
const BOOT_LINK_START = 0.3; // kern-verbindingen groeien gestaffeld
const BOOT_LINK_STAGGER = 0.07;
const BOOT_LINK_DURATION = 0.3;
const BOOT_NODE_START = 0.9; // nodes "ontwaken" één voor één
const BOOT_NODE_STAGGER = 0.06;
const BOOT_NODE_DURATION = 0.3;
const BOOT_MESH_LINE_START = 1.1; // onderlinge verbindingen faden daarna in
const BOOT_PULSE_START = 1.7; // datapulsen verschijnen als alles er staat

interface ArchitectureNodeConfig {
  id: string;
  label: string;
  position: [number, number, number]; // ontwerp-positie, wordt geremapt
  isJarvis?: boolean;
}

// Structurele scene-configuratie: spiegelt de echte LOWI-architectuur.
// (Dit is scène-opbouw, geen CV-content — content leeft in placeholderContent.)
// De y-waarden zijn ontwerp-coördinaten in [-1, 1]; computeNodeLayout() mapt
// ze naar de veilige band boven de hero-tekst.
const NODES: ArchitectureNodeConfig[] = [
  { id: "next-js", label: "next-js", position: [-2.7, 0.75, 0] },
  { id: "supabase", label: "supabase", position: [-0.9, 0.9, -0.9] },
  { id: "railway", label: "railway", position: [1.6, 0.8, -0.2] },
  { id: "databricks", label: "databricks", position: [3.0, -0.15, -1.1] },
  { id: "pi", label: "Raspberry Pi", position: [-1.3, -0.95, 0.55] },
  { id: "mobile", label: "mobile", position: [-2.9, -0.55, -0.6] },
  { id: "jarvis", label: "jarvis", position: [1.15, -0.9, 1.0], isJarvis: true },
];

// De centrale kern: symboliseert het geheel (LOWI), niet één technologie
const CORE_ID = "lowi";
const CORE_POSITION: [number, number, number] = [0, -0.05, 0.35];

// Onderlinge verbindingen tussen technologie-nodes
const CONNECTIONS: Array<[string, string]> = [
  ["next-js", "supabase"],
  ["next-js", "railway"],
  ["railway", "supabase"],
  ["railway", "databricks"],
  ["databricks", "supabase"],
  ["pi", "supabase"],
  ["mobile", "railway"],
  ["jarvis", "railway"],
  ["jarvis", "supabase"],
];

// Datapulsen: klein glowing bolletje dat over een verbinding reist.
// Koper is normale activiteit, blue is live data, violet is AI/Jarvis.
// Puur decoratief/placeholder — later eventueel gekoppeld aan echte events.
// Perf-knop: dit aantal (8) eerst verlagen als bloom + pulsen te zwaar worden.
interface PulseConfig {
  from: string;
  to: string;
  tone: "activity" | "live" | "ai";
  speed: number; // fractie van de lijn per seconde
  phase: number; // startoffset zodat pulsen niet synchroon lopen
  size: number;
}

const PULSES: PulseConfig[] = [
  { from: "pi", to: "supabase", tone: "activity", speed: 0.4, phase: 0.0, size: 0.045 },
  { from: "next-js", to: "supabase", tone: "activity", speed: 0.36, phase: 0.45, size: 0.04 },
  { from: "databricks", to: "supabase", tone: "activity", speed: 0.42, phase: 0.7, size: 0.04 },
  { from: "supabase", to: CORE_ID, tone: "live", speed: 0.38, phase: 0.2, size: 0.045 },
  { from: CORE_ID, to: "jarvis", tone: "ai", speed: 0.22, phase: 0.1, size: 0.05 },
  { from: CORE_ID, to: "railway", tone: "activity", speed: 0.24, phase: 0.55, size: 0.045 },
  { from: "mobile", to: "railway", tone: "activity", speed: 0.2, phase: 0.35, size: 0.045 },
  { from: "jarvis", to: "railway", tone: "ai", speed: 0.26, phase: 0.8, size: 0.04 },
];

const MAX_BASE_X = 3.0; // breedste ontwerp-positie (databricks)
const BASE_Y_MIN = -1;
const BASE_Y_MAX = 1;

// Veerkrachtige easing zodat elementen met een subtiele overshoot binnenkomen
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function bootProgress(elapsed: number, start: number, duration: number): number {
  return THREE.MathUtils.clamp((elapsed - start) / duration, 0, 1);
}

// Herberekent alle node-posities zodat ze — inclusief camera-drift-marge —
// binnen beeld blijven én boven de safe zone van de hero-tekst.
// De verticale band wordt geschaald op de zichtbare hoogte, de x-as op de
// zichtbare breedte (belangrijk voor tablet-breedtes 768–1024px, waar de
// viewport smaller is en de oude vaste posities buiten beeld of over de
// tekst vielen).
function useNodeLayout(): Map<string, [number, number, number]> {
  const { viewport } = useThree();

  return useMemo(() => {
    const halfWidth = viewport.width / 2;
    const halfHeight = viewport.height / 2;

    const bandBottom = SAFE_ZONE_TOP + DRIFT_Y + NODE_BAND_BOTTOM_MARGIN;
    const bandTop = Math.max(
      bandBottom + 0.8, // minimale bandhoogte, ook op extreem lage viewports
      halfHeight - DRIFT_Y - LABEL_HEADROOM,
    );
    const xScale = Math.min(
      1,
      (halfWidth - DRIFT_X - 0.35) / MAX_BASE_X,
    );

    const remap = (
      position: [number, number, number],
    ): [number, number, number] => {
      const normalizedY =
        (position[1] - BASE_Y_MIN) / (BASE_Y_MAX - BASE_Y_MIN);
      return [
        position[0] * xScale,
        bandBottom + normalizedY * (bandTop - bandBottom),
        position[2],
      ];
    };

    const layout = new Map<string, [number, number, number]>();
    layout.set(CORE_ID, remap(CORE_POSITION));
    NODES.forEach((node) => layout.set(node.id, remap(node.position)));
    return layout;
  }, [viewport.width, viewport.height]);
}

// De centrale kern-node: koper, groter, sterkere gloed; verschijnt als eerste
function CoreNode({
  position,
  palette,
}: {
  position: [number, number, number];
  palette: ScenePalette;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const progress = bootProgress(elapsed, BOOT_CORE_START, BOOT_CORE_DURATION);
    // Idle: rustige "ademhaling" bovenop de boot-schaal
    const breathe = 1 + Math.sin(elapsed * 1.1) * 0.035;
    const scale = (progress === 0 ? 0.0001 : easeOutBack(progress)) * breathe;
    groupRef.current?.scale.setScalar(scale);
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        palette.coreEmissive + (Math.sin(elapsed * 1.1) + 1) * 0.18;
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = String(progress);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.0001}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          // TODO: later scrollen naar de bijbehorende sectie
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={palette.ai}
          emissive={palette.ai}
          emissiveIntensity={palette.coreEmissive}
        />
      </mesh>
      <Html position={[0, 0.55, 0]} center style={{ pointerEvents: "none" }}>
        {/* Start onzichtbaar; opacity volgt de boot-progress via de ref */}
        <span
          ref={labelRef}
          className={`${styles.nodeLabel} ${styles.nodeLabelJarvis}`}
          style={{ opacity: 0 }}
        >
          {CORE_ID}
        </span>
      </Html>
    </group>
  );
}

function ArchitectureNode({
  node,
  position,
  bootDelay,
  palette,
}: {
  node: ArchitectureNodeConfig;
  position: [number, number, number];
  bootDelay: number;
  palette: ScenePalette;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Jarvis is violet en iets prominenter dan de infrastructuurnodes.
  const baseColor = node.isJarvis ? palette.ai : palette.infrastructure;
  const radius = node.isJarvis ? 0.22 : 0.14;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // "Ontwaken": fade-in + korte scale-bounce, gestaffeld per node
    const progress = bootProgress(elapsed, bootDelay, BOOT_NODE_DURATION);
    const bootScale = progress === 0 ? 0.0001 : easeOutBack(progress);
    groupRef.current?.scale.setScalar(bootScale);
    if (labelRef.current) {
      labelRef.current.style.opacity = String(
        progress * (node.isJarvis ? 1 : 0.8),
      );
    }

    // Idle-staat: Jarvis pulseert continu met electric-blue activiteit.
    if (node.isJarvis) {
      const pulse = (Math.sin(elapsed * 2.4) + 1) / 2; // genormaliseerd 0..1
      if (coreMaterialRef.current) {
        coreMaterialRef.current.emissiveIntensity =
          palette.jarvisEmissive + pulse * 0.8;
      }
      if (haloRef.current) {
        haloRef.current.scale.setScalar(1.35 + pulse * 0.45);
        const haloMaterial = haloRef.current
          .material as THREE.MeshBasicMaterial;
        haloMaterial.opacity =
          palette.haloBaseOpacity + pulse * palette.haloPulseOpacity;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.0001}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          // TODO: later scrollen naar de bijbehorende sectie
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={
            node.isJarvis
              ? palette.jarvisEmissive
              : palette.infrastructureEmissive
          }
        />
      </mesh>
      {node.isJarvis ? (
        // Electric-blue halo die meepulseert als actieve Jarvis-state.
        <mesh ref={haloRef} scale={1.4}>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshBasicMaterial
            color={palette.live}
            transparent
            opacity={palette.haloBaseOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <Html
        position={[0, radius + 0.22, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span
          ref={labelRef}
          className={
            node.isJarvis
              ? `${styles.nodeLabel} ${styles.nodeLabelJarvis}`
              : styles.nodeLabel
          }
          style={{ opacity: 0 }}
        >
          {node.label}
        </span>
      </Html>
    </group>
  );
}

// Verbinding die vanuit de kern naar een node "groeit" tijdens de boot.
// Truc: de lijn staat in lokale coördinaten vanaf de oorsprong en de
// group-schaal animeert van 0 → 1, zodat de lijn vanuit het origin groeit
// zonder per frame geometrie te herschrijven.
function GrowingLine({
  origin,
  target,
  delay,
  color,
  maxOpacity,
}: {
  origin: [number, number, number];
  target: [number, number, number];
  delay: number;
  color: string;
  maxOpacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<Line2>(null);

  const delta: [number, number, number] = [
    target[0] - origin[0],
    target[1] - origin[1],
    target[2] - origin[2],
  ];

  useFrame(({ clock }) => {
    const progress = bootProgress(
      clock.getElapsedTime(),
      delay,
      BOOT_LINK_DURATION,
    );
    groupRef.current?.scale.setScalar(Math.max(progress, 0.0001));
    if (lineRef.current) {
      lineRef.current.material.opacity = maxOpacity * (progress > 0 ? 1 : 0);
    }
  });

  return (
    <group ref={groupRef} position={origin} scale={0.0001}>
      <Line
        ref={lineRef}
        points={[
          [0, 0, 0],
          delta,
        ]}
        color={color}
        lineWidth={1}
        transparent
        opacity={0}
      />
    </group>
  );
}

// Onderlinge verbinding die pas ná het ontwaken van de nodes infadet
function FadingLine({
  start,
  end,
  palette,
}: {
  start: [number, number, number];
  end: [number, number, number];
  palette: ScenePalette;
}) {
  const lineRef = useRef<Line2>(null);

  useFrame(({ clock }) => {
    const progress = bootProgress(
      clock.getElapsedTime(),
      BOOT_MESH_LINE_START,
      0.5,
    );
    if (lineRef.current) {
      lineRef.current.material.opacity = palette.meshLineOpacity * progress;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={palette.line}
      lineWidth={1}
      transparent
      opacity={0}
    />
  );
}

// Klein glowing bolletje dat langs een verbinding reist (lineaire interpolatie
// tussen de eindpunten; fade aan de uiteinden zodat het niet abrupt spawnt)
function DataPulse({
  start,
  end,
  color,
  speed,
  phase,
  size,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed: number;
  phase: number;
  size: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const startVector = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVector = useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const appear = bootProgress(elapsed, BOOT_PULSE_START, 0.6);
    const progress = (elapsed * speed + phase) % 1;
    meshRef.current?.position.lerpVectors(startVector, endVector, progress);
    if (materialRef.current) {
      const edgeFade = Math.min(1, Math.min(progress, 1 - progress) * 6);
      materialRef.current.opacity = appear * edgeFade * 0.9;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

function CameraDrift() {
  useFrame(({ camera, clock }) => {
    // Trage sinusoïdale drift — bewust géén OrbitControls of user-input.
    // Amplitudes zijn dezelfde constanten als in de safe-zone-berekening.
    const elapsed = clock.getElapsedTime();
    camera.position.x = Math.sin(elapsed * 0.12) * DRIFT_X;
    camera.position.y = Math.cos(elapsed * 0.09) * DRIFT_Y;
    camera.position.z = CAMERA_BASE_Z + Math.sin(elapsed * 0.07) * DRIFT_Z;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// Het volledige netwerk, gepositioneerd via de safe-zone-layout
function NetworkScene({ palette }: { palette: ScenePalette }) {
  const layout = useNodeLayout();
  const corePosition = layout.get(CORE_ID)!;
  const pulseColors: Record<PulseConfig["tone"], string> = {
    activity: palette.activity,
    live: palette.live,
    ai: palette.ai,
  };

  return (
    <group>
      <CoreNode position={corePosition} palette={palette} />
      {/* Kern-verbindingen groeien gestaffeld vanuit de kern naar elke node */}
      {NODES.map((node, index) => (
        <GrowingLine
          key={`core-${node.id}`}
          origin={corePosition}
          target={layout.get(node.id)!}
          delay={BOOT_LINK_START + index * BOOT_LINK_STAGGER}
          color={palette.activity}
          maxOpacity={palette.coreLineOpacity}
        />
      ))}
      {/* Nodes ontwaken één voor één na de verbindingen */}
      {NODES.map((node, index) => (
        <ArchitectureNode
          key={node.id}
          node={node}
          position={layout.get(node.id)!}
          bootDelay={BOOT_NODE_START + index * BOOT_NODE_STAGGER}
          palette={palette}
        />
      ))}
      {/* Onderlinge verbindingen faden daarna subtiel in */}
      {CONNECTIONS.map(([fromId, toId]) => (
        <FadingLine
          key={`${fromId}-${toId}`}
          start={layout.get(fromId)!}
          end={layout.get(toId)!}
          palette={palette}
        />
      ))}
      {/* Continu reizende datapulsen (2 kleuren/snelheden) */}
      {PULSES.map((pulse, index) => (
        <DataPulse
          key={`pulse-${index}`}
          start={layout.get(pulse.from)!}
          end={layout.get(pulse.to)!}
          color={pulseColors[pulse.tone]}
          speed={pulse.speed}
          phase={pulse.phase}
          size={pulse.size}
        />
      ))}
    </group>
  );
}

// Ambient 3D-visualisatie van de LOWI-architectuur (achtergrond van de hero).
export default function ArchitectureScene() {
  const { theme } = useTheme();
  const palette = SCENE_PALETTES[theme];

  return (
    <div className={styles.sceneCanvasWrapper}>
      <Canvas
        camera={{ position: [0, 0, CAMERA_BASE_Z], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[palette.background]} />
        <ambientLight intensity={palette.ambientIntensity} />
        <pointLight
          position={[4, 4, 6]}
          intensity={palette.pointLightIntensity}
          color={palette.pointLight}
        />
        <CameraDrift />
        <NetworkScene palette={palette} />
        <EffectComposer>
          {/* Subtiele bloom zodat de emissive bollen zacht gloeien */}
          <Bloom
            intensity={palette.bloomIntensity}
            luminanceThreshold={palette.bloomThreshold}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
