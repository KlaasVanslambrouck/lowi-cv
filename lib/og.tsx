import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { ogAltFor, ogSubtitleFor } from "@/content/role";
import { SITE_URL, localizedPath } from "@/lib/site";
import type { Bilingual, Language } from "@/types/content";

// Gedeelde bouwstenen voor de opengraph-image-routes (next/og, 1200×630).
// Draait enkel server-side tijdens de build: de routes zijn statisch.

type OgFonts = NonNullable<
  ConstructorParameters<typeof ImageResponse>[1]
>["fonts"];

// Kleuren: donker standaardthema uit app/globals.css (:root) en de
// achtergrond van de cel uit components/lowi-cel/celPalet.ts.
// next/og kan geen CSS-variabelen lezen — hou dit in sync bij paletwijzigingen.
export const OG_COLORS = {
  bg: "#101118",
  text: "#f1ece2",
  muted: "#9995a0",
  border: "rgba(241, 236, 226, 0.14)",
  copper: "#c98245",
  blue: "#669cff",
  violet: "#9878ff",
  lowiBg: "#05060a",
} as const;

export const OG_FONT = {
  serif: "Fraunces",
  sans: "DM Sans",
  mono: "DM Mono",
} as const;

export const SITE_HOST = new URL(SITE_URL).host;

// Statische TTF-instanties; herkomst en licentie in assets/fonts/README.md.
const FONT_DIR = join(process.cwd(), "assets", "fonts");

export async function loadOgFonts(): Promise<OgFonts> {
  const [fraunces, dmSans, dmMono] = await Promise.all([
    readFile(join(FONT_DIR, "Fraunces-Medium.ttf")),
    readFile(join(FONT_DIR, "DMSans-Regular.ttf")),
    readFile(join(FONT_DIR, "DMMono-Medium.ttf")),
  ]);

  // Gewichten zoals op de site: koppen 500, lopende tekst 400, labels 500.
  return [
    { name: OG_FONT.serif, data: fraunces, weight: 500, style: "normal" },
    { name: OG_FONT.sans, data: dmSans, weight: 400, style: "normal" },
    { name: OG_FONT.mono, data: dmMono, weight: 500, style: "normal" },
  ];
}

export interface MotifNode {
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;
  glow?: boolean;
}

interface NetworkMotifProps {
  width: number;
  height: number;
  nodes: readonly MotifNode[];
  links: readonly (readonly [string, string])[];
}

// Netwerkmotief in de geest van de hero-scene: koperen kern, blauwe
// dataflow-nodes, violet voor AI.
export function NetworkMotif({ width, height, nodes, links }: NetworkMotifProps) {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        {nodes
          .filter((node) => node.glow)
          .map((node) => (
            <radialGradient key={node.id} id={`glow-${node.id}`}>
              <stop offset="0%" stopColor={node.color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={node.color} stopOpacity={0} />
            </radialGradient>
          ))}
      </defs>
      {links.map(([from, to]) => {
        const a = byId.get(from);
        const b = byId.get(to);
        if (!a || !b) return null;
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={OG_COLORS.text}
            strokeOpacity={0.16}
            strokeWidth={1.5}
          />
        );
      })}
      {nodes.map((node) =>
        node.glow ? (
          <circle
            key={`halo-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.r * 4}
            fill={`url(#glow-${node.id})`}
          />
        ) : null,
      )}
      {nodes.map((node) => (
        <circle key={node.id} cx={node.x} cy={node.y} r={node.r} fill={node.color} />
      ))}
    </svg>
  );
}

interface CvOgCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
  motif: ReactNode;
}

