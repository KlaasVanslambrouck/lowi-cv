"use client";

import styles from "@/styles/cv.module.css";

// Lichte 2D/SVG-weergave van hetzelfde netwerk als ArchitectureScene:
// dezelfde 7 node-labels en dezelfde connecties, plus de centrale kern.
// Gebruikt bij prefers-reduced-motion (dan statisch — de globale
// reduced-motion-regel in globals.css schakelt alle keyframe-animaties uit),
// schermbreedte <768px en ontbrekende WebGL-support. Ook de loading-fallback
// terwijl de echte 3D-scene lazy laadt.

interface FallbackNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isJarvis?: boolean;
}

// 2D-projectie van de scene-layout (viewBox 0 0 800 420)
const FALLBACK_NODES: FallbackNode[] = [
  { id: "next-js", label: "next-js", x: 130, y: 110 },
  { id: "supabase", label: "supabase", x: 330, y: 95 },
  { id: "railway", label: "railway", x: 570, y: 105 },
  { id: "databricks", label: "databricks", x: 700, y: 220 },
  { id: "pi", label: "Raspberry Pi", x: 275, y: 300 },
  { id: "mobile", label: "mobile", x: 95, y: 250 },
  { id: "jarvis", label: "jarvis", x: 480, y: 280, isJarvis: true },
];

const FALLBACK_CORE = { id: "lowi", x: 400, y: 195 };

// Zelfde connecties als in de 3D-scene
const FALLBACK_CONNECTIONS: Array<[string, string]> = [
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

// Op deze lijnen reist een "lichtpuntje" via stroke-dashoffset.
// Bewust maar 2 lijnen: stroke-dashoffset triggert paint (geen compositor),
// meer lijnen drukt de mobiele Lighthouse-score. De animatie start bovendien
// pas na een delay (zie CSS), zodat hij de laad-fase niet belast.
const FLOW_LINES: Array<{
  from: string;
  to: string;
  tone: "activity" | "ai";
}> = [
  { from: "pi", to: "supabase", tone: "activity" },
  { from: "jarvis", to: "railway", tone: "ai" },
];

const NODE_LOOKUP = new Map(
  FALLBACK_NODES.map((node) => [node.id, node] as const),
);

function nodePoint(id: string): { x: number; y: number } {
  return id === FALLBACK_CORE.id ? FALLBACK_CORE : NODE_LOOKUP.get(id)!;
}

export default function ArchitectureSceneFallback() {
  return (
    // Puur decoratieve achtergrond, vandaar aria-hidden
    <div className={styles.sceneFallback} aria-hidden="true">
      <svg
        className={styles.sceneFallbackSvg}
        viewBox="0 0 800 420"
        // Netwerk bovenaan uitlijnen zodat het niet onder de hero-tekst schuift
        preserveAspectRatio="xMidYMin meet"
        role="presentation"
      >
        {/* Basisverbindingen */}
        {FALLBACK_CONNECTIONS.map(([fromId, toId]) => {
          const from = nodePoint(fromId);
          const to = nodePoint(toId);
          return (
            <line
              key={`${fromId}-${toId}`}
              className={styles.svgLine}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          );
        })}
        {/* Vage kern-verbindingen naar elke node */}
        {FALLBACK_NODES.map((node) => (
          <line
            key={`core-${node.id}`}
            className={styles.svgCoreLine}
            x1={FALLBACK_CORE.x}
            y1={FALLBACK_CORE.y}
            x2={node.x}
            y2={node.y}
          />
        ))}
        {/* Reizende lichtpuntjes over een selectie van lijnen */}
        {FLOW_LINES.map(({ from: fromId, to: toId, tone }) => {
          const from = nodePoint(fromId);
          const to = nodePoint(toId);
          return (
            <line
              key={`flow-${fromId}-${toId}`}
              className={
                tone === "ai" ? styles.svgFlowViolet : styles.svgFlowCopper
              }
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          );
        })}
        {/* Kern-node (koper, groter) */}
        <g className={styles.svgNodeGroup}>
          <circle
            className={styles.svgHaloViolet}
            cx={FALLBACK_CORE.x}
            cy={FALLBACK_CORE.y}
            r={22}
          />
          <circle
            className={styles.svgCoreNode}
            cx={FALLBACK_CORE.x}
            cy={FALLBACK_CORE.y}
            r={11}
          />
        </g>
        {/* Technologie-nodes met pulserende halo's */}
        {FALLBACK_NODES.map((node) => (
          <g key={node.id} className={styles.svgNodeGroup}>
            <circle
              className={
                node.isJarvis ? styles.svgHaloViolet : styles.svgHaloBone
              }
              cx={node.x}
              cy={node.y}
              r={node.isJarvis ? 18 : 13}
            />
            <circle
              className={node.isJarvis ? styles.svgNodeJarvis : styles.svgNode}
              cx={node.x}
              cy={node.y}
              r={node.isJarvis ? 8 : 5.5}
            />
            <text
              className={
                node.isJarvis ? styles.svgLabelJarvis : styles.svgLabel
              }
              x={node.x}
              y={node.y - (node.isJarvis ? 26 : 20)}
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
