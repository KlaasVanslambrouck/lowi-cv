type FlowBoxTone = "quiet" | "ai" | "human" | "success" | "phase";

interface FlowBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  lines: readonly string[];
  tone?: FlowBoxTone;
}

interface DecisionProps {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  lines: readonly string[];
}

interface FlowPathProps {
  path: string;
  markerId: string;
  dashed?: boolean;
}

interface EscalationPathProps {
  path: string;
  markerId: string;
}

const SVG_STYLES = `
  .oplossingDesktop,
  .oplossingMobile {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .oplossingDesktop {
    display: block;
  }

  .oplossingMobile {
    display: none;
  }

  .oplossingFrame {
    fill: var(--cv-surface);
    stroke: var(--cv-border);
  }

  .oplossingPanel {
    fill: rgb(var(--cv-bg-rgb) / 0.3);
    stroke: var(--cv-border);
  }

  .oplossingKicker,
  .oplossingLaneLabel,
  .oplossingNodeTitle,
  .oplossingDecisionText,
  .oplossingPathLabel,
  .oplossingBadgeText {
    font-family: var(--cv-font-mono);
  }

  .oplossingTitle,
  .oplossingLaneSummary,
  .oplossingNodeDetail {
    font-family: var(--cv-font-sans);
  }

  .oplossingKicker {
    fill: var(--cv-copper-soft);
    font-size: 15px;
    font-weight: 650;
    letter-spacing: 2px;
  }

  .oplossingTitle {
    fill: var(--cv-text);
    font-size: 28px;
    font-weight: 650;
  }

  .oplossingLaneLabel {
    fill: var(--cv-text);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 1.1px;
  }

  .oplossingLaneSummary {
    fill: var(--cv-muted);
    font-size: 14px;
  }

  .oplossingBox {
    stroke-width: 1.5;
  }

  .oplossingBoxQuiet {
    fill: var(--cv-surface-raised);
    stroke: var(--cv-border);
  }

  .oplossingBoxAi {
    fill: rgb(var(--cv-violet-rgb) / 0.1);
    stroke: rgb(var(--cv-violet-rgb) / 0.68);
  }

  .oplossingBoxHuman {
    fill: rgb(var(--cv-copper-rgb) / 0.15);
    stroke: var(--cv-copper);
    stroke-width: 3;
  }

  .oplossingBoxSuccess {
    fill: rgb(var(--cv-blue-rgb) / 0.12);
    stroke: var(--cv-blue);
    stroke-width: 2;
  }

  .oplossingBoxPhase {
    fill: rgb(var(--cv-violet-rgb) / 0.13);
    stroke: var(--cv-violet);
    stroke-width: 2;
  }

  .oplossingNodeTitle {
    fill: var(--cv-text);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.45px;
  }

  .oplossingNodeDetail {
    fill: var(--cv-text-soft);
    font-size: 13px;
  }

  .oplossingDecision {
    fill: var(--cv-surface-raised);
    stroke: rgb(var(--cv-text-rgb) / 0.46);
    stroke-width: 2;
  }

  .oplossingDecisionText {
    fill: var(--cv-text);
    font-size: 13px;
    font-weight: 650;
  }

  .oplossingMerge {
    fill: var(--cv-surface);
    stroke: var(--cv-text-soft);
    stroke-width: 2;
  }

  .oplossingFlowPath {
    fill: none;
    stroke: var(--cv-muted);
    stroke-width: 2;
    opacity: 0.72;
  }

  .oplossingFlowPathDashed {
    stroke-dasharray: 7 7;
  }

  .oplossingEscalationGlow {
    fill: none;
    stroke: var(--cv-copper);
    stroke-width: 10;
    opacity: 0.12;
  }

  .oplossingEscalationPath {
    fill: none;
    stroke: var(--cv-copper);
    stroke-width: 4;
  }

  .oplossingPathLabel {
    fill: var(--cv-muted);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.7px;
  }

  .oplossingPathLabelEscalation {
    fill: var(--cv-copper-soft);
  }

  .oplossingBadge {
    fill: var(--cv-copper);
  }

  .oplossingBadgeText {
    fill: var(--cv-bg);
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.6px;
  }

  .oplossingHumanRailDivider {
    stroke: rgb(var(--cv-copper-rgb) / 0.45);
    stroke-width: 1;
  }

  @media (max-width: 640px) {
    .oplossingDesktop {
      display: none;
    }

    .oplossingMobile {
      display: block;
    }

    .oplossingKicker {
      font-size: 18px;
    }

    .oplossingTitle {
      font-size: 29px;
    }

    .oplossingLaneLabel {
      font-size: 21px;
    }

    .oplossingLaneSummary {
      font-size: 17px;
    }

    .oplossingNodeTitle {
      font-size: 18px;
    }

    .oplossingNodeDetail,
    .oplossingDecisionText,
    .oplossingPathLabel,
    .oplossingBadgeText {
      font-size: 16px;
    }
  }
`;

