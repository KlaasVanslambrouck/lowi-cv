import type { AgentTool } from "@/lib/biotech-case/types";
import styles from "./Research.module.css";

interface AgentToolchainProps {
  tools: AgentTool[];
  activeTool?: string;
  compact?: boolean;
}

export default function AgentToolchain({ tools, activeTool, compact = false }: AgentToolchainProps) {
  return (
    <div className={`${styles.toolchain} ${compact ? styles.toolchainCompact : ""}`}>
      <div className={styles.toolchainHeading}>
        <span>Tool orchestration</span>
        <small>Conceptual connections</small>
      </div>
      <div className={styles.toolList}>
        {tools.map((tool) => (
          <span key={tool.id} className={`${styles.tool} ${activeTool === tool.name ? styles.toolActive : ""}`}>
            <i className={styles[`toolStatus_${tool.status}`]} aria-hidden="true" />
            <strong>{tool.name}</strong>
            <small>{tool.category.replace("-", " ")}</small>
          </span>
        ))}
      </div>
      <p className={styles.toolLegend}><span><i className={styles.toolStatus_mock} /> simulated</span><span><i className={styles.toolStatus_future} /> future integration</span></p>
    </div>
  );
}
