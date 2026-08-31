import type { LabStation } from "@/lib/biotech-case/experiment/experiment-types";
import styles from "./Experiment.module.css";

const points: Record<Exclude<LabStation, "overview">, { x: number; y: number; label: string }> = {
  workstation: { x: 177, y: 150, label: "Research" },
  bench: { x: 450, y: 270, label: "Wet lab" },
  incubator: { x: 718, y: 148, label: "Incubator" },
  microscope: { x: 710, y: 345, label: "Imaging" },
  storage: { x: 192, y: 360, label: "Samples" },
};

export default function LabSceneFallback({ activeStation, issueActive }: { activeStation: LabStation; issueActive: boolean }) {
  return (
    <div className={styles.fallbackScene} aria-label="Static isometric laboratory overview">
      <svg viewBox="0 0 900 520" role="img" aria-labelledby="fallback-lab-title">
        <title id="fallback-lab-title">A simplified biomedical lab with research, wet-lab, incubation, imaging and sample stations.</title>
        <defs>
          <linearGradient id="lab-floor" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--exp-floor-a)" />
            <stop offset="1" stopColor="var(--exp-floor-b)" />
          </linearGradient>
        </defs>
        <path className={styles.fallbackFloor} d="M450 35 850 245 450 485 50 245Z" />
        <path className={styles.fallbackGrid} d="M450 35v450M250 140l400 240M650 140 250 380M50 245h800" />

        <g className={activeStation === "workstation" ? styles.fallbackActive : ""}>
          <path className={styles.fallbackSurface} d="m82 190 170-88 110 58-170 90Z" />
          <path className={styles.fallbackDark} d="m134 151 60-31 55 29-60 32Z" />
          <path className={styles.fallbackScreen} d="m151 150 43-23 39 21-43 22Z" />
        </g>

        <g className={activeStation === "bench" ? styles.fallbackActive : ""}>
          <path className={styles.fallbackSurface} d="m330 264 167-88 130 69-169 91Z" />
          <path className={styles.fallbackPlate} d="m420 245 62-31 63 32-64 34Z" />
          {[0, 1, 2, 3].map((row) => [0, 1, 2, 3, 4, 5].map((column) => (
            <circle key={`${row}-${column}`} className={issueActive ? styles.fallbackWellIssue : styles.fallbackWell} cx={446 + column * 10 + row * 3} cy={235 + row * 8 - column * 5} r="2.6" />
          )))}
        </g>

        <g className={activeStation === "incubator" ? styles.fallbackActive : ""}>
          <path className={styles.fallbackDark} d="m655 92 104 54v118l-104 56-63-34V126Z" />
          <path className={styles.fallbackScreen} d="m612 141 27 14v18l-27-14Z" />
          <path className={styles.fallbackLine} d="m613 197 121 63M613 227l121 63" />
        </g>

        <g className={activeStation === "microscope" ? styles.fallbackActive : ""}>
          <ellipse className={styles.fallbackDark} cx="708" cy="359" rx="64" ry="34" />
          <path className={styles.fallbackSurface} d="m680 345 24-70 34 17-24 71Z" />
          <circle className={styles.fallbackLens} cx="709" cy="281" r="18" />
        </g>

        <g className={activeStation === "storage" ? styles.fallbackActive : ""}>
          <path className={styles.fallbackSurface} d="m108 337 100-52 100 53-101 54Z" />
          {[0, 1, 2, 3, 4].map((tube) => <circle key={tube} className={styles.fallbackTube} cx={170 + tube * 18} cy={337 - tube * 9} r="7" />)}
        </g>

        {Object.entries(points).map(([id, point]) => (
          <g key={id} className={`${styles.fallbackMarker} ${activeStation === id ? styles.fallbackMarkerActive : ""}`}>
            <circle cx={point.x} cy={point.y} r="5" />
            <text x={point.x + 11} y={point.y + 4}>{point.label}</text>
          </g>
        ))}
      </svg>
      <span className={styles.fallbackNote}>Simplified scene · scientific controls remain fully available</span>
    </div>
  );
}
