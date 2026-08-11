interface PanelBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  detail?: string;
  tone?: "afgewezen" | "neutraal" | "ai" | "mens";
}

interface UitkomstRijProps {
  x: number;
  y: number;
  width: number;
  height: number;
  aanleiding: string;
  gevolg: string;
  escalatie?: boolean;
}

interface RandvoorwaardeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface HerkaderingProps {
  /**
   * Documentmodus toont de eigen kicker, titel en omkadering. In
   * presentatiemodus draagt de slide die kop al; het beeld laat ze weg en de
   * viewBox krimpt mee, zodat de vrijgekomen hoogte naar het diagram gaat.
   */
  toonKop?: boolean;
}

/**
 * De vier randvoorwaarden die de gekozen opzet oplost. Breedtes en posities
 * zijn met de hand uitgemeten op het monospace-lettertype van de tokens,
 * zodat de rij exact tot aan de rechterrand van het rechterpaneel doorloopt.
 */
const RANDVOORWAARDEN = [
  { label: "AI Act", x: 724, breedte: 74 },
  { label: "scepsis", x: 810, breedte: 80 },
  { label: "regionale centra", x: 902, breedte: 142 },
  { label: "diverse doelgroep", x: 1056, breedte: 156 },
] as const;

const RANDVOORWAARDEN_MOBIEL = [
  { label: "AI Act", x: 12, y: 1116, breedte: 68 },
  { label: "scepsis", x: 88, y: 1116, breedte: 74 },
  { label: "regionale centra", x: 170, y: 1116, breedte: 128 },
  { label: "diverse doelgroep", x: 12, y: 1152, breedte: 140 },
] as const;

/**
 * ViewBoxen per modus. Zonder kop begint het beeld bij de twee panelen; de
 * kicker en titel staan dan al op de slide en hun hoogte gaat naar het beeld.
 */
const DESKTOP_VIEWBOX = { met: "0 0 1240 740", zonder: "20 96 1200 620" } as const;
const MOBIEL_VIEWBOX = { met: "0 0 420 1200", zonder: "8 116 404 1070" } as const;

