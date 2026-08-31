import type { ScientificProvenance } from "@/lib/biotech-case/research";
import ScientificOutputBadge from "./ScientificOutputBadge";
import styles from "./Research.module.css";

interface EvidenceTrailProps {
  title: string;
  claim: string;
  sources: ScientificProvenance[];
  onClose: () => void;
}

export default function EvidenceTrail({ title, claim, sources, onClose }: EvidenceTrailProps) {
  return (
    <div className={styles.provenanceLayer} role="presentation">
      <button type="button" className={styles.provenanceScrim} onClick={onClose} aria-label="Close provenance" />
      <aside className={styles.provenanceDrawer} role="dialog" aria-modal="true" aria-labelledby="provenance-title">
        <header>
          <div><span>Scientific provenance</span><h3 id="provenance-title">{title}</h3></div>
          <button type="button" onClick={onClose} aria-label="Close provenance">×</button>
        </header>
        <div className={styles.trailClaim}>
          <ScientificOutputBadge type="interpretation" />
          <p>{claim}</p>
        </div>
        <div className={styles.trailConnector}><span /> <small>based on</small></div>
        <ol className={styles.trailSources}>
          {sources.map((source, index) => (
            <li key={source.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{source.sourceType}</small><strong>{source.label}</strong><p>{source.source}</p><em>{source.note}</em></div>
            </li>
          ))}
        </ol>
        <div className={styles.provenanceNotice}><strong>Demonstration boundary</strong><p>All records in this workspace are realistic mock evidence. No real scientific citation or experimental claim is asserted.</p></div>
      </aside>
    </div>
  );
}
