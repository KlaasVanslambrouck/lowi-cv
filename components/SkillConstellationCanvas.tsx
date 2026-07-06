"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import { useTheme } from "@/app/cv/hooks/useTheme";
import type { Theme } from "@/app/cv/context/ThemeContext";
import type { SkillNode } from "@/types/content";
import styles from "@/styles/cv.module.css";

// Zelfde visuele taal als ArchitectureScene: bone bollen, koper voor
// actief/gehoverd. Geen bloom-postprocessing hier — deze scene moet licht
// blijven (de bloom zit alleen in de hero).
interface SkillScenePalette {
  infrastructure: string;
  activity: string;
  pointLight: string;
  ambientIntensity: number;
  pointLightIntensity: number;
  idleEmissive: number;
  neighborEmissive: number;
  activeEmissive: number;
}

const SKILL_SCENE_PALETTES: Record<Theme, SkillScenePalette> = {
  dark: {
    infrastructure: "#F1ECE2",
    activity: "#C98245",
    pointLight: "#F1ECE2",
    ambientIntensity: 0.45,
    pointLightIntensity: 20,
    idleEmissive: 0.35,
    neighborEmissive: 0.8,
    activeEmissive: 1.15,
  },
  light: {
    infrastructure: "#171820",
    activity: "#A95F2C",
    pointLight: "#FAF7F1",
    ambientIntensity: 0.85,
    pointLightIntensity: 8,
    idleEmissive: 0.03,
    neighborEmissive: 0.18,
    activeEmissive: 0.28,
  },
};

// Met de hand ontworpen clusters (bewust geen physics-simulatie):
// business-cluster links (Functional Analysis, Product), AI-kern in het
// midden met LLMs/Automation eromheen, Data/APIs als brug naar Systems
// Thinking rechts.
const SKILL_POSITIONS: Record<string, [number, number, number]> = {
  ai: [0, 0, 0],
  llms: [-1.05, 0.8, -0.3],
  automation: [-1.25, -0.7, 0.25],
  data: [1.15, 0.75, -0.35],
  apis: [1.5, -0.5, 0.3],
  "systems-thinking": [2.6, 0.1, -0.4],
  "functional-analysis": [-2.5, 0.35, 0.15],
  product: [-2.35, -0.85, -0.35],
};

// Nieuwe/onbekende skill-id's uit de content krijgen automatisch een plek
// op een cirkel, zodat contentwijzigingen de scene nooit breken
function positionForSkill(id: string, index: number): [number, number, number] {
  return (
    SKILL_POSITIONS[id] ?? [
      Math.cos(index * 1.1) * 2.2,
      Math.sin(index * 1.7) * 0.9,
      Math.sin(index * 0.9) * 0.4,
    ]
  );
}

interface SkillConstellationCanvasProps {
  nodes: SkillNode[];
  hoveredSkillId: string | null;
  onHover: (id: string | null) => void;
  reducedMotion: boolean;
}

// Adjacency-sleutel, richting-onafhankelijk
function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function SkillNodeMesh({
  node,
  position,
  highlight, // "hovered" | "neighbor" | "idle" | "dimmed"
  onHover,
  reducedMotion,
  palette,
}: {
  node: SkillNode;
  position: [number, number, number];
  highlight: "hovered" | "neighbor" | "idle" | "dimmed";
  onHover: (id: string | null) => void;
  reducedMotion: boolean;
  palette: SkillScenePalette;
}) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const targetColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const material = materialRef.current;
    if (!material) return;

    // Doelwaarden per highlight-status
    const isCopper = highlight === "hovered" || highlight === "neighbor";
    targetColor.set(isCopper ? palette.activity : palette.infrastructure);
    const targetOpacity = highlight === "dimmed" ? 0.22 : 1;
    const targetEmissive =
      highlight === "hovered"
        ? palette.activeEmissive
        : isCopper
          ? palette.neighborEmissive
          : palette.idleEmissive;

    if (reducedMotion) {
      // Reduced motion: statussen wisselen instant, zonder animated dim
      material.color.copy(targetColor);
      material.emissive.copy(targetColor);
      material.opacity = targetOpacity;
      material.emissiveIntensity = targetEmissive;
      return;
    }
    material.color.lerp(targetColor, 0.12);
    material.emissive.lerp(targetColor, 0.12);
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.12);
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetEmissive,
      0.12,
    );
  });

  const labelClass =
    highlight === "hovered" || highlight === "neighbor"
      ? `${styles.nodeLabel} ${styles.nodeLabelCopper}`
      : highlight === "dimmed"
        ? `${styles.nodeLabel} ${styles.nodeLabelDimmed}`
        : styles.nodeLabel;

  return (
    <group position={position}>
      <mesh
        // Scale i.p.v. geometry-args wijzigen: voorkomt geometry-rebuilds bij hover
        scale={highlight === "hovered" ? 1.2 : 1}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(node.id);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          onHover(null);
        }}
      >
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          ref={materialRef}
          color={palette.infrastructure}
          emissive={palette.infrastructure}
          emissiveIntensity={palette.idleEmissive}
          transparent
          opacity={1}
        />
      </mesh>
      <Html position={[0, 0.34, 0]} center style={{ pointerEvents: "none" }}>
        <span className={labelClass}>{node.name}</span>
      </Html>
    </group>
  );
}

