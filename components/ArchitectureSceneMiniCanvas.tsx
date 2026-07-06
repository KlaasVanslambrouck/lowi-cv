"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import styles from "@/styles/cv.module.css";

const COLOR_BONE = "#EDE7DC";
const COLOR_COPPER = "#B8763E";

// Het netwerk "gesplitst in clusters": interface (links), platform-kern
// (midden, met koperen kernpunt), data (rechts). Bewust zonder labels en
// zonder bloom — dit is een lichte, decoratieve brug-scene.
interface MiniCluster {
  center: [number, number, number];
  points: Array<[number, number, number]>; // offsets t.o.v. het cluster-centrum
  hasCore?: boolean;
  floatPhase: number; // faseverschuiving voor de idle-float
}

const CLUSTERS: MiniCluster[] = [
  {
    // interface-cluster: next-js + mobile
    center: [-2.4, 0.15, 0],
    points: [
      [-0.35, 0.3, 0.1],
      [0.3, -0.35, -0.2],
    ],
    floatPhase: 0,
  },
  {
    // platform-cluster: railway + jarvis rond de koperen kern
    center: [0, -0.05, 0.2],
    points: [
      [-0.45, 0.4, -0.15],
      [0.5, 0.25, 0.15],
      [0.05, -0.5, -0.1],
    ],
    hasCore: true,
    floatPhase: 2.1,
  },
  {
    // data-cluster: supabase + databricks + pi
    center: [2.45, 0.1, -0.15],
    points: [
      [-0.4, 0.35, 0.1],
      [0.45, 0.15, -0.2],
      [0.05, -0.45, 0.15],
    ],
    floatPhase: 4.2,
  },
];

// Vage lijnen tussen de clusters (de "gesplitste" verbindingen)
const INTER_CLUSTER_LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
];

function MiniClusterGroup({ cluster }: { cluster: MiniCluster }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    // Subtiele idle-float per cluster, in fase verschoven
    const elapsed = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y =
        cluster.center[1] + Math.sin(elapsed * 0.5 + cluster.floatPhase) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={cluster.center}>
      {cluster.hasCore ? (
        <mesh>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial
            color={COLOR_COPPER}
            emissive={COLOR_COPPER}
            emissiveIntensity={1.1}
          />
        </mesh>
      ) : null}
      {cluster.points.map((offset, index) => (
        <group key={index}>
          <mesh position={offset}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color={COLOR_BONE}
              emissive={COLOR_BONE}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Lijntje van elk punt naar het cluster-centrum */}
          <Line
            points={[
              [0, 0, 0],
              offset,
            ]}
            color={COLOR_BONE}
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </group>
      ))}
    </group>
  );
}

function MiniCameraDrift() {
  useFrame(({ camera, clock }) => {
    const elapsed = clock.getElapsedTime();
    camera.position.x = Math.sin(elapsed * 0.09) * 0.35;
    camera.position.y = Math.cos(elapsed * 0.07) * 0.2;
    camera.position.z = 4.6;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ArchitectureSceneMiniCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 3, 4]} intensity={14} color={COLOR_BONE} />
      <MiniCameraDrift />
      {CLUSTERS.map((cluster, index) => (
        <MiniClusterGroup key={index} cluster={cluster} />
      ))}
      {INTER_CLUSTER_LINKS.map(([fromIndex, toIndex]) => (
        <Line
          key={`${fromIndex}-${toIndex}`}
          points={[CLUSTERS[fromIndex].center, CLUSTERS[toIndex].center]}
          color={COLOR_COPPER}
          lineWidth={1}
          transparent
          opacity={0.16}
          dashed
          dashSize={0.12}
          gapSize={0.1}
        />
      ))}
    </Canvas>
  );
}
