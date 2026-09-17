import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import type { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

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
