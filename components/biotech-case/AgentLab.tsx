import { opportunities } from "@/lib/biotech-case/opportunities";
import ProtocolGuardian from "./ProtocolGuardian";
import DeviationInvestigator from "./DeviationInvestigator";
import EvidenceBadge from "./EvidenceBadge";
import BioinformaticsInvestigator from "./research/BioinformaticsInvestigator";
import ResearchConceptAgent from "./research/ResearchConceptAgent";
import ScientificInvestigator from "./research/ScientificInvestigator";
import styles from "./BiotechPlayground.module.css";

interface AgentLabProps {
  selectedOpportunityId: string;
  onSelectOpportunity: (id: string) => void;
  onDesignPilot: (id: string) => void;
}

const featuredIds = [
  "scientific-investigator",
  "bioinformatics-investigator",
  "lab-memory",
  "experiment-strategy",
  "imaging-investigator",
  "technology-scout",
  "protocol-guardian",
  "deviation-investigator",
];

const researchConceptIds = ["lab-memory", "experiment-strategy", "imaging-investigator", "technology-scout"];

export default function AgentLab({
  selectedOpportunityId,
  onSelectOpportunity,
  onDesignPilot,
}: AgentLabProps) {
  const selected = opportunities.find((item) => item.id === selectedOpportunityId) ?? opportunities[0];
  const prototypeIds = featuredIds.includes(selected.id)
    ? featuredIds
    : [selected.id, ...featuredIds];

  return (
    <section className={styles.labWorkspace} aria-labelledby="agent-lab-title">
      <div className={styles.sectionHeadingRow}>
        <div>
          <p className={styles.kicker}>Agent Lab / bounded prototypes</p>
          <h2 id="agent-lab-title" className={styles.sectionTitle}>Inspect the work, not a chatbot.</h2>
        </div>
        <p className={styles.sectionNote}>Each agent uses an interface shaped around its workflow and decision boundary.</p>
      </div>

      <div className={styles.agentSelector} role="tablist" aria-label="Agent prototypes">
        {prototypeIds.map((id) => {
          const agent = opportunities.find((item) => item.id === id);
          if (!agent) return null;
          const active = selected.id === id;
          return (
            <button
              key={id}
              type="button"
              className={`${styles.agentSelectorButton} ${active ? styles.agentSelectorButtonActive : ""}`}
              onClick={() => onSelectOpportunity(id)}
              role="tab"
              aria-selected={active}
            >
              <span className={styles.agentSelectorStatus}>{agent.status}</span>
              <strong>{agent.name}</strong>
              <small>{agent.domain.replace("-", " ")} · {agent.agentPattern}</small>
            </button>
          );
        })}
      </div>

      <article className={styles.agentMetaCard}>
        <div className={styles.agentIdentity}>
          <span className={styles.agentMonogram}>{selected.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>
          <div><span className={styles.panelLabel}>{selected.workflow}</span><h3>{selected.name}</h3></div>
        </div>
        <div className={styles.agentMetaGrid}>
          <span><small>Pattern</small><strong>{selected.agentPattern}</strong></span>
          <span><small>Oversight</small><strong>{selected.humanOversight}/10 · required</strong></span>
          <span><small>Data</small><strong>{selected.dataRequired}</strong></span>
          <span><small>Risk</small><strong>{selected.regulatoryExposure >= 8 ? "High" : selected.regulatoryExposure >= 5 ? "Moderate" : "Lower"}</strong></span>
          <span><small>Value</small><strong>{selected.value}/10</strong></span>
          <span><small>Status</small><strong>{selected.status}</strong></span>
        </div>
        <div className={styles.metaActions}>
          <EvidenceBadge type={selected.evidenceType} />
          <button type="button" className={styles.textButton} onClick={() => onDesignPilot(selected.id)}>Shape pilot →</button>
        </div>
      </article>

      {selected.id === "protocol-guardian" ? <ProtocolGuardian /> : null}
      {selected.id === "scientific-investigator" ? <ScientificInvestigator /> : null}
      {selected.id === "bioinformatics-investigator" ? <BioinformaticsInvestigator /> : null}
      {researchConceptIds.includes(selected.id) ? <ResearchConceptAgent id={selected.id} /> : null}
      {selected.id === "deviation-investigator" ? <DeviationInvestigator /> : null}
      {!featuredIds.includes(selected.id) ? (
        <div className={styles.conceptCanvas}>
          <div className={styles.conceptMap}>
            <span className={styles.conceptNode}>Defined inputs</span><span className={styles.conceptArrow}>→</span>
            <span className={`${styles.conceptNode} ${styles.conceptNodeAgent}`}>{selected.agentPattern}</span><span className={styles.conceptArrow}>→</span>
            <span className={styles.conceptNode}>Reviewable output</span><span className={styles.conceptArrow}>→</span>
            <span className={`${styles.conceptNode} ${styles.conceptNodeHuman}`}>Human decision</span>
          </div>
          <div className={styles.conceptBrief}>
            <span className={styles.panelLabel}>Concept boundary</span>
            <h3>{selected.description}</h3>
            <p><strong>Problem:</strong> {selected.problem}</p>
            <p><strong>Human role:</strong> {selected.humanRole}</p>
            <p><strong>Required data:</strong> {selected.dataRequired}</p>
            <button type="button" className={styles.primaryButton} onClick={() => onDesignPilot(selected.id)}>Design a bounded pilot <span>→</span></button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
