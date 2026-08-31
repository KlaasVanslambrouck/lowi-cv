"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/hooks/useTheme";
import type { LabStation } from "@/lib/biotech-case/experiment/experiment-types";
import styles from "./Experiment.module.css";

interface LabSceneProps {
  activeStation: LabStation;
  issueActive: boolean;
  experimentActive: boolean;
  rescueIncluded: boolean;
}

const STATION_POSITIONS: Record<LabStation, [number, number, number]> = {
  overview: [0, 0.4, 0],
  workstation: [-3.2, 0.65, -2.15],
  bench: [0, 0.65, 0],
  incubator: [3.15, 0.85, -2.1],
  microscope: [3.1, 0.7, 1.8],
  storage: [-3.1, 0.55, 1.85],
};

const CAMERA_POSITIONS: Record<LabStation, [number, number, number]> = {
  overview: [8.1, 7.2, 9.5],
  workstation: [2.1, 4.4, 5.3],
  bench: [5.5, 4.6, 6.3],
  incubator: [7.7, 4.6, 3.8],
  microscope: [7.4, 4.3, 7.1],
  storage: [2.1, 4.1, 7.4],
};

function CameraRig({ station }: { station: LabStation }) {
  const lookAt = useRef(new THREE.Vector3(...STATION_POSITIONS.overview));
  const desired = useMemo(() => new THREE.Vector3(...CAMERA_POSITIONS[station]), [station]);
  const target = useMemo(() => new THREE.Vector3(...STATION_POSITIONS[station]), [station]);

  useFrame(({ camera, pointer }, delta) => {
    const ease = 1 - Math.exp(-delta * 2.4);
    const withParallax = desired.clone().add(new THREE.Vector3(pointer.x * 0.12, pointer.y * 0.07, 0));
    camera.position.lerp(withParallax, ease);
    lookAt.current.lerp(target, ease);
    camera.lookAt(lookAt.current);
  });
  return null;
}

function ActiveMarker({ station, active, issue = false }: { station: LabStation; active: LabStation; issue?: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const isActive = station === active;
  const position = STATION_POSITIONS[station];
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.08;
    ring.current.scale.setScalar(isActive ? pulse : 0.82);
  });
  return (
    <mesh ref={ring} position={[position[0], 0.035, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.66, 0.7, 48]} />
      <meshBasicMaterial color={issue ? "#d46b58" : "#c98245"} transparent opacity={isActive ? 0.85 : 0.08} />
    </mesh>
  );
}

function Workstation({ active }: { active: boolean }) {
  const screen = active ? "#669cff" : "#26314b";
  return (
    <group position={STATION_POSITIONS.workstation}>
      <mesh position={[0, 0.25, 0]}><boxGeometry args={[2.45, 0.14, 1.05]} /><meshStandardMaterial color="#d8d2c8" roughness={0.55} metalness={0.12} /></mesh>
      {[-0.92, 0.92].map((x) => <mesh key={x} position={[x, -0.45, 0]}><boxGeometry args={[0.11, 1.35, 0.11]} /><meshStandardMaterial color="#787b82" metalness={0.65} roughness={0.35} /></mesh>)}
      {[-0.55, 0.42].map((x, index) => (
        <group key={x} position={[x, 0.92, -0.12]} rotation={[0, index === 0 ? 0.07 : -0.07, 0]}>
          <mesh><boxGeometry args={[0.92, 0.62, 0.09]} /><meshStandardMaterial color="#20232d" roughness={0.3} /></mesh>
          <mesh position={[0, 0, 0.051]}><planeGeometry args={[0.78, 0.48]} /><meshStandardMaterial color={screen} emissive={screen} emissiveIntensity={active ? 0.42 : 0.08} /></mesh>
          <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.04, 0.04, 0.32, 12]} /><meshStandardMaterial color="#70737a" metalness={0.7} /></mesh>
        </group>
      ))}
      <mesh position={[0.65, 0.39, 0.2]} rotation={[0, 0.05, 0]}><boxGeometry args={[0.58, 0.035, 0.24]} /><meshStandardMaterial color="#2d3039" /></mesh>
    </group>
  );
}