function getToneClass(tone: FlowBoxTone): string {
  if (tone === "ai") return "oplossingBoxAi";
  if (tone === "human") return "oplossingBoxHuman";
  if (tone === "success") return "oplossingBoxSuccess";
  if (tone === "phase") return "oplossingBoxPhase";
  return "oplossingBoxQuiet";
}

function FlowBox({
  x,
  y,
  width,
  height,
  title,
  lines,
  tone = "quiet",
}: FlowBoxProps) {
  const centerX = x + width / 2;
  const detailStartY = y + 57;

  return (
    <g>
      <rect
        className={`oplossingBox ${getToneClass(tone)}`}
        x={x}
        y={y}
        width={width}
        height={height}
        rx="12"
      />
      <text
        className="oplossingNodeTitle"
        x={centerX}
        y={y + 31}
        textAnchor="middle"
      >
        {title}
      </text>
      <text
        className="oplossingNodeDetail"
        x={centerX}
        y={detailStartY}
        textAnchor="middle"
      >
        {lines.map((line, index) => (
          <tspan key={line} x={centerX} dy={index === 0 ? 0 : 19}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function Decision({
  centerX,
  centerY,
  width,
  height,
  lines,
}: DecisionProps) {
  const points = [
    `${centerX},${centerY - height / 2}`,
    `${centerX + width / 2},${centerY}`,
    `${centerX},${centerY + height / 2}`,
    `${centerX - width / 2},${centerY}`,
  ].join(" ");
  const textStartY = centerY - ((lines.length - 1) * 18) / 2;

  return (
    <g>
      <polygon className="oplossingDecision" points={points} />
      <text
        className="oplossingDecisionText"
        x={centerX}
        y={textStartY}
        textAnchor="middle"
      >
        {lines.map((line, index) => (
          <tspan key={line} x={centerX} dy={index === 0 ? 0 : 18}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function FlowPath({ path, markerId, dashed = false }: FlowPathProps) {
  return (
    <path
      className={`oplossingFlowPath ${dashed ? "oplossingFlowPathDashed" : ""}`}
      d={path}
      markerEnd={`url(#${markerId})`}
    />
  );
}

function EscalationPath({ path, markerId }: EscalationPathProps) {
  return (
    <g>
      <path className="oplossingEscalationGlow" d={path} />
      <path
        className="oplossingEscalationPath"
        d={path}
        markerEnd={`url(#${markerId})`}
      />
    </g>
  );
}

function DiagramMarkers({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker
        id={`${prefix}-quiet-arrow`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cv-muted)" />
      </marker>
      <marker
        id={`${prefix}-escalation-arrow`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cv-copper)" />
      </marker>
    </defs>
  );
}

function DesktopDiagram() {
  const quietMarkerId = "oplossing-desktop-quiet-arrow";
  const escalationMarkerId = "oplossing-desktop-escalation-arrow";

  return (
    <svg
      className="oplossingDesktop"
      viewBox="0 0 1320 890"
      role="img"
      aria-labelledby="oplossing-desktop-title oplossing-desktop-description"
    >
      <title id="oplossing-desktop-title">Oplossingsschema Linguix</title>
      <desc id="oplossing-desktop-description">
        Architectuurschema met een spoor voor schrijven en een spoor voor
        spreken. Dikke koperkleurige paden tonen wanneer een beoordeling naar
        een mens of derde beoordelaar escaleert.
      </desc>
      <style>{SVG_STYLES}</style>
      <DiagramMarkers prefix="oplossing-desktop" />

      <rect
        className="oplossingFrame"
        x="1"
        y="1"
        width="1318"
        height="888"
        rx="18"
      />
      <text className="oplossingKicker" x="34" y="42">
        TWEE SPOREN · ÉÉN PRINCIPE
      </text>
      <text className="oplossingTitle" x="34" y="76">
        Menselijk toezicht is de architectuur.
      </text>

      <rect
        className="oplossingPanel"
        x="24"
        y="100"
        width="1272"
        height="450"
        rx="15"
      />
      <text className="oplossingLaneLabel" x="48" y="136">
        SPOOR A · SCHRIJVEN
      </text>
      <text className="oplossingLaneSummary" x="48" y="159">
        AI en mens beoordelen; onzekerheid verlaat automatisch de gewone stroom.
      </text>

      <FlowPath
        path="M 215 259 H 235 V 218 H 255"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 215 259 H 235 V 338 H 255"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 460 218 H 480 V 263 H 491"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 460 338 H 480 V 263 H 491"
        markerId={quietMarkerId}
      />
      <FlowPath path="M 501 263 H 505" markerId={quietMarkerId} />
      <FlowPath path="M 695 263 H 715" markerId={quietMarkerId} />
      <FlowPath path="M 895 263 H 925" markerId={quietMarkerId} />
      <FlowPath path="M 1105 263 H 1140" markerId={quietMarkerId} />

      <EscalationPath
        path="M 600 321 V 405 Q 600 420 615 420"
        markerId={escalationMarkerId}
      />
      <EscalationPath
        path="M 805 321 V 458 Q 805 472 791 472 H 745"
        markerId={escalationMarkerId}
      />
      <EscalationPath
        path="M 1015 321 V 405 Q 1015 420 1030 420"
        markerId={escalationMarkerId}
      />

      <text className="oplossingPathLabel" x="701" y="251">
        NEE
      </text>
      <text className="oplossingPathLabel" x="901" y="251">
        JA
      </text>
      <text className="oplossingPathLabel" x="1117" y="251">
        JA
      </text>
      <text
        className="oplossingPathLabel oplossingPathLabelEscalation"
        x="612"
        y="350"
      >
        JA · ESCALATIE
      </text>
      <text
        className="oplossingPathLabel oplossingPathLabelEscalation"
        x="816"
        y="350"
      >
        NEE · ESCALATIE
      </text>
      <text
        className="oplossingPathLabel oplossingPathLabelEscalation"
        x="1027"
        y="350"
      >
        NEE · DISCREPANTIE
      </text>

      <FlowBox
        x={50}
        y={212}
        width={165}
        height={94}
        title="KANDIDAATTEKST"
        lines={["digitaal of", "gescand papier"]}
      />
      <FlowBox
        x={255}
        y={168}
        width={205}
        height={100}
        title="AI SCOORT"
        lines={["per criterium", "met bewijsspans"]}
        tone="ai"
      />
      <FlowBox
        x={255}
        y={286}
        width={205}
        height={105}
        title="MENS SCOORT"
        lines={["onafhankelijk (fase 1–2)", "of reviewt AI (fase 2+)"]}
      />
      <circle className="oplossingMerge" cx="496" cy="263" r="6" />

      <Decision
        centerX={600}
        centerY={263}
        width={190}
        height={116}
        lines={["Lage confidence", "of score rond", "de slaaggrens?"]}
      />
      <Decision
        centerX={805}
        centerY={263}
        width={180}
        height={116}
        lines={["Binnen het", "gekalibreerde", "profiel?"]}
      />
      <Decision
        centerX={1015}
        centerY={263}
        width={180}
        height={116}
        lines={["Consensus +", "hoge confidence?"]}
      />

      <FlowBox
        x={1140}
        y={220}
        width={135}
        height={86}
        title="SCORE VAST"
        lines={["veilig resultaat"]}
        tone="success"
      />
      <FlowBox
        x={510}
        y={420}
        width={235}
        height={94}
        title="ALTIJD MENSELIJK"
        lines={["lage confidence, grensgeval", "of buiten profiel"]}
        tone="human"
      />
      <FlowBox
        x={920}
        y={420}
        width={250}
        height={94}
        title="DERDE BEOORDELAAR"
        lines={["arbitreert discrepantie", "tussen AI en mens"]}
        tone="human"
      />

      <rect
        className="oplossingPanel"
        x="24"
        y="570"
        width="1272"
        height="292"
        rx="15"
      />
      <text className="oplossingLaneLabel" x="48" y="606">
        SPOOR B · SPREKEN
      </text>
      <text className="oplossingLaneSummary" x="48" y="629">
        Eerst de afname automatiseren; het oordeel blijft aantoonbaar menselijk.
      </text>

      <FlowPath path="M 310 714 H 355" markerId={quietMarkerId} />
      <FlowPath path="M 615 714 H 680" markerId={quietMarkerId} />
      <FlowPath
        path="M 940 714 H 1005"
        markerId={quietMarkerId}
        dashed
      />
      <text className="oplossingPathLabel" x="951" y="700">
        BEWIJS-GATE
      </text>

      <FlowBox
        x={50}
        y={654}
        width={260}
        height={120}
        title="AI-AGENT NEEMT AF"
        lines={["vast protocol + artikel 50", "blijft op taak", "stuurt afwijkingen terug"]}
        tone="ai"
      />
      <FlowBox
        x={355}
        y={654}
        width={260}
        height={120}
        title="CONTROLEERBAAR DOSSIER"
        lines={["opname + transcript", "tijdgestempelde", "observaties"]}
      />
      <FlowBox
        x={680}
        y={640}
        width={260}
        height={148}
        title="FASE 3 · MENS BEOORDEELT"
        lines={["mens beoordeelt dossier", "AI neemt alleen af", "nul beoordelingsrisico"]}
        tone="human"
      />
      <FlowBox
        x={1005}
        y={640}
        width={260}
        height={148}
        title="FASE 4 · SELECTIEF"
        lines={["AI stelt score voor", "mens bevestigt", "of corrigeert"]}
        tone="phase"
      />
    </svg>
  );
}

function MobileHumanRail() {
  return (
    <g>
      <rect
        className="oplossingBox oplossingBoxHuman"
        x="430"
        y="535"
        width="205"
        height="300"
        rx="12"
      />
      <rect
        className="oplossingBadge"
        x="452"
        y="555"
        width="161"
        height="32"
        rx="16"
      />
      <text
        className="oplossingBadgeText"
        x="532.5"
        y="577"
        textAnchor="middle"
      >
        ALTIJD MENSELIJK
      </text>
      <text
        className="oplossingNodeDetail"
        x="452"
        y="626"
        textAnchor="start"
      >
        <tspan x="452">Lage confidence</tspan>
        <tspan x="452" dy="22">of score bij de</tspan>
        <tspan x="452" dy="22">slaaggrens</tspan>
      </text>
      <line
        className="oplossingHumanRailDivider"
        x1="452"
        x2="613"
        y1="704"
        y2="704"
      />
      <text
        className="oplossingNodeDetail"
        x="452"
        y="744"
        textAnchor="start"
      >
        <tspan x="452">Buiten het</tspan>
        <tspan x="452" dy="22">gekalibreerde</tspan>
        <tspan x="452" dy="22">profiel</tspan>
      </text>
    </g>
  );
}

function MobileDiagram() {
  const quietMarkerId = "oplossing-mobile-quiet-arrow";
  const escalationMarkerId = "oplossing-mobile-escalation-arrow";

  return (
    <svg
      className="oplossingMobile"
      viewBox="0 0 680 1760"
      role="img"
      aria-labelledby="oplossing-mobile-title oplossing-mobile-description"
    >
      <title id="oplossing-mobile-title">Oplossingsschema Linguix</title>
      <desc id="oplossing-mobile-description">
        Architectuurschema met een spoor voor schrijven en een spoor voor
        spreken. Dikke koperkleurige paden tonen wanneer een beoordeling naar
        een mens of derde beoordelaar escaleert.
      </desc>
      <style>{SVG_STYLES}</style>
      <DiagramMarkers prefix="oplossing-mobile" />

      <rect
        className="oplossingFrame"
        x="1"
        y="1"
        width="678"
        height="1758"
        rx="18"
      />
      <text className="oplossingKicker" x="30" y="43">
        TWEE SPOREN · ÉÉN PRINCIPE
      </text>
      <text className="oplossingTitle" x="30" y="80">
        Menselijk toezicht
      </text>
      <text className="oplossingTitle" x="30" y="114">
        is de architectuur.
      </text>

      <rect
        className="oplossingPanel"
        x="18"
        y="138"
        width="644"
        height="1050"
        rx="15"
      />
      <text className="oplossingLaneLabel" x="40" y="177">
        SPOOR A · SCHRIJVEN
      </text>
      <text className="oplossingLaneSummary" x="40" y="205">
        Onzekerheid verlaat de gewone stroom.
      </text>

      <FlowPath
        path="M 340 315 V 335 H 182 V 355"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 340 315 V 335 H 498 V 355"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 182 480 V 503 H 334"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 498 480 V 503 H 346"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 340 509 V 520 H 250 V 530"
        markerId={quietMarkerId}
      />
      <FlowPath path="M 250 650 V 715" markerId={quietMarkerId} />
      <FlowPath path="M 250 835 V 890" markerId={quietMarkerId} />
      <FlowPath path="M 250 1010 V 1060" markerId={quietMarkerId} />

      <EscalationPath
        path="M 380 590 H 430"
        markerId={escalationMarkerId}
      />
      <EscalationPath
        path="M 380 775 H 430"
        markerId={escalationMarkerId}
      />
      <EscalationPath
        path="M 380 950 H 430"
        markerId={escalationMarkerId}
      />

      <text className="oplossingPathLabel" x="264" y="687">
        NEE
      </text>
      <text className="oplossingPathLabel" x="264" y="870">
        JA
      </text>
      <text className="oplossingPathLabel" x="264" y="1042">
        JA
      </text>
      <text
        className="oplossingPathLabel oplossingPathLabelEscalation"
        x="392"
        y="577"
      >
        JA
      </text>
      <text
        className="oplossingPathLabel oplossingPathLabelEscalation"
        x="392"
        y="762"
      >
        NEE
      </text>
      <text
        className="oplossingPathLabel oplossingPathLabelEscalation"
        x="420"
        y="937"
        textAnchor="end"
      >
        NEE · DISCREPANTIE
      </text>

      <FlowBox
        x={60}
        y={235}
        width={560}
        height={80}
        title="KANDIDAATTEKST"
        lines={["digitaal of gescand van papier"]}
      />
      <FlowBox
        x={40}
        y={355}
        width={285}
        height={125}
        title="AI SCOORT"
        lines={["per criterium", "met bewijsspans"]}
        tone="ai"
      />
      <FlowBox
        x={355}
        y={355}
        width={285}
        height={125}
        title="MENS SCOORT"
        lines={["onafhankelijk", "of reviewt AI-score"]}
      />
      <circle className="oplossingMerge" cx="340" cy="503" r="7" />

      <Decision
        centerX={250}
        centerY={590}
        width={260}
        height={120}
        lines={["Lage confidence", "of score rond", "de slaaggrens?"]}
      />
      <Decision
        centerX={250}
        centerY={775}
        width={260}
        height={120}
        lines={["Binnen het", "gekalibreerde", "profiel?"]}
      />
      <Decision
        centerX={250}
        centerY={950}
        width={260}
        height={120}
        lines={["Consensus +", "hoge confidence?"]}
      />

      <MobileHumanRail />
      <FlowBox
        x={430}
        y={890}
        width={205}
        height={120}
        title="DERDE BEOORDELAAR"
        lines={["arbitreert", "AI ↔ mens"]}
        tone="human"
      />
      <FlowBox
        x={140}
        y={1060}
        width={220}
        height={90}
        title="SCORE STAAT VAST"
        lines={["consensus + hoge confidence"]}
        tone="success"
      />

      <rect
        className="oplossingPanel"
        x="18"
        y="1210"
        width="644"
        height="520"
        rx="15"
      />
      <text className="oplossingLaneLabel" x="40" y="1249">
        SPOOR B · SPREKEN
      </text>
      <text className="oplossingLaneSummary" x="40" y="1277">
        Automatiseer de afname, niet het oordeel.
      </text>

      <FlowPath path="M 340 1415 V 1450" markerId={quietMarkerId} />
      <FlowPath
        path="M 340 1555 V 1580 H 185 V 1600"
        markerId={quietMarkerId}
      />
      <FlowPath
        path="M 340 1555 V 1580 H 495 V 1600"
        markerId={quietMarkerId}
        dashed
      />
      <text
        className="oplossingPathLabel"
        x="635"
        y="1582"
        textAnchor="end"
      >
        LATER · BEWIJS-GATE
      </text>

      <FlowBox
        x={45}
        y={1300}
        width={590}
        height={115}
        title="AI-AGENT NEEMT AF"
        lines={["vast protocol · artikel 50 · blijft op taak"]}
        tone="ai"
      />
      <FlowBox
        x={45}
        y={1450}
        width={590}
        height={105}
        title="CONTROLEERBAAR DOSSIER"
        lines={["opname + transcript + tijdgestempelde observaties"]}
      />
      <FlowBox
        x={45}
        y={1600}
        width={280}
        height={105}
        title="FASE 3"
        lines={["mens beoordeelt", "AI neemt alleen af"]}
        tone="human"
      />
      <FlowBox
        x={355}
        y={1600}
        width={280}
        height={105}
        title="FASE 4"
        lines={["AI stelt voor", "mens bevestigt"]}
        tone="phase"
      />
    </svg>
  );
}

export default function OplossingSchema() {
  return (
    <figure style={{ width: "100%", margin: 0 }}>
      <DesktopDiagram />
      <MobileDiagram />
    </figure>
  );
}