const SVG_STYLES = `
  .herkaderingDesktop,
  .herkaderingMobiel {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  /* Presentatiemodus: het beeld vult de rij en schaalt via de viewBox mee.
     Geen vaste pixelhoogte, dus ook geen scrollbalk. */
  .herkaderingVullend .herkaderingDesktop,
  .herkaderingVullend .herkaderingMobiel {
    height: 100%;
  }

  .herkaderingDesktop {
    display: block;
  }

  .herkaderingMobiel {
    display: none;
  }

  .herkaderingFrame {
    fill: var(--cv-surface);
    stroke: var(--cv-border);
  }

  .herkaderingKicker,
  .herkaderingPaneelTitel,
  .herkaderingBoxTitel,
  .herkaderingBadgeTekst,
  .herkaderingAanleiding,
  .herkaderingPilTekst,
  .herkaderingPilLabel {
    font-family: var(--cv-font-mono);
  }

  .herkaderingTitel,
  .herkaderingBoxDetail,
  .herkaderingGevolg {
    font-family: var(--cv-font-sans);
  }

  .herkaderingKicker {
    fill: var(--cv-copper-soft);
    font-size: 15px;
    font-weight: 650;
    letter-spacing: 2px;
  }

  .herkaderingTitel {
    fill: var(--cv-text);
    font-size: 28px;
    font-weight: 650;
  }

  /* Het paneelcontrast draagt de boodschap: links dof en dun, rechts vol en
     omkaderd. Wie alleen naar de vlakken kijkt, ziet de keuze al. */
  .herkaderingPaneelAfgewezen {
    fill: rgb(var(--cv-bg-rgb) / 0.55);
    stroke: var(--cv-border);
    stroke-width: 1;
  }

  .herkaderingPaneelGekozen {
    fill: rgb(var(--cv-copper-rgb) / 0.07);
    stroke: var(--cv-copper);
    stroke-width: 2.5;
  }

  .herkaderingAfgewezenInhoud {
    opacity: 0.44;
  }

  .herkaderingPaneelTitel {
    fill: var(--cv-text);
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 1.1px;
  }

  .herkaderingPaneelTitelDof {
    fill: var(--cv-muted);
  }

  .herkaderingBox {
    stroke-width: 1.5;
  }

  .herkaderingBoxAfgewezen {
    fill: var(--cv-surface-raised);
    stroke: var(--cv-muted);
    stroke-dasharray: 6 5;
  }

  .herkaderingBoxNeutraal {
    fill: var(--cv-surface-raised);
    stroke: var(--cv-border);
  }

  .herkaderingBoxAi {
    fill: rgb(var(--cv-violet-rgb) / 0.12);
    stroke: var(--cv-violet);
    stroke-width: 2;
  }

  .herkaderingBoxMens {
    fill: rgb(var(--cv-copper-rgb) / 0.15);
    stroke: var(--cv-copper);
    stroke-width: 2.5;
  }

  .herkaderingBoxTitel {
    fill: var(--cv-text);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.45px;
  }

  .herkaderingBoxDetail {
    fill: var(--cv-text-soft);
    font-size: 13px;
  }

  .herkaderingPad {
    fill: none;
    stroke: var(--cv-muted);
    stroke-width: 2;
    opacity: 0.72;
  }

  .herkaderingPadDof {
    stroke-width: 1.5;
    opacity: 0.5;
  }

  .herkaderingKnoop {
    fill: var(--cv-surface);
    stroke: var(--cv-text-soft);
    stroke-width: 2;
  }

  .herkaderingDoorhaling {
    stroke: var(--cv-muted);
    stroke-width: 3;
    opacity: 0.62;
  }

  .herkaderingBadgeAfgewezen {
    fill: none;
    stroke: var(--cv-muted);
    stroke-width: 1.5;
  }

  .herkaderingBadgeGekozen {
    fill: var(--cv-copper);
  }

  .herkaderingBadgeTekst {
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 1.1px;
  }

  .herkaderingBadgeTekstAfgewezen {
    fill: var(--cv-muted);
  }

  .herkaderingBadgeTekstGekozen {
    fill: var(--cv-bg);
  }

  .herkaderingUitkomst {
    fill: rgb(var(--cv-bg-rgb) / 0.45);
    stroke: var(--cv-border);
    stroke-width: 1;
  }

  .herkaderingUitkomstEscalatie {
    fill: rgb(var(--cv-copper-rgb) / 0.13);
    stroke: rgb(var(--cv-copper-rgb) / 0.62);
  }

  .herkaderingAanleiding {
    fill: var(--cv-blue);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.8px;
  }

  .herkaderingAanleidingEscalatie {
    fill: var(--cv-copper-soft);
  }

  .herkaderingGevolg {
    fill: var(--cv-text);
    font-size: 14px;
  }

  .herkaderingPilLabel {
    fill: var(--cv-muted);
    font-size: 13px;
    font-weight: 650;
    letter-spacing: 1.4px;
  }

  .herkaderingPil {
    fill: rgb(var(--cv-copper-rgb) / 0.1);
    stroke: rgb(var(--cv-copper-rgb) / 0.55);
    stroke-width: 1;
  }

  .herkaderingPilTekst {
    fill: var(--cv-text);
    font-size: 14px;
    font-weight: 650;
  }

  @media (max-width: 640px) {
    .herkaderingDesktop {
      display: none;
    }

    .herkaderingMobiel {
      display: block;
    }

    .herkaderingKicker {
      font-size: 15px;
    }

    .herkaderingTitel {
      font-size: 23px;
    }

    .herkaderingPaneelTitel {
      font-size: 14px;
    }

    .herkaderingPilTekst,
    .herkaderingPilLabel {
      font-size: 13px;
    }
  }
`;

