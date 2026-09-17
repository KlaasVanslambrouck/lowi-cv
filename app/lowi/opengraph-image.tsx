import { ImageResponse } from "next/og";
import { OG_COLORS, OG_FONT, SITE_HOST, loadOgFonts } from "@/lib/og";

export const alt =
  "LOWI — Lab of Wonder and Imagination, een persoonlijk lab van Klaas Vanslambrouck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function Image() {
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
            Een persoonlijk lab van Klaas Vanslambrouck
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
            <div style={{ marginLeft: 8 }}>{`${SITE_HOST}/lowi`}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