function ExperimentPlate({ issue, active, visible, rescueIncluded }: { issue: boolean; active: boolean; visible: boolean; rescueIncluded: boolean }) {
  const plate = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!plate.current || !visible) return;
    plate.current.position.y = 1.02 + Math.sin(clock.elapsedTime * 1.3) * (active ? 0.025 : 0.008);
  });
  if (!visible) return null;
  return (
    <group ref={plate} position={[0.15, 1.02, 0.08]}>
      <mesh><boxGeometry args={[1.22, 0.09, 0.82]} /><meshPhysicalMaterial color="#ebe5da" transparent opacity={0.78} roughness={0.18} transmission={0.08} /></mesh>
      {Array.from({ length: 24 }, (_, index) => {
        const column = index % 6;
        const row = Math.floor(index / 6);
        const rescueWell = rescueIncluded && column === 5;
        const color = issue ? "#a95a51" : rescueWell ? "#9878ff" : "#669cff";
        return (
          <mesh key={index} position={[-0.48 + column * 0.19, 0.075, -0.28 + row * 0.19]}>
            <cylinderGeometry args={[0.058, 0.058, 0.045, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.25 : 0.06} transparent opacity={0.72} />
          </mesh>
        );
      })}
    </group>
  );
}

function WetLabBench({ active, issue, experimentActive, rescueIncluded }: { active: boolean; issue: boolean; experimentActive: boolean; rescueIncluded: boolean }) {
  return (
    <group position={STATION_POSITIONS.bench}>
      <mesh position={[0, 0.36, 0]}><boxGeometry args={[2.9, 0.18, 1.45]} /><meshStandardMaterial color="#dcd6cc" roughness={0.48} metalness={0.12} /></mesh>
      {[-1.18, 1.18].flatMap((x) => [-0.5, 0.5].map((z) => <mesh key={`${x}-${z}`} position={[x, -0.35, z]}><boxGeometry args={[0.12, 1.3, 0.12]} /><meshStandardMaterial color="#767980" metalness={0.65} /></mesh>))}
      <ExperimentPlate issue={issue} active={active} visible={experimentActive} rescueIncluded={rescueIncluded} />
      <group position={[-0.9, 0.78, 0.18]}>
        <mesh><boxGeometry args={[0.7, 0.13, 0.48]} /><meshStandardMaterial color="#353841" /></mesh>
        {Array.from({ length: 6 }, (_, index) => (
          <mesh key={index} position={[-0.23 + (index % 3) * 0.23, 0.22, -0.11 + Math.floor(index / 3) * 0.22]}>
            <cylinderGeometry args={[0.052, 0.042, 0.38, 12]} />
            <meshPhysicalMaterial color={index % 2 ? "#9878ff" : "#669cff"} transparent opacity={0.68} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {[-0.35, 0, 0.35].map((x, index) => (
        <group key={x} position={[x, 0.86, -0.5]} rotation={[0, 0, -0.12 + index * 0.1]}>
          <mesh><cylinderGeometry args={[0.045, 0.055, 0.74, 12]} /><meshStandardMaterial color={index === 1 ? "#9878ff" : "#c98245"} /></mesh>
          <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.018, 0.025, 0.2, 10]} /><meshStandardMaterial color="#d8d2c8" /></mesh>
        </group>
      ))}
    </group>
  );
}

function Incubator({ active, experimentActive }: { active: boolean; experimentActive: boolean }) {
  return (
    <group position={STATION_POSITIONS.incubator}>
      <mesh position={[0, 0.65, 0]}><boxGeometry args={[1.55, 2.5, 1.25]} /><meshStandardMaterial color="#2c3039" metalness={0.25} roughness={0.38} /></mesh>
      <mesh position={[0, 0.65, 0.64]}><boxGeometry args={[1.34, 2.25, 0.06]} /><meshPhysicalMaterial color="#707985" transparent opacity={0.32} roughness={0.15} transmission={0.2} /></mesh>
      {[0.05, 0.55, 1.05].map((y, index) => (
        <group key={y}>
          <mesh position={[0, y, 0.38]}><boxGeometry args={[1.15, 0.035, 0.85]} /><meshStandardMaterial color="#878a8e" metalness={0.65} /></mesh>
          {experimentActive && index === 1 ? <mesh position={[0, y + 0.06, 0.38]}><boxGeometry args={[0.88, 0.07, 0.55]} /><meshStandardMaterial color="#d8d2c8" emissive={active ? "#669cff" : "#000000"} emissiveIntensity={0.18} /></mesh> : null}
        </group>
      ))}
      <mesh position={[0.45, 1.52, 0.69]}><planeGeometry args={[0.35, 0.17]} /><meshStandardMaterial color={active ? "#669cff" : "#29364c"} emissive="#669cff" emissiveIntensity={active ? 0.35 : 0.05} /></mesh>
    </group>
  );
}

function Microscope({ active }: { active: boolean }) {
  return (
    <group position={STATION_POSITIONS.microscope}>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.8, 0.95, 0.18, 32]} /><meshStandardMaterial color="#292c34" metalness={0.3} roughness={0.38} /></mesh>
      <mesh position={[0, 0.58, 0]} rotation={[0, 0, -0.28]}><cylinderGeometry args={[0.18, 0.26, 1.25, 20]} /><meshStandardMaterial color="#d4cec4" /></mesh>
      <mesh position={[-0.2, 1.2, 0]} rotation={[0, 0, -0.28]}><cylinderGeometry args={[0.23, 0.18, 0.52, 20]} /><meshStandardMaterial color="#292c34" /></mesh>
      <mesh position={[0.12, 0.62, 0.28]}><boxGeometry args={[0.82, 0.08, 0.66]} /><meshStandardMaterial color="#686b72" metalness={0.6} /></mesh>
      <mesh position={[0.1, 0.82, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={active ? "#9878ff" : "#4b4560"} emissive="#9878ff" emissiveIntensity={active ? 0.45 : 0.04} /></mesh>
    </group>
  );
}

function SampleStorage({ active }: { active: boolean }) {
  return (
    <group position={STATION_POSITIONS.storage}>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[2, 0.22, 1.08]} /><meshStandardMaterial color="#3c4049" metalness={0.35} /></mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const x = -0.72 + (index % 4) * 0.48;
        const z = -0.28 + Math.floor(index / 4) * 0.3;
        return (
          <group key={index} position={[x, 0.55, z]}>
            <mesh><cylinderGeometry args={[0.08, 0.065, 0.55, 14]} /><meshPhysicalMaterial color={index % 3 === 0 ? "#9878ff" : "#aab8c6"} transparent opacity={0.62} /></mesh>
            <mesh position={[0, 0.31, 0]}><cylinderGeometry args={[0.09, 0.09, 0.08, 14]} /><meshStandardMaterial color={active ? "#c98245" : "#5e6067"} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

function Lab({ activeStation, issueActive, experimentActive, rescueIncluded }: LabSceneProps) {
  return (
    <>
      <CameraRig station={activeStation} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[5, 9, 6]} intensity={2.4} color="#fff3df" />
      <pointLight position={[-4, 4, -3]} intensity={1.1} color="#87aef6" />
      <pointLight position={[4, 3, 2]} intensity={0.7} color="#c4adff" />
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[9.4, 0.32, 7.3]} />
        <meshStandardMaterial color="#c9c5bd" roughness={0.72} />
      </mesh>
      <gridHelper args={[8.8, 18, "#9b9995", "#9b9995"]} position={[0, -0.54, 0]} />
      <mesh position={[0, 1.15, -3.46]}><boxGeometry args={[9.4, 3.7, 0.14]} /><meshStandardMaterial color="#d8d4cc" roughness={0.8} /></mesh>
      <mesh position={[-4.63, 1.15, 0]}><boxGeometry args={[0.14, 3.7, 7]} /><meshStandardMaterial color="#d3cfc7" roughness={0.8} /></mesh>
      <Workstation active={activeStation === "workstation"} />
      <WetLabBench active={activeStation === "bench"} issue={issueActive} experimentActive={experimentActive} rescueIncluded={rescueIncluded} />
      <Incubator active={activeStation === "incubator"} experimentActive={experimentActive} />
      <Microscope active={activeStation === "microscope"} />
      <SampleStorage active={activeStation === "storage"} />
      {(["workstation", "bench", "incubator", "microscope", "storage"] as LabStation[]).map((station) => (
        <ActiveMarker key={station} station={station} active={activeStation} issue={issueActive && station === "bench"} />
      ))}
    </>
  );
}

export default function LabScene(props: LabSceneProps) {
  const { theme } = useTheme();
  return (
    <div className={styles.canvasWrap} aria-label="Interactive 3D laboratory diorama">
      <Canvas
        camera={{ position: CAMERA_POSITIONS.overview, fov: 36, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[theme === "dark" ? "#11131a" : "#e9e5dd"]} />
        <fog attach="fog" args={[theme === "dark" ? "#11131a" : "#e9e5dd", 12, 24]} />
        <Lab {...props} />
      </Canvas>
    </div>
  );
}