function getToonKlasse(toon: PanelBoxProps["tone"]): string {
  if (toon === "afgewezen") return "herkaderingBoxAfgewezen";
  if (toon === "ai") return "herkaderingBoxAi";
  if (toon === "mens") return "herkaderingBoxMens";
  return "herkaderingBoxNeutraal";
}

function PanelBox({
  x,
  y,
  width,
  height,
  title,
  detail,
  tone = "neutraal",
}: PanelBoxProps) {
  const middenX = x + width / 2;
  const titelY = detail ? y + height / 2 - 4 : y + height / 2 + 5;

  return (
    <g>
      <rect
        className={`herkaderingBox ${getToonKlasse(tone)}`}
        x={x}
        y={y}
        width={width}
        height={height}
        rx="11"
      />
      <text className="herkaderingBoxTitel" x={middenX} y={titelY} textAnchor="middle">
        {title}
      </text>
      {detail ? (
        <text
          className="herkaderingBoxDetail"
          x={middenX}
          y={y + height / 2 + 17}
          textAnchor="middle"
        >
          {detail}
        </text>
      ) : null}
    </g>
  );
}

function UitkomstRij({
  x,
  y,
  width,
  height,
  aanleiding,
  gevolg,
  escalatie = false,
}: UitkomstRijProps) {
  return (
    <g>
      <rect
        className={`herkaderingUitkomst ${escalatie ? "herkaderingUitkomstEscalatie" : ""}`}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
      />
      <text x={x + 16} y={y + height / 2 + 5}>
        <tspan
          className={`herkaderingAanleiding ${escalatie ? "herkaderingAanleidingEscalatie" : ""}`}
        >
          {aanleiding}
        </tspan>
        <tspan className="herkaderingGevolg">{`  →  ${gevolg}`}</tspan>
      </text>
    </g>
  );
}

