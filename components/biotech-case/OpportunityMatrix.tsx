"use client";

import { useMemo, useState } from "react";
import { domains, opportunities } from "@/lib/biotech-case/opportunities";
import {
  calculateSuitability,
  scoresFromOpportunity,
} from "@/lib/biotech-case/scoring";
import type {
  AgentOpportunity,
  DomainId,
  OpportunityScores,
  PrototypeStatus,
} from "@/lib/biotech-case/types";
import EvidenceBadge from "./EvidenceBadge";
import styles from "./BiotechPlayground.module.css";

interface OpportunityMatrixProps {
  selectedOpportunityId: string;
  onSelectOpportunity: (id: string) => void;
  onDesignPilot: (id: string) => void;
}

interface Filters {
  portfolio: "all" | "research" | "life-sciences";
  domain: DomainId | "all";
  exposure: "all" | "lower" | "moderate" | "high";
  data: "all" | "ready" | "emerging";
  status: PrototypeStatus | "all";
  horizon: "all" | "fast" | "longer";
}

const initialFilters: Filters = {
  portfolio: "all",
  domain: "all",
  exposure: "all",
  data: "all",
  status: "all",
  horizon: "all",
};

const scoreControls: Array<{
  key: keyof OpportunityScores;
  label: string;
  polarity: "positive" | "risk";
}> = [
  { key: "value", label: "Business value", polarity: "positive" },
  { key: "feasibility", label: "Feasibility", polarity: "positive" },
  { key: "dataReadiness", label: "Data readiness", polarity: "positive" },
  { key: "regulatoryExposure", label: "Regulatory exposure", polarity: "risk" },
  { key: "humanOversight", label: "Human oversight", polarity: "positive" },
  { key: "decisionCriticality", label: "Decision criticality", polarity: "risk" },
  { key: "timeToValue", label: "Time-to-value", polarity: "positive" },
];

function passesFilters(opportunity: AgentOpportunity, filters: Filters) {
  if (filters.portfolio === "research" && !opportunity.researchFocused) return false;
  if (filters.portfolio === "life-sciences" && opportunity.researchFocused) return false;
  if (filters.domain !== "all" && opportunity.domain !== filters.domain) return false;
  if (filters.status !== "all" && opportunity.status !== filters.status) return false;
  if (filters.exposure === "lower" && opportunity.regulatoryExposure > 4) return false;
  if (filters.exposure === "moderate" && (opportunity.regulatoryExposure < 5 || opportunity.regulatoryExposure > 7)) return false;
  if (filters.exposure === "high" && opportunity.regulatoryExposure < 8) return false;
  if (filters.data === "ready" && opportunity.dataReadiness < 7) return false;
  if (filters.data === "emerging" && opportunity.dataReadiness >= 7) return false;
  if (filters.horizon === "fast" && opportunity.timeToValue < 7) return false;
  if (filters.horizon === "longer" && opportunity.timeToValue >= 7) return false;
  return true;
}

