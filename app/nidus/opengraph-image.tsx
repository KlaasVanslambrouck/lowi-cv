import { ImageResponse } from "next/og";
import {
  CvOgCard,
  NetworkMotif,
  OG_COLORS,
  SITE_HOST,
  loadOgFonts,
  type MotifNode,
} from "@/lib/og";

// TODO(prompt 4): definitieve copy; nu afgeleid van de description in app/nidus/page.tsx.
export const alt = "Nidus — case study door Klaas Vanslambrouck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Architectuur van Nidus: mobiele interface → nidus-api (kern) → Supabase,
// met Raspberry Pi-workers voor terugkerende taken.
const NODES: readonly MotifNode[] = [
  { id: "interface", x: 90, y: 200, r: 9, color: OG_COLORS.text },
  { id: "api", x: 240, y: 315, r: 20, color: OG_COLORS.copper, glow: true },
  { id: "data", x: 410, y: 200, r: 12, color: OG_COLORS.blue, glow: true },
  { id: "worker1", x: 150, y: 440, r: 7, color: OG_COLORS.blue },
  { id: "worker2", x: 260, y: 465, r: 7, color: OG_COLORS.blue },
  { id: "worker3", x: 370, y: 430, r: 7, color: OG_COLORS.blue },
  { id: "ai", x: 420, y: 360, r: 8, color: OG_COLORS.violet, glow: true },
];

const LINKS: readonly (readonly [string, string])[] = [
  ["interface", "api"],
  ["api", "data"],
  ["api", "ai"],
  ["api", "worker1"],
  ["api", "worker2"],
  ["api", "worker3"],
  ["data", "worker3"],
];

export default async function Image() {
  return new ImageResponse(
    (
      <CvOgCard
        eyebrow="Case study"
        title="Nidus"
        subtitle="Architectuur, decision log, screenshots en code."
        footer={`${SITE_HOST}/nidus · Klaas Vanslambrouck`}
        motif={<NetworkMotif width={480} height={630} nodes={NODES} links={LINKS} />}
      />
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
