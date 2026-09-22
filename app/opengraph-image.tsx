import { ImageResponse } from "next/og";
import { ogAlt, ogSubtitle } from "@/content/role";
import {
  CvOgCard,
  NetworkMotif,
  OG_COLORS,
  SITE_HOST,
  loadOgFonts,
  type MotifNode,
} from "@/lib/og";

// Alt en ondertitel volgen de rolfase uit content/role.ts.
export const alt = ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NODES: readonly MotifNode[] = [
  { id: "core", x: 250, y: 315, r: 20, color: OG_COLORS.copper, glow: true },
  { id: "ai", x: 390, y: 130, r: 9, color: OG_COLORS.violet, glow: true },
  { id: "n1", x: 110, y: 160, r: 7, color: OG_COLORS.blue },
  { id: "n2", x: 420, y: 340, r: 8, color: OG_COLORS.blue },
  { id: "n3", x: 350, y: 450, r: 7, color: OG_COLORS.blue },
  { id: "n4", x: 170, y: 430, r: 6, color: OG_COLORS.blue },
  { id: "n5", x: 230, y: 90, r: 5, color: OG_COLORS.text },
];

const LINKS: readonly (readonly [string, string])[] = [
  ["core", "ai"],
  ["core", "n1"],
  ["core", "n2"],
  ["core", "n3"],
  ["core", "n4"],
  ["n1", "n5"],
  ["ai", "n2"],
  ["n3", "n4"],
];

export default async function Image() {
  return new ImageResponse(
    (
      <CvOgCard
        eyebrow="Portfolio · CV"
        title="Klaas Vanslambrouck"
        subtitle={ogSubtitle}
        footer={SITE_HOST}
        motif={<NetworkMotif width={480} height={630} nodes={NODES} links={LINKS} />}
      />
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