function Randvoorwaarde({ x, y, width, height, label }: RandvoorwaardeProps) {
  return (
    <g>
      <rect
        className="herkaderingPil"
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
      />
      <text
        className="herkaderingPilTekst"
        x={x + width / 2}
        y={y + height / 2 + 5}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

function PijlMarkers({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker
        id={`${prefix}-pijl`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cv-muted)" />
      </marker>
    </defs>
  );
}

function DesktopHerkadering({ toonKop }: { toonKop: boolean }) {
  const pijl = "url(#herkadering-desktop-pijl)";

  return (
    <svg
      className="herkaderingDesktop"
      viewBox={toonKop ? DESKTOP_VIEWBOX.met : DESKTOP_VIEWBOX.zonder}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="herkadering-desktop-titel herkadering-desktop-omschrijving"
    >
      <title id="herkadering-desktop-titel">
        Twee opzetten naast elkaar: AI eerst versus AI en mens parallel
      </title>
      <desc id="herkadering-desktop-omschrijving">
        Links het afgewezen model: kandidaat, AI beoordeelt, mens controleert
        een steekproef, besluit — één rechte keten, doorgestreept. Rechts het
        gekozen model: AI en mens beoordelen parallel, een vergelijking bepaalt
        de uitkomst, en twijfel escaleert naar een derde beoordelaar of naar
        een mens. Het gekozen model lost de AI Act, de scepsis, de rol van de
        regionale centra en de diverse doelgroep op.
      </desc>
      <style>{SVG_STYLES}</style>
      <PijlMarkers prefix="herkadering-desktop" />

      {toonKop ? (
        <>
          <rect
            className="herkaderingFrame"
            x="1"
            y="1"
            width="1238"
            height="738"
            rx="18"
          />
          <text className="herkaderingKicker" x="34" y="44">
            DE HERKADERING
          </text>
          <text className="herkaderingTitel" x="34" y="80">
            Niet de AI als eerste beoordelaar. Als tweede.
          </text>
        </>
      ) : null}

      {/* ── Links: het afgewezen model ─────────────────────────────────── */}
      <rect
        className="herkaderingPaneelAfgewezen"
        x="28"
        y="104"
        width="572"
        height="548"
        rx="15"
      />
      <g className="herkaderingAfgewezenInhoud">
        <rect
          className="herkaderingBadgeAfgewezen"
          x="52"
          y="126"
          width="132"
          height="28"
          rx="14"
        />
        <text
          className="herkaderingBadgeTekst herkaderingBadgeTekstAfgewezen"
          x="118"
          y="145"
          textAnchor="middle"
        >
          AFGEWEZEN
        </text>
        <text
          className="herkaderingPaneelTitel herkaderingPaneelTitelDof"
          x="52"
          y="190"
        >
          AI EERST, MENS CONTROLEERT
        </text>

        <path className="herkaderingPad herkaderingPadDof" d="M 314 286 V 330" markerEnd={pijl} />
        <path className="herkaderingPad herkaderingPadDof" d="M 314 384 V 428" markerEnd={pijl} />
        <path className="herkaderingPad herkaderingPadDof" d="M 314 482 V 526" markerEnd={pijl} />

        <PanelBox
          x={154}
          y={232}
          width={320}
          height={54}
          title="KANDIDAAT"
          tone="afgewezen"
        />
        <PanelBox
          x={154}
          y={330}
          width={320}
          height={54}
          title="AI BEOORDEELT"
          tone="afgewezen"
        />
        <PanelBox
          x={154}
          y={428}
          width={320}
          height={54}
          title="MENS CONTROLEERT"
          detail="steekproef"
          tone="afgewezen"
        />
        <PanelBox
          x={154}
          y={526}
          width={320}
          height={54}
          title="BESLUIT"
          tone="afgewezen"
        />
      </g>
      <line className="herkaderingDoorhaling" x1="46" y1="638" x2="582" y2="118" />

      {/* ── Rechts: het gekozen model ──────────────────────────────────── */}
      <rect
        className="herkaderingPaneelGekozen"
        x="640"
        y="104"
        width="572"
        height="548"
        rx="15"
      />
      <rect
        className="herkaderingBadgeGekozen"
        x="664"
        y="126"
        width="112"
        height="28"
        rx="14"
      />
      <text
        className="herkaderingBadgeTekst herkaderingBadgeTekstGekozen"
        x="720"
        y="145"
        textAnchor="middle"
      >
        GEKOZEN
      </text>
      <text className="herkaderingPaneelTitel" x="664" y="190">
        AI EN MENS PARALLEL, TWIJFEL ESCALEERT
      </text>

      <path className="herkaderingPad" d="M 926 268 V 288 H 781 V 306" markerEnd={pijl} />
      <path className="herkaderingPad" d="M 926 268 V 288 H 1071 V 306" markerEnd={pijl} />
      <path
        className="herkaderingPad"
        d="M 781 372 V 392 Q 781 404 793 404 H 918"
        markerEnd={pijl}
      />
      <path
        className="herkaderingPad"
        d="M 1071 372 V 392 Q 1071 404 1059 404 H 934"
        markerEnd={pijl}
      />
      <path className="herkaderingPad" d="M 926 412 V 428" markerEnd={pijl} />
      <path className="herkaderingPad" d="M 926 490 V 512" markerEnd={pijl} />

      <PanelBox
        x={806}
        y={216}
        width={240}
        height={52}
        title="KANDIDAAT"
      />
      <PanelBox
        x={666}
        y={306}
        width={230}
        height={66}
        title="AI BEOORDEELT"
        detail="per criterium"
        tone="ai"
      />
      <PanelBox
        x={956}
        y={306}
        width={230}
        height={66}
        title="MENS BEOORDEELT"
        detail="onafhankelijk"
        tone="mens"
      />
      <circle className="herkaderingKnoop" cx="926" cy="404" r="7" />
      <PanelBox
        x={826}
        y={428}
        width={200}
        height={62}
        title="VERGELIJKING"
        detail="AI ↔ mens"
      />

      <UitkomstRij
        x={676}
        y={512}
        width={500}
        height={34}
        aanleiding="CONSENSUS"
        gevolg="besluit"
      />
      <UitkomstRij
        x={676}
        y={554}
        width={500}
        height={34}
        aanleiding="DISCREPANTIE"
        gevolg="derde beoordelaar"
        escalatie
      />
      <UitkomstRij
        x={676}
        y={596}
        width={500}
        height={34}
        aanleiding="LAGE CONFIDENCE"
        gevolg="mens beslist"
        escalatie
      />

      {/* ── De randvoorwaarden die deze keuze oplost ───────────────────── */}
      <text className="herkaderingPilLabel" x="640" y="696">
        LOST OP
      </text>
      {RANDVOORWAARDEN.map((randvoorwaarde) => (
        <Randvoorwaarde
          key={randvoorwaarde.label}
          x={randvoorwaarde.x}
          y={676}
          width={randvoorwaarde.breedte}
          height={30}
          label={randvoorwaarde.label}
        />
      ))}
    </svg>
  );
}

function MobieleHerkadering({ toonKop }: { toonKop: boolean }) {
  const pijl = "url(#herkadering-mobiel-pijl)";

  return (
    <svg
      className="herkaderingMobiel"
      viewBox={toonKop ? MOBIEL_VIEWBOX.met : MOBIEL_VIEWBOX.zonder}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="herkadering-mobiel-titel herkadering-mobiel-omschrijving"
    >
      <title id="herkadering-mobiel-titel">
        Twee opzetten onder elkaar: AI eerst versus AI en mens parallel
      </title>
      <desc id="herkadering-mobiel-omschrijving">
        Boven het afgewezen model: kandidaat, AI beoordeelt, mens controleert
        een steekproef, besluit — één rechte keten, doorgestreept. Onder het
        gekozen model: AI en mens beoordelen parallel, een vergelijking bepaalt
        de uitkomst, en twijfel escaleert naar een derde beoordelaar of naar
        een mens.
      </desc>
      <style>{SVG_STYLES}</style>
      <PijlMarkers prefix="herkadering-mobiel" />

      {toonKop ? (
        <>
          <rect
            className="herkaderingFrame"
            x="1"
            y="1"
            width="418"
            height="1198"
            rx="16"
          />
          <text className="herkaderingKicker" x="20" y="38">
            DE HERKADERING
          </text>
          <text className="herkaderingTitel" x="20" y="72">
            Niet de AI eerst.
          </text>
          <text className="herkaderingTitel" x="20" y="98">
            AI als tweede.
          </text>
        </>
      ) : null}

      <rect
        className="herkaderingPaneelAfgewezen"
        x="12"
        y="120"
        width="396"
        height="440"
        rx="14"
      />
      <g className="herkaderingAfgewezenInhoud">
        <rect
          className="herkaderingBadgeAfgewezen"
          x="28"
          y="138"
          width="120"
          height="26"
          rx="13"
        />
        <text
          className="herkaderingBadgeTekst herkaderingBadgeTekstAfgewezen"
          x="88"
          y="156"
          textAnchor="middle"
        >
          AFGEWEZEN
        </text>
        <text
          className="herkaderingPaneelTitel herkaderingPaneelTitelDof"
          x="28"
          y="192"
        >
          AI EERST, MENS CONTROLEERT
        </text>

        <path className="herkaderingPad herkaderingPadDof" d="M 210 268 V 296" markerEnd={pijl} />
        <path className="herkaderingPad herkaderingPadDof" d="M 210 350 V 378" markerEnd={pijl} />
        <path className="herkaderingPad herkaderingPadDof" d="M 210 432 V 460" markerEnd={pijl} />

        <PanelBox x={70} y={214} width={280} height={54} title="KANDIDAAT" tone="afgewezen" />
        <PanelBox x={70} y={296} width={280} height={54} title="AI BEOORDEELT" tone="afgewezen" />
        <PanelBox
          x={70}
          y={378}
          width={280}
          height={54}
          title="MENS CONTROLEERT"
          detail="steekproef"
          tone="afgewezen"
        />
        <PanelBox x={70} y={460} width={280} height={54} title="BESLUIT" tone="afgewezen" />
      </g>
      <line className="herkaderingDoorhaling" x1="24" y1="548" x2="396" y2="132" />

      <rect
        className="herkaderingPaneelGekozen"
        x="12"
        y="584"
        width="396"
        height="486"
        rx="14"
      />
      <rect
        className="herkaderingBadgeGekozen"
        x="28"
        y="602"
        width="102"
        height="26"
        rx="13"
      />
      <text
        className="herkaderingBadgeTekst herkaderingBadgeTekstGekozen"
        x="79"
        y="620"
        textAnchor="middle"
      >
        GEKOZEN
      </text>
      <text className="herkaderingPaneelTitel" x="28" y="654">
        AI EN MENS PARALLEL,
      </text>
      <text className="herkaderingPaneelTitel" x="28" y="674">
        TWIJFEL ESCALEERT
      </text>

      <path className="herkaderingPad" d="M 210 740 V 758 H 115 V 776" markerEnd={pijl} />
      <path className="herkaderingPad" d="M 210 740 V 758 H 305 V 776" markerEnd={pijl} />
      <path
        className="herkaderingPad"
        d="M 115 832 V 850 Q 115 862 127 862 H 202"
        markerEnd={pijl}
      />
      <path
        className="herkaderingPad"
        d="M 305 832 V 850 Q 305 862 293 862 H 218"
        markerEnd={pijl}
      />
      <path className="herkaderingPad" d="M 210 869 V 884" markerEnd={pijl} />
      <path className="herkaderingPad" d="M 210 934 V 952" markerEnd={pijl} />

      <PanelBox x={115} y={690} width={190} height={50} title="KANDIDAAT" />
      <PanelBox
        x={26}
        y={776}
        width={178}
        height={56}
        title="AI SCOORT"
        detail="per criterium"
        tone="ai"
      />
      <PanelBox
        x={216}
        y={776}
        width={178}
        height={56}
        title="MENS SCOORT"
        detail="onafhankelijk"
        tone="mens"
      />
      <circle className="herkaderingKnoop" cx="210" cy="862" r="7" />
      <PanelBox x={115} y={884} width={190} height={50} title="VERGELIJKING" />

      <UitkomstRij
        x={28}
        y={952}
        width={364}
        height={32}
        aanleiding="CONSENSUS"
        gevolg="besluit"
      />
      <UitkomstRij
        x={28}
        y={988}
        width={364}
        height={32}
        aanleiding="DISCREPANTIE"
        gevolg="derde beoordelaar"
        escalatie
      />
      <UitkomstRij
        x={28}
        y={1024}
        width={364}
        height={32}
        aanleiding="LAGE CONFIDENCE"
        gevolg="mens beslist"
        escalatie
      />

      <text className="herkaderingPilLabel" x="12" y="1104">
        LOST OP
      </text>
      {RANDVOORWAARDEN_MOBIEL.map((randvoorwaarde) => (
        <Randvoorwaarde
          key={randvoorwaarde.label}
          x={randvoorwaarde.x}
          y={randvoorwaarde.y}
          width={randvoorwaarde.breedte}
          height={28}
          label={randvoorwaarde.label}
        />
      ))}
    </svg>
  );
}

/**
 * Blok 2 — de herkadering als beeld. Links de afgewezen opzet (AI eerst, mens
 * controleert een steekproef), rechts de gekozen opzet (AI en mens parallel,
 * twijfel escaleert). Het contrast zit in de vorm en het contrast van de
 * panelen, niet in de labels: één rechte keten tegenover een vertakking.
 */
export default function Herkadering({ toonKop = true }: HerkaderingProps) {
  return (
    <figure
      className={toonKop ? undefined : "herkaderingVullend"}
      style={{
        width: "100%",
        height: toonKop ? undefined : "100%",
        minHeight: 0,
        margin: 0,
      }}
    >
      <DesktopHerkadering toonKop={toonKop} />
      <MobieleHerkadering toonKop={toonKop} />
    </figure>
  );
}
