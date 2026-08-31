import EvidenceBadge from "./EvidenceBadge";
import { domains, opportunities } from "@/lib/biotech-case/opportunities";
import type { DomainId } from "@/lib/biotech-case/types";
import styles from "./BiotechPlayground.module.css";

interface LifeSciencesMapProps {
  selectedDomain: DomainId;
  onSelectDomain: (domain: DomainId) => void;
  selectedOpportunityId: string;
  onSelectOpportunity: (id: string) => void;
  onOpenAgent: (id: string) => void;
  onEvaluate: (id: string) => void;
}

function ScoreDial({ label, score }: { label: string; score: number }) {
  return (
    <span className={styles.scoreDial}>
      <span>{label}</span>
      <strong>{score}/10</strong>
    </span>
  );
}

export default function LifeSciencesMap({
  selectedDomain,
  onSelectDomain,
  selectedOpportunityId,
  onSelectOpportunity,
  onOpenAgent,
  onEvaluate,
}: LifeSciencesMapProps) {
  const domain = domains.find((item) => item.id === selectedDomain) ?? domains[0];
  const domainOpportunities = opportunities.filter(
    (opportunity) => opportunity.domain === selectedDomain,
  );
  const selectedOpportunity =
    domainOpportunities.find(
      (opportunity) => opportunity.id === selectedOpportunityId,
    ) ?? domainOpportunities[0];

  return (
    <section className={styles.exploreWorkspace} aria-labelledby="value-chain-title">
      <div className={styles.sectionHeadingRow}>
        <div>
          <p className={styles.kicker}>Explore / value chain</p>
          <h2 id="value-chain-title" className={styles.sectionTitle}>
            Start with the workflow, not the agent.
          </h2>
        </div>
        <p className={styles.sectionNote}>
          Select a domain to reveal friction, data and human decision points.
        </p>
      </div>

      <div className={styles.valueChain} role="group" aria-label="Life sciences value chain">
        <span className={styles.valueChainRail} aria-hidden="true" />
        {domains.map((item, index) => {
          const active = item.id === selectedDomain;
          const opportunityCount = opportunities.filter(
            (opportunity) => opportunity.domain === item.id,
          ).length;
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.domainNode} ${active ? styles.domainNodeActive : ""}`}
              onClick={() => onSelectDomain(item.id)}
              aria-pressed={active}
            >
              <span className={styles.domainIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.domainName}>{item.shortLabel}</span>
              <span className={styles.domainCount}>{opportunityCount} agents</span>
            </button>
          );
        })}
      </div>

      <div className={styles.domainWorkspace}>
        <article className={styles.domainBrief}>
          <div className={styles.domainBriefHeader}>
            <div>
              <p className={styles.panelLabel}>Selected domain</p>
              <h3>{domain.label}</h3>
              <p>{domain.descriptor}</p>
            </div>
            <span className={styles.domainSignal}>{domainOpportunities.length} opportunity signals</span>
          </div>

          <div className={styles.workflowChips} aria-label="Workflows">
            {domain.workflows.map((workflow) => (
              <span key={workflow}>{workflow}</span>
            ))}
          </div>

          <div className={styles.domainFacts}>
            <div>
              <span className={styles.factLabel}>High-value friction</span>
              <ul className={styles.frictionList}>
                {domain.frictions.map((friction) => (
                  <li key={friction}>{friction}</li>
                ))}
              </ul>
            </div>
            <div className={styles.domainFactStack}>
              <div>
                <span className={styles.factLabel}>Data characteristics</span>
                <p>{domain.dataCharacteristics}</p>
              </div>
              <div>
                <span className={styles.factLabel}>Human decision point</span>
                <p>{domain.humanDecision}</p>
              </div>
            </div>
          </div>
        </article>

        <div className={styles.opportunityRail} aria-label={`${domain.label} opportunities`}>
          <p className={styles.panelLabel}>Candidate agent patterns</p>
          {domainOpportunities.map((opportunity) => {
            const active = opportunity.id === selectedOpportunity.id;
            return (
              <button
                key={opportunity.id}
                type="button"
                className={`${styles.opportunityRow} ${active ? styles.opportunityRowActive : ""}`}
                onClick={() => onSelectOpportunity(opportunity.id)}
                aria-pressed={active}
              >
                <span>
                  <strong>{opportunity.name}</strong>
                  <small>{opportunity.agentPattern} · {opportunity.workflow}</small>
                </span>
                <span className={styles.rowArrow} aria-hidden="true">↗</span>
              </button>
            );
          })}
        </div>
      </div>

      <article className={styles.opportunityDetail} aria-live="polite">
        <div className={styles.opportunityDetailMain}>
          <div className={styles.badgeRow}>
            <span className={styles.patternBadge}>{selectedOpportunity.agentPattern}</span>
            <EvidenceBadge type={selectedOpportunity.evidenceType} />
            <span className={styles.statusBadge}>{selectedOpportunity.status}</span>
          </div>
          <h3>{selectedOpportunity.name}</h3>
          <p className={styles.opportunityProblem}>{selectedOpportunity.problem}</p>
          <p>{selectedOpportunity.description}</p>
        </div>
        <div className={styles.opportunityControls}>
          <div className={styles.scoreDials}>
            <ScoreDial label="Value" score={selectedOpportunity.value} />
            <ScoreDial label="Feasibility" score={selectedOpportunity.feasibility} />
            <ScoreDial label="Data" score={selectedOpportunity.dataReadiness} />
          </div>
          <div className={styles.humanRole}>
            <span className={styles.factLabel}>Human remains accountable</span>
            <p>{selectedOpportunity.humanRole}</p>
          </div>
          <div className={styles.detailActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => onOpenAgent(selectedOpportunity.id)}
            >
              {selectedOpportunity.status === "prototype" ? "Open prototype" : "Open concept"}
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => onEvaluate(selectedOpportunity.id)}
            >
              Evaluate fit
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