export default function OpportunityMatrix({
  selectedOpportunityId,
  onSelectOpportunity,
  onDesignPilot,
}: OpportunityMatrixProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, OpportunityScores>>({});
  const selected = opportunities.find((item) => item.id === selectedOpportunityId) ?? opportunities[0];
  const scores = scoreOverrides[selected.id] ?? scoresFromOpportunity(selected);
  const suitability = calculateSuitability(scores);
  const visibleOpportunities = useMemo(
    () => opportunities.filter((opportunity) => passesFilters(opportunity, filters)),
    [filters],
  );

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className={styles.evaluateWorkspace} aria-labelledby="evaluate-title">
      <div className={styles.sectionHeadingRow}>
        <div>
          <p className={styles.kicker}>Evaluate / opportunity portfolio</p>
          <h2 id="evaluate-title" className={styles.sectionTitle}>Exciting is not the same as pilot-ready.</h2>
        </div>
        <div className={styles.exploratoryLabel}><span>ƒ</span> Exploratory prioritisation model</div>
      </div>

      <div className={styles.filterBar} aria-label="Opportunity filters">
        <label>
          <span>Portfolio</span>
          <select value={filters.portfolio} onChange={(event) => updateFilter("portfolio", event.target.value as Filters["portfolio"])}>
            <option value="all">All opportunities</option><option value="research">Scientific research</option><option value="life-sciences">Clinical + operations</option>
          </select>
        </label>
        <label>
          <span>Domain</span>
          <select value={filters.domain} onChange={(event) => updateFilter("domain", event.target.value as Filters["domain"])}>
            <option value="all">All domains</option>
            {domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.shortLabel}</option>)}
          </select>
        </label>
        <label>
          <span>Regulatory exposure</span>
          <select value={filters.exposure} onChange={(event) => updateFilter("exposure", event.target.value as Filters["exposure"])}>
            <option value="all">Any exposure</option><option value="lower">Lower · 1–4</option><option value="moderate">Moderate · 5–7</option><option value="high">High · 8–10</option>
          </select>
        </label>
        <label>
          <span>Data readiness</span>
          <select value={filters.data} onChange={(event) => updateFilter("data", event.target.value as Filters["data"])}>
            <option value="all">Any readiness</option><option value="ready">Ready · 7+</option><option value="emerging">Emerging · &lt;7</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value as Filters["status"])}>
            <option value="all">Prototype + concept</option><option value="prototype">Prototype</option><option value="concept">Concept</option>
          </select>
        </label>
        <label>
          <span>Time-to-value</span>
          <select value={filters.horizon} onChange={(event) => updateFilter("horizon", event.target.value as Filters["horizon"])}>
            <option value="all">Any horizon</option><option value="fast">Faster · 7+</option><option value="longer">Longer · &lt;7</option>
          </select>
        </label>
        <button type="button" className={styles.resetFilters} onClick={() => setFilters(initialFilters)}>Reset</button>
      </div>

      <div className={styles.matrixLayout}>
        <div className={styles.matrixColumn}>
          <div className={styles.matrixTopLabel}>Higher business value</div>
          <div className={styles.matrixWrap}>
            <span className={styles.yAxisLabel}>Business value</span>
            <div className={styles.matrixPlot}>
              <span className={styles.matrixQuadrantLabel} style={{ top: "1rem", right: "1rem" }}>Pilot candidates</span>
              <span className={styles.matrixQuadrantLabel} style={{ top: "1rem", left: "1rem" }}>Strategic bets</span>
              <span className={styles.matrixQuadrantLabel} style={{ bottom: "1rem", right: "1rem" }}>Quick utilities</span>
              <span className={styles.matrixQuadrantLabel} style={{ bottom: "1rem", left: "1rem" }}>Park / learn</span>
              {visibleOpportunities.map((opportunity) => {
                const pointScores = scoreOverrides[opportunity.id] ?? scoresFromOpportunity(opportunity);
                const active = opportunity.id === selected.id;
                return (
                  <button
                    key={opportunity.id}
                    type="button"
                    className={`${styles.matrixPoint} ${active ? styles.matrixPointActive : ""} ${opportunity.status === "prototype" ? styles.matrixPointPrototype : ""}`}
                    style={{
                      left: `${8 + ((pointScores.feasibility - 1) / 9) * 84}%`,
                      bottom: `${8 + ((pointScores.value - 1) / 9) * 84}%`,
                    }}
                    onClick={() => onSelectOpportunity(opportunity.id)}
                    aria-label={`${opportunity.name}, value ${pointScores.value}, feasibility ${pointScores.feasibility}`}
                    aria-pressed={active}
                  >
                    <span>{opportunity.name.split(" ").map((word) => word[0]).join("").slice(0, 3)}</span>
                    <small>{opportunity.name}</small>
                  </button>
                );
              })}
            </div>
            <span className={styles.xAxisLabel}>Implementation feasibility →</span>
          </div>
          <div className={styles.matrixLegend}>
            <span><i className={styles.legendPrototype} />Interactive prototype</span>
            <span><i />Concept</span>
            <strong>{visibleOpportunities.length} / {opportunities.length} shown</strong>
          </div>

          <div className={styles.matrixMobileList}>
            {visibleOpportunities.map((opportunity) => (
              <button key={opportunity.id} type="button" className={opportunity.id === selected.id ? styles.matrixMobileActive : ""} onClick={() => onSelectOpportunity(opportunity.id)}>
                <span><strong>{opportunity.name}</strong><small>{opportunity.domain.replace("-", " ")} · {opportunity.agentPattern}</small></span>
                <span className={styles.mobileScores}><strong>V {opportunity.value}</strong><strong>F {opportunity.feasibility}</strong></span>
              </button>
            ))}
          </div>
        </div>

        <aside className={styles.scoringPanel} aria-label={`${selected.name} scoring controls`}>
          <div className={styles.scoringHeader}>
            <div className={styles.badgeRow}><span className={styles.patternBadge}>{selected.agentPattern}</span><EvidenceBadge type={selected.evidenceType} /></div>
            <h3>{selected.name}</h3>
            <p>{selected.problem}</p>
          </div>

          <div className={styles.suitabilityCard}>
            <div className={styles.suitabilityScore}><strong>{suitability.score}</strong><span>/ 100</span></div>
            <div><span>Agent suitability</span><strong>{suitability.score >= 76 ? "Strong pilot candidate" : suitability.score >= 58 ? "Validate assumptions" : "Build readiness first"}</strong></div>
          </div>

          <div className={styles.sliderList}>
            {scoreControls.map((control) => (
              <label key={control.key} className={styles.sliderControl}>
                <span><span>{control.label}<small>{control.polarity === "risk" ? "risk modifier" : "positive factor"}</small></span><strong>{scores[control.key]}</strong></span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={scores[control.key]}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setScoreOverrides((current) => ({
                      ...current,
                      [selected.id]: { ...scores, [control.key]: value },
                    }));
                  }}
                  aria-label={control.label}
                />
              </label>
            ))}
          </div>

          <dl className={styles.recommendationGrid}>
            <div><dt>Operating model</dt><dd>{selected.researchProfile?.operatingModel ?? suitability.operatingModel}</dd></div>
            <div><dt>Pilot scope</dt><dd>{suitability.pilotScope}</dd></div>
            <div><dt>Indicative horizon</dt><dd>{suitability.horizon}</dd></div>
          </dl>

          {selected.researchProfile ? (
            <section className={styles.researchScorecard}>
              <div><span>Research-specific lens</span><strong>Scientific workflow fit</strong></div>
              {([
                ["Research leverage", selected.researchProfile.researchLeverage],
                ["Workflow repeatability", selected.researchProfile.workflowRepeatability],
                ["Data accessibility", selected.researchProfile.dataAccessibility],
                ["Tool integration", selected.researchProfile.toolIntegration],
                ["Scientific judgement", selected.researchProfile.scientificJudgement],
                ["Evidence traceability", selected.researchProfile.evidenceTraceability],
                ["Reproducibility benefit", selected.researchProfile.reproducibilityBenefit],
              ] as const).map(([label, value]) => (
                <p key={label}><span>{label}</span><strong>{value >= 9 ? (label === "Evidence traceability" ? "Critical" : "Very high") : value >= 7 ? "High" : value >= 5 ? "Medium" : "Low"}</strong></p>
              ))}
            </section>
          ) : null}

          <details className={styles.formulaDetails}>
            <summary>How is this calculated?</summary>
            <p>Value, feasibility, data readiness, time-to-value and explicit human oversight add weight. Regulatory exposure and decision criticality subtract risk, partly offset by strong oversight.</p>
            <div><span>Positive contribution</span><strong>+{suitability.positiveContribution}</strong></div>
            <div><span>Risk modifier</span><strong>−{suitability.riskModifier}</strong></div>
            <small>This is a transparent conversation aid, not a validated scientific model.</small>
          </details>

          <button type="button" className={styles.primaryButton} onClick={() => onDesignPilot(selected.id)}>Design pilot <span>→</span></button>
        </aside>
      </div>
    </section>
  );
}