function ConstellationLine({
  start,
  end,
  emphasized,
  dimmed,
  reducedMotion,
  palette,
}: {
  start: [number, number, number];
  end: [number, number, number];
  emphasized: boolean;
  dimmed: boolean;
  reducedMotion: boolean;
  palette: SkillScenePalette;
}) {
  const lineRef = useRef<Line2>(null);

  useFrame(() => {
    const material = lineRef.current?.material;
    if (!material) return;
    const targetOpacity = emphasized ? 0.75 : dimmed ? 0.06 : 0.25;
    material.opacity = reducedMotion
      ? targetOpacity
      : THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.12);
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={emphasized ? palette.activity : palette.infrastructure}
      lineWidth={1}
      transparent
      opacity={0.25}
    />
  );
}

function ConstellationCameraDrift({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame(({ camera, clock }) => {
    // Zelfde trage drift-taal als de hero-scene; statisch bij reduced motion
    if (reducedMotion) {
      camera.position.set(0, 0, 5.6);
      camera.lookAt(0, 0, 0);
      return;
    }
    const elapsed = clock.getElapsedTime();
    camera.position.x = Math.sin(elapsed * 0.1) * 0.45;
    camera.position.y = Math.cos(elapsed * 0.08) * 0.3;
    camera.position.z = 5.6 + Math.sin(elapsed * 0.06) * 0.25;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function SkillConstellationCanvas({
  nodes,
  hoveredSkillId,
  onHover,
  reducedMotion,
}: SkillConstellationCanvasProps) {
  const { theme } = useTheme();
  const palette = SKILL_SCENE_PALETTES[theme];

  // Posities en unieke edges één keer afleiden uit de content
  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    nodes.forEach((node, index) => {
      map.set(node.id, positionForSkill(node.id, index));
    });
    return map;
  }, [nodes]);

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<[string, string]> = [];
    nodes.forEach((node) => {
      node.connections.forEach((otherId) => {
        if (!positions.has(otherId)) return;
        const key = edgeKey(node.id, otherId);
        if (seen.has(key)) return;
        seen.add(key);
        list.push([node.id, otherId]);
      });
    });
    return list;
  }, [nodes, positions]);

  // Buren van de gehoverde node (voor oplichten/dimmen)
  const neighborIds = useMemo(() => {
    if (!hoveredSkillId) return new Set<string>();
    const neighbors = new Set<string>();
    edges.forEach(([a, b]) => {
      if (a === hoveredSkillId) neighbors.add(b);
      if (b === hoveredSkillId) neighbors.add(a);
    });
    return neighbors;
  }, [edges, hoveredSkillId]);

  return (
    <Canvas
      camera={{ position: [0, 0, 5.6], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={palette.ambientIntensity} />
      <pointLight
        position={[3, 3, 5]}
        intensity={palette.pointLightIntensity}
        color={palette.pointLight}
      />
      <ConstellationCameraDrift reducedMotion={reducedMotion} />
      {edges.map(([fromId, toId]) => {
        const touchesHover =
          hoveredSkillId !== null &&
          (fromId === hoveredSkillId || toId === hoveredSkillId);
        return (
          <ConstellationLine
            key={edgeKey(fromId, toId)}
            start={positions.get(fromId)!}
            end={positions.get(toId)!}
            emphasized={touchesHover}
            dimmed={hoveredSkillId !== null && !touchesHover}
            reducedMotion={reducedMotion}
            palette={palette}
          />
        );
      })}
      {nodes.map((node) => {
        const highlight =
          hoveredSkillId === null
            ? "idle"
            : node.id === hoveredSkillId
              ? "hovered"
              : neighborIds.has(node.id)
                ? "neighbor"
                : "dimmed";
        return (
          <SkillNodeMesh
            key={node.id}
            node={node}
            position={positions.get(node.id)!}
            highlight={highlight}
            onHover={onHover}
            reducedMotion={reducedMotion}
            palette={palette}
          />
        );
      })}
    </Canvas>
  );
}