// Kaart in het donkere standaardthema, gebruikt door "/" en "/nidus".
export function CvOgCard({ eyebrow, title, subtitle, footer, motif }: CvOgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: OG_COLORS.bg,
        color: OG_COLORS.text,
        fontFamily: OG_FONT.sans,
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, display: "flex" }}>
        {motif}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: OG_COLORS.copper,
              boxShadow: "0 0 12px 4px rgba(201, 130, 69, 0.55)",
            }}
          />
          <div
            style={{
              fontFamily: OG_FONT.mono,
              fontSize: 24,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: OG_COLORS.copper,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div
            style={{
              fontFamily: OG_FONT.serif,
              fontSize: 96,
              lineHeight: 1.04,
              color: OG_COLORS.text,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              lineHeight: 1.35,
              color: OG_COLORS.muted,
              // Voorkomt een los woord op de laatste regel bij lange ondertitels.
              textWrap: "balance",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            paddingTop: 24,
            borderTop: `1px solid ${OG_COLORS.border}`,
            fontFamily: OG_FONT.mono,
            fontSize: 22,
            color: OG_COLORS.muted,
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// De afbeeldingen zelf: één builder per pagina, taal als parameter.
// De paginabestanden onder app/(nl) en app/(en)/en zijn dunne wrappers.
// Visueel identiek per taal; alleen de tekst en de URL in de voet verschillen.
// ---------------------------------------------------------------------------

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// "klaasvanslambrouck.dev/en/nidus" — de URL van deze taalversie, zonder protocol.
function ogFooterUrl(basePath: `/${string}`, language: Language): string {
  const path = localizedPath(basePath, language);
  return `${SITE_HOST}${path === "/" ? "" : path}`;
}

// --- Homepage --------------------------------------------------------------

const HOME_NODES: readonly MotifNode[] = [
  { id: "core", x: 250, y: 315, r: 20, color: OG_COLORS.copper, glow: true },
  { id: "ai", x: 390, y: 130, r: 9, color: OG_COLORS.violet, glow: true },
  { id: "n1", x: 110, y: 160, r: 7, color: OG_COLORS.blue },
  { id: "n2", x: 420, y: 340, r: 8, color: OG_COLORS.blue },
  { id: "n3", x: 350, y: 450, r: 7, color: OG_COLORS.blue },
  { id: "n4", x: 170, y: 430, r: 6, color: OG_COLORS.blue },
  { id: "n5", x: 230, y: 90, r: 5, color: OG_COLORS.text },
];

const HOME_LINKS: readonly (readonly [string, string])[] = [
  ["core", "ai"],
  ["core", "n1"],
  ["core", "n2"],
  ["core", "n3"],
  ["core", "n4"],
  ["n1", "n5"],
  ["ai", "n2"],
  ["n3", "n4"],
];

// Alt en ondertitel volgen de rolfase uit content/role.ts.
export function homeOgAlt(language: Language): string {
  return ogAltFor(language);
}

export async function homeOgImage(language: Language) {
  return new ImageResponse(
    (
      <CvOgCard
        eyebrow="Portfolio · CV"
        title="Klaas Vanslambrouck"
        subtitle={ogSubtitleFor(language)}
        footer={ogFooterUrl("/", language)}
        motif={
          <NetworkMotif width={480} height={630} nodes={HOME_NODES} links={HOME_LINKS} />
        }
      />
    ),
    { ...OG_SIZE, fonts: await loadOgFonts() },
  );
}

// --- Nidus -----------------------------------------------------------------

// Architectuur van Nidus: mobiele interface → nidus-api (kern) → Supabase,
// met Raspberry Pi-workers voor terugkerende taken.
const NIDUS_NODES: readonly MotifNode[] = [
  { id: "interface", x: 90, y: 200, r: 9, color: OG_COLORS.text },
  { id: "api", x: 240, y: 315, r: 20, color: OG_COLORS.copper, glow: true },
  { id: "data", x: 410, y: 200, r: 12, color: OG_COLORS.blue, glow: true },
  { id: "worker1", x: 150, y: 440, r: 7, color: OG_COLORS.blue },
  { id: "worker2", x: 260, y: 465, r: 7, color: OG_COLORS.blue },
  { id: "worker3", x: 370, y: 430, r: 7, color: OG_COLORS.blue },
  { id: "ai", x: 420, y: 360, r: 8, color: OG_COLORS.violet, glow: true },
];

const NIDUS_LINKS: readonly (readonly [string, string])[] = [
  ["interface", "api"],
  ["api", "data"],
  ["api", "ai"],
  ["api", "worker1"],
  ["api", "worker2"],
  ["api", "worker3"],
  ["data", "worker3"],
];

const NIDUS_OG_SUBTITLE: Bilingual = {
  nl: "Architectuur, decision log en screenshots.",
  en: "Architecture, decision log and screenshots.",
};

const NIDUS_OG_ALT: Bilingual = {
  nl: "Nidus — case study door Klaas Vanslambrouck",
  en: "Nidus — case study by Klaas Vanslambrouck",
};

export function nidusOgAlt(language: Language): string {
  return NIDUS_OG_ALT[language];
}

export async function nidusOgImage(language: Language) {
  return new ImageResponse(
    (
      <CvOgCard
        eyebrow="Case study"
        title="Nidus"
        subtitle={NIDUS_OG_SUBTITLE[language]}
        footer={`${ogFooterUrl("/nidus", language)} · Klaas Vanslambrouck`}
        motif={
          <NetworkMotif width={480} height={630} nodes={NIDUS_NODES} links={NIDUS_LINKS} />
        }
      />
    ),
    { ...OG_SIZE, fonts: await loadOgFonts() },
  );
}

// --- LOWI ------------------------------------------------------------------

const LOWI_OG_KICKER: Bilingual = {
  nl: "Een persoonlijk lab van Klaas Vanslambrouck",
  en: "A personal lab by Klaas Vanslambrouck",
};

const LOWI_OG_ALT: Bilingual = {
  nl: "LOWI — Lab of Wonder and Imagination, een persoonlijk lab van Klaas Vanslambrouck",
  en: "LOWI — Lab of Wonder and Imagination, a personal lab by Klaas Vanslambrouck",
};

export function lowiOgAlt(language: Language): string {
  return LOWI_OG_ALT[language];
}

// Gestileerde cel (statische illustratie, los van de 3D-scène):
// koperen membraan, violette kern, blauwe organellen.
function CellMotif() {
  return (
    <svg width={640} height={630} viewBox="0 0 640 630">
      <defs>
        <radialGradient id="cytoplasm">
          <stop offset="0%" stopColor={OG_COLORS.violet} stopOpacity={0.14} />
          <stop offset="100%" stopColor={OG_COLORS.violet} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="nucleus">
          <stop offset="0%" stopColor={OG_COLORS.violet} stopOpacity={0.6} />
          <stop offset="100%" stopColor={OG_COLORS.violet} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="core">
          <stop offset="0%" stopColor={OG_COLORS.copper} stopOpacity={0.7} />
          <stop offset="100%" stopColor={OG_COLORS.copper} stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse cx={360} cy={315} rx={270} ry={250} fill="url(#cytoplasm)" />
      <ellipse
        cx={360}
        cy={315}
        rx={270}
        ry={250}
        fill="none"
        stroke={OG_COLORS.copper}
        strokeOpacity={0.55}
        strokeWidth={2}
      />
      <ellipse
        cx={360}
        cy={315}
        rx={248}
        ry={229}
        fill="none"
        stroke={OG_COLORS.copper}
        strokeOpacity={0.18}
        strokeWidth={1.5}
      />

      <circle cx={380} cy={300} r={120} fill="url(#nucleus)" />
      <circle
        cx={380}
        cy={300}
        r={82}
        fill="none"
        stroke={OG_COLORS.violet}
        strokeOpacity={0.6}
        strokeWidth={2}
      />
      <circle cx={392} cy={288} r={44} fill="url(#core)" />
      <circle cx={392} cy={288} r={14} fill={OG_COLORS.copper} />

      <ellipse cx={210} cy={210} rx={30} ry={12} transform="rotate(-25 210 210)" fill={OG_COLORS.blue} fillOpacity={0.16} stroke={OG_COLORS.blue} strokeOpacity={0.75} strokeWidth={1.5} />
      <ellipse cx={230} cy={440} rx={26} ry={11} transform="rotate(20 230 440)" fill={OG_COLORS.blue} fillOpacity={0.16} stroke={OG_COLORS.blue} strokeOpacity={0.75} strokeWidth={1.5} />
      <ellipse cx={500} cy={455} rx={28} ry={11} transform="rotate(-35 500 455)" fill={OG_COLORS.blue} fillOpacity={0.16} stroke={OG_COLORS.blue} strokeOpacity={0.75} strokeWidth={1.5} />
      <ellipse cx={540} cy={210} rx={22} ry={10} transform="rotate(40 540 210)" fill={OG_COLORS.blue} fillOpacity={0.16} stroke={OG_COLORS.blue} strokeOpacity={0.75} strokeWidth={1.5} />

      <circle cx={170} cy={320} r={4} fill={OG_COLORS.copper} fillOpacity={0.8} />
      <circle cx={300} cy={500} r={3} fill={OG_COLORS.blue} fillOpacity={0.8} />
      <circle cx={560} cy={340} r={3} fill={OG_COLORS.violet} fillOpacity={0.9} />
      <circle cx={450} cy={130} r={3} fill={OG_COLORS.copper} fillOpacity={0.8} />
    </svg>
  );
}

export async function lowiOgImage(language: Language) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: OG_COLORS.lowiBg,
          color: OG_COLORS.text,
          fontFamily: OG_FONT.sans,
        }}
      >
        <div style={{ position: "absolute", top: 0, right: -40, display: "flex" }}>
          <CellMotif />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "72px 80px",
          }}
        >
          <div style={{ fontSize: 28, color: OG_COLORS.muted }}>
            {LOWI_OG_KICKER[language]}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: OG_FONT.serif,
                fontSize: 168,
                lineHeight: 1,
                color: OG_COLORS.text,
              }}
            >
              LOWI
            </div>
            <div
              style={{
                marginTop: 24,
                fontFamily: OG_FONT.mono,
                fontSize: 32,
                color: OG_COLORS.copper,
              }}
            >
              Lab of Wonder and Imagination
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: OG_FONT.mono,
              fontSize: 22,
              color: OG_COLORS.muted,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: OG_COLORS.copper }} />
            <div style={{ width: 10, height: 10, borderRadius: 999, background: OG_COLORS.blue }} />
            <div style={{ width: 10, height: 10, borderRadius: 999, background: OG_COLORS.violet }} />
            <div style={{ marginLeft: 8 }}>{ogFooterUrl("/lowi", language)}</div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadOgFonts() },
  );
}
