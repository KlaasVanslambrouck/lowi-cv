"use client";

import { useSyncExternalStore } from "react";

interface TimelineGeometry {
  xStart: number;
  xEnd: number;
}

type TimelineTextAnchor = "start" | "middle" | "end";

interface TimelineTick {
  x: number;
  label: string;
  anchor: TimelineTextAnchor;
}

interface TodayMarkerProps {
  date: Date;
  geometry: TimelineGeometry;
  lineStart: number;
  lineEnd: number;
  labelY: number;
}

interface DrieKlokkenProps {
  /**
   * Documentmodus toont de eigen kicker, titel en omkadering. In
   * presentatiemodus draagt de slide die kop al; het beeld laat ze weg en de
   * viewBox krimpt mee, zodat de vrijgekomen hoogte naar het diagram gaat.
   */
  toonKop?: boolean;
}

const TIMELINE_START = new Date(Date.UTC(2026, 5, 1));
const TIMELINE_END = new Date(Date.UTC(2028, 1, 1));
const TRANSPARENCY_DATE = new Date(Date.UTC(2026, 7, 2));
const GO_LIVE_DATE = new Date(Date.UTC(2027, 8, 1));
const HIGH_RISK_DATE = new Date(Date.UTC(2027, 11, 2));

const DESKTOP_GEOMETRY: TimelineGeometry = {
  xStart: 260,
  xEnd: 1060,
};

const MOBILE_GEOMETRY: TimelineGeometry = {
  xStart: 54,
  xEnd: 626,
};

const BRUSSELS_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Brussels",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DUTCH_MONTHS = [
  "jan",
  "feb",
  "mrt",
  "apr",
  "mei",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
] as const;

/**
 * ViewBoxen per modus. Zonder kop begint het beeld bij de tijdas en eindigt
 * het bij de laatste badge; die 120 eenheden minder hoogte zijn in
 * presentatiemodus rechtstreeks winst in schaalfactor.
 */
const DESKTOP_VIEWBOX = { met: "0 0 1120 590", zonder: "28 94 1086 468" } as const;
const MOBILE_VIEWBOX = { met: "0 0 680 920", zonder: "20 124 650 720" } as const;

const SVG_STYLES = `
  .drieKlokkenDesktop,
  .drieKlokkenMobile {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  /* Presentatiemodus: het beeld vult de rij en schaalt via de viewBox mee.
     Geen vaste pixelhoogte, dus ook geen scrollbalk. */
  .drieKlokkenVullend .drieKlokkenDesktop,
  .drieKlokkenVullend .drieKlokkenMobile {
    height: 100%;
  }

  .drieKlokkenDesktop {
    display: block;
  }

  .drieKlokkenMobile {
    display: none;
  }

  .drieKlokkenFrame {
    fill: var(--cv-surface);
    stroke: var(--cv-border);
  }

  .drieKlokkenKicker,
  .drieKlokkenAxisLabel,
  .drieKlokkenTrackLabel,
  .drieKlokkenDate,
  .drieKlokkenBadgeText,
  .drieKlokkenRiskText,
  .drieKlokkenTodayText {
    font-family: var(--cv-font-mono);
  }

  .drieKlokkenTitle,
  .drieKlokkenTrackDetail {
    font-family: var(--cv-font-sans);
  }

  .drieKlokkenKicker {
    fill: var(--cv-copper-soft);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2.2px;
  }

  .drieKlokkenTitle {
    fill: var(--cv-text);
    font-size: 29px;
    font-weight: 650;
  }

  .drieKlokkenAxis,
  .drieKlokkenTrack {
    stroke: var(--cv-border);
    stroke-width: 2;
  }

  .drieKlokkenTick {
    stroke: var(--cv-muted);
    stroke-width: 1;
    opacity: 0.55;
  }

  .drieKlokkenAxisLabel {
    fill: var(--cv-muted);
    font-size: 15px;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.7px;
  }

  .drieKlokkenTrackLabel {
    fill: var(--cv-text);
    font-size: 17px;
    font-weight: 650;
    letter-spacing: 0.8px;
  }

  .drieKlokkenTrackDetail {
    fill: var(--cv-muted);
    font-size: 15px;
  }

  .drieKlokkenDate {
    font-size: 16px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.4px;
  }

  .drieKlokkenDateMain {
    fill: var(--cv-text);
  }

  .drieKlokkenDateMuted {
    fill: var(--cv-muted);
  }

  .drieKlokkenCopperStroke {
    stroke: var(--cv-copper);
  }

  .drieKlokkenVioletStroke {
    stroke: var(--cv-violet);
  }

  .drieKlokkenBlueStroke {
    stroke: var(--cv-blue);
  }

  .drieKlokkenCopperFill {
    fill: var(--cv-copper);
  }

  .drieKlokkenVioletFill {
    fill: var(--cv-violet);
  }

  .drieKlokkenBlueFill {
    fill: var(--cv-blue);
  }

  .drieKlokkenMarkerStem {
    stroke-width: 2.5;
  }

  .drieKlokkenMarkerHalo {
    fill: var(--cv-surface);
    stroke-width: 3;
  }

  .drieKlokkenOldMarker {
    opacity: 0.42;
  }

  .drieKlokkenOldCircle {
    fill: var(--cv-surface);
    stroke: var(--cv-muted);
    stroke-width: 2;
    stroke-dasharray: 5 4;
  }

  .drieKlokkenOldStrike {
    stroke: var(--cv-muted);
    stroke-width: 2.5;
  }

  .drieKlokkenRiskZone {
    fill: var(--cv-copper);
    opacity: 0.09;
  }

  .drieKlokkenRiskHatch {
    stroke: var(--cv-copper);
    stroke-width: 1;
    opacity: 0.24;
  }

  .drieKlokkenRiskBoundary {
    stroke: var(--cv-copper);
    stroke-width: 1.5;
    stroke-dasharray: 6 6;
    opacity: 0.72;
  }

  .drieKlokkenRiskArrow {
    fill: none;
    stroke: var(--cv-copper);
    stroke-width: 3;
  }

  .drieKlokkenRiskText {
    fill: var(--cv-copper-soft);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .drieKlokkenBadge {
    fill: var(--cv-blue);
  }

  .drieKlokkenBadgeText {
    fill: var(--cv-bg);
    font-size: 14px;
    font-weight: 750;
    letter-spacing: 0.8px;
  }

  .drieKlokkenTodayLine {
    stroke: var(--cv-text-soft);
    stroke-width: 1.5;
    stroke-dasharray: 3 6;
    opacity: 0.48;
  }

  .drieKlokkenTodayDot {
    fill: var(--cv-text-soft);
    opacity: 0.82;
  }

  .drieKlokkenTodayText {
    fill: var(--cv-text-soft);
    font-size: 13px;
    font-weight: 650;
    letter-spacing: 0.6px;
  }

  .drieKlokkenReveal {
    animation: drieKlokkenReveal 1.15s cubic-bezier(0.22, 0.72, 0.22, 1) both;
    transform-box: fill-box;
    transform-origin: left center;
  }

  @keyframes drieKlokkenReveal {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  @media (max-width: 640px) {
    .drieKlokkenDesktop {
      display: none;
    }

    .drieKlokkenMobile {
      display: block;
    }

    .drieKlokkenKicker {
      font-size: 19px;
    }

    .drieKlokkenTitle {
      font-size: 30px;
    }

    .drieKlokkenAxisLabel,
    .drieKlokkenTrackDetail,
    .drieKlokkenTodayText {
      font-size: 18px;
    }

    .drieKlokkenTrackLabel {
      font-size: 22px;
    }

    .drieKlokkenDate {
      font-size: 20px;
    }

    .drieKlokkenRiskText,
    .drieKlokkenBadgeText {
      font-size: 17px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .drieKlokkenReveal {
      animation: none;
      transform: none;
    }
  }
`;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function dateToX(date: Date, geometry: TimelineGeometry): number {
  const totalDuration = TIMELINE_END.getTime() - TIMELINE_START.getTime();
  const elapsed = date.getTime() - TIMELINE_START.getTime();
  const progress = clamp(elapsed / totalDuration, 0, 1);

  return geometry.xStart + progress * (geometry.xEnd - geometry.xStart);
}

function getBrusselsDateKey(date: Date): string {
  let year = "";
  let month = "";
  let day = "";

  for (const part of BRUSSELS_DATE_FORMATTER.formatToParts(date)) {
    if (part.type === "year") year = part.value;
    if (part.type === "month") month = part.value;
    if (part.type === "day") day = part.value;
  }

  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string): Date {
  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(5, 7));
  const day = Number(dateKey.slice(8, 10));

  return new Date(Date.UTC(year, month - 1, day));
}

function formatDutchDate(date: Date): string {
  const day = date.getUTCDate();
  const month = DUTCH_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

function subscribeToCurrentDate(onStoreChange: () => void): () => void {
  const intervalId = window.setInterval(onStoreChange, 60_000);

  return () => window.clearInterval(intervalId);
}

function getClientDateSnapshot(): string {
  return getBrusselsDateKey(new Date());
}

function getServerDateSnapshot(): string {
  return "";
}

function TodayMarker({
  date,
  geometry,
  lineStart,
  lineEnd,
  labelY,
}: TodayMarkerProps) {
  const x = dateToX(date, geometry);
  const isNearRightEdge = x > geometry.xStart + (geometry.xEnd - geometry.xStart) * 0.82;
  const labelX = isNearRightEdge ? x - 10 : x + 10;
  const textAnchor = isNearRightEdge ? "end" : "start";
  const isWithinTimeline =
    date.getTime() >= TIMELINE_START.getTime() &&
    date.getTime() <= TIMELINE_END.getTime();
  const label = isWithinTimeline
    ? `VANDAAG · ${formatDutchDate(date)}`
    : `VANDAAG · BUITEN BEELD · ${formatDutchDate(date)}`;

  return (
    <g aria-label={label}>
      <line
        className="drieKlokkenTodayLine"
        x1={x}
        x2={x}
        y1={lineStart}
        y2={lineEnd}
      />
      <circle className="drieKlokkenTodayDot" cx={x} cy={lineStart} r="4" />
      <text
        className="drieKlokkenTodayText"
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
      >
        {label}
      </text>
    </g>
  );
}

function DesktopTimeline({
  today,
  toonKop,
}: {
  today: Date | null;
  toonKop: boolean;
}) {
  const transparencyX = dateToX(TRANSPARENCY_DATE, DESKTOP_GEOMETRY);
  const goLiveX = dateToX(GO_LIVE_DATE, DESKTOP_GEOMETRY);
  const highRiskX = dateToX(HIGH_RISK_DATE, DESKTOP_GEOMETRY);
  const january2027X = dateToX(
    new Date(Date.UTC(2027, 0, 1)),
    DESKTOP_GEOMETRY,
  );
  const july2027X = dateToX(
    new Date(Date.UTC(2027, 6, 1)),
    DESKTOP_GEOMETRY,
  );
  const january2028X = dateToX(
    new Date(Date.UTC(2028, 0, 1)),
    DESKTOP_GEOMETRY,
  );
  const riskWidth = highRiskX - goLiveX;
  const ticks: readonly TimelineTick[] = [
    {
      x: DESKTOP_GEOMETRY.xStart,
      label: "MEDIO ’26",
      anchor: "start",
    },
    { x: january2027X, label: "JAN ’27", anchor: "middle" },
    { x: july2027X, label: "JUL ’27", anchor: "middle" },
    { x: january2028X, label: "JAN ’28", anchor: "middle" },
    {
      x: DESKTOP_GEOMETRY.xEnd,
      label: "BEGIN ’28",
      anchor: "end",
    },
  ];

  return (
    <svg
      className="drieKlokkenDesktop"
      viewBox={toonKop ? DESKTOP_VIEWBOX.met : DESKTOP_VIEWBOX.zonder}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="drie-klokken-desktop-title drie-klokken-desktop-description"
    >
      <title id="drie-klokken-desktop-title">De drie klokken</title>
      <desc id="drie-klokken-desktop-description">
        Tijdlijn van medio 2026 tot begin 2028. De centralisatie gaat in
        september 2027 live, drie maanden vóór de hoog-risicoverplichtingen op
        2 december 2027. De transparantieverplichtingen gelden al sinds 2
        augustus 2026.
      </desc>
      <style>{SVG_STYLES}</style>
      <defs>
        <clipPath id="drie-klokken-desktop-reveal">
          <rect
            className="drieKlokkenReveal"
            x="0"
            y="0"
            width="1120"
            height="590"
          />
        </clipPath>
        <pattern
          id="drie-klokken-desktop-hatch"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <line
            className="drieKlokkenRiskHatch"
            x1="0"
            x2="0"
            y1="0"
            y2="12"
          />
        </pattern>
        <marker
          id="drie-klokken-desktop-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="drieKlokkenCopperFill" />
        </marker>
      </defs>

      {toonKop ? (
        <rect
          className="drieKlokkenFrame"
          x="1"
          y="1"
          width="1118"
          height="588"
          rx="18"
        />
      ) : null}

      <g clipPath="url(#drie-klokken-desktop-reveal)">
        {toonKop ? (
          <>
            <text className="drieKlokkenKicker" x="40" y="50">
              MEDIO 2026 → BEGIN 2028
            </text>
            <text className="drieKlokkenTitle" x="40" y="84">
              Drie klokken. Eén ongunstige volgorde.
            </text>
          </>
        ) : null}

        <line
          className="drieKlokkenAxis"
          x1={DESKTOP_GEOMETRY.xStart}
          x2={DESKTOP_GEOMETRY.xEnd}
          y1="132"
          y2="132"
        />
        {ticks.map((tick) => (
          <g key={tick.label}>
            <line
              className="drieKlokkenTick"
              x1={tick.x}
              x2={tick.x}
              y1="124"
              y2="140"
            />
            <text
              className="drieKlokkenAxisLabel"
              x={tick.x}
              y="158"
              textAnchor={tick.anchor}
            >
              {tick.label}
            </text>
          </g>
        ))}

        <rect
          className="drieKlokkenRiskZone"
          x={goLiveX}
          y="184"
          width={riskWidth}
          height="242"
        />
        <rect
          x={goLiveX}
          y="184"
          width={riskWidth}
          height="242"
          fill="url(#drie-klokken-desktop-hatch)"
        />
        <line
          className="drieKlokkenRiskBoundary"
          x1={goLiveX}
          x2={goLiveX}
          y1="184"
          y2="426"
        />
        <line
          className="drieKlokkenRiskBoundary"
          x1={highRiskX}
          x2={highRiskX}
          y1="184"
          y2="426"
        />
        <text
          className="drieKlokkenRiskText"
          x={(goLiveX + highRiskX) / 2}
          y="205"
          textAnchor="middle"
        >
          RISICOZONE
        </text>

        <text className="drieKlokkenTrackLabel" x="40" y="239">
          CENTRALISATIE
        </text>
        <text className="drieKlokkenTrackDetail" x="40" y="262">
          klant gaat live
        </text>
        <line
          className="drieKlokkenTrack"
          x1={DESKTOP_GEOMETRY.xStart}
          x2={DESKTOP_GEOMETRY.xEnd}
          y1="248"
          y2="248"
        />
        <line
          className="drieKlokkenMarkerStem drieKlokkenCopperStroke"
          x1={goLiveX}
          x2={goLiveX}
          y1="221"
          y2="276"
        />
        <circle
          className="drieKlokkenMarkerHalo drieKlokkenCopperStroke"
          cx={goLiveX}
          cy="248"
          r="10"
        />
        <circle className="drieKlokkenCopperFill" cx={goLiveX} cy="248" r="4" />
        <text
          className="drieKlokkenDate drieKlokkenDateMain"
          x={goLiveX - 13}
          y="292"
          textAnchor="end"
        >
          SEPTEMBER 2027
        </text>

        <text className="drieKlokkenTrackLabel" x="40" y="359">
          AI ACT
        </text>
        <text className="drieKlokkenTrackDetail" x="40" y="382">
          hoog risico
        </text>
        <line
          className="drieKlokkenTrack"
          x1={DESKTOP_GEOMETRY.xStart}
          x2={DESKTOP_GEOMETRY.xEnd}
          y1="368"
          y2="368"
        />

        <g className="drieKlokkenOldMarker">
          <circle
            className="drieKlokkenOldCircle"
            cx={transparencyX}
            cy="368"
            r="10"
          />
          <line
            className="drieKlokkenOldStrike"
            x1={transparencyX - 9}
            x2={transparencyX + 9}
            y1="377"
            y2="359"
          />
          <text
            className="drieKlokkenDate drieKlokkenDateMuted"
            x={transparencyX}
            y="339"
            textAnchor="middle"
            textDecoration="line-through"
          >
            2 AUG 2026
          </text>
          <text
            className="drieKlokkenAxisLabel"
            x={transparencyX}
            y="402"
            textAnchor="middle"
          >
            oude datum · verschoven
          </text>
        </g>

        <line
          className="drieKlokkenMarkerStem drieKlokkenVioletStroke"
          x1={highRiskX}
          x2={highRiskX}
          y1="341"
          y2="396"
        />
        <circle
          className="drieKlokkenMarkerHalo drieKlokkenVioletStroke"
          cx={highRiskX}
          cy="368"
          r="10"
        />
        <circle className="drieKlokkenVioletFill" cx={highRiskX} cy="368" r="4" />
        <text
          className="drieKlokkenDate drieKlokkenDateMain"
          x={highRiskX + 14}
          y="339"
          textAnchor="start"
        >
          2 DEC 2027
        </text>

        <path
          className="drieKlokkenRiskArrow"
          d={`M ${goLiveX + 12} 309 C ${goLiveX + 34} 318, ${highRiskX - 32} 327, ${highRiskX - 12} 348`}
          markerEnd="url(#drie-klokken-desktop-arrow)"
        />
        <text
          className="drieKlokkenRiskText"
          x={DESKTOP_GEOMETRY.xEnd}
          y="417"
          textAnchor="end"
        >
          3 MAANDEN PRODUCTIE VÓÓR DE DEADLINE
        </text>

        <text className="drieKlokkenTrackLabel" x="40" y="479">
          AI ACT
        </text>
        <text className="drieKlokkenTrackDetail" x="40" y="502">
          transparantie
        </text>
        <line
          className="drieKlokkenTrack"
          x1={DESKTOP_GEOMETRY.xStart}
          x2={DESKTOP_GEOMETRY.xEnd}
          y1="488"
          y2="488"
        />
        <line
          className="drieKlokkenMarkerStem drieKlokkenBlueStroke"
          x1={transparencyX}
          x2={transparencyX}
          y1="461"
          y2="516"
        />
        <circle
          className="drieKlokkenMarkerHalo drieKlokkenBlueStroke"
          cx={transparencyX}
          cy="488"
          r="10"
        />
        <circle className="drieKlokkenBlueFill" cx={transparencyX} cy="488" r="4" />
        <text
          className="drieKlokkenDate drieKlokkenDateMain"
          x={transparencyX}
          y="451"
          textAnchor="middle"
        >
          2 AUG 2026
        </text>
        <rect
          className="drieKlokkenBadge"
          x={transparencyX - 48}
          y="523"
          width="96"
          height="28"
          rx="14"
        />
        <text
          className="drieKlokkenBadgeText"
          x={transparencyX}
          y="542"
          textAnchor="middle"
        >
          GELDT NU
        </text>

        {today ? (
          <TodayMarker
            date={today}
            geometry={DESKTOP_GEOMETRY}
            lineStart={112}
            lineEnd={520}
            labelY={108}
          />
        ) : null}
      </g>
    </svg>
  );
}

function MobileTimeline({
  today,
  toonKop,
}: {
  today: Date | null;
  toonKop: boolean;
}) {
  const transparencyX = dateToX(TRANSPARENCY_DATE, MOBILE_GEOMETRY);
  const goLiveX = dateToX(GO_LIVE_DATE, MOBILE_GEOMETRY);
  const highRiskX = dateToX(HIGH_RISK_DATE, MOBILE_GEOMETRY);
  const january2027X = dateToX(
    new Date(Date.UTC(2027, 0, 1)),
    MOBILE_GEOMETRY,
  );
  const january2028X = dateToX(
    new Date(Date.UTC(2028, 0, 1)),
    MOBILE_GEOMETRY,
  );
  const riskWidth = highRiskX - goLiveX;
  const ticks: readonly TimelineTick[] = [
    {
      x: MOBILE_GEOMETRY.xStart,
      label: "MEDIO ’26",
      anchor: "start",
    },
    { x: january2027X, label: "JAN ’27", anchor: "middle" },
    { x: january2028X, label: "JAN ’28", anchor: "end" },
  ];

  return (
    <svg
      className="drieKlokkenMobile"
      viewBox={toonKop ? MOBILE_VIEWBOX.met : MOBILE_VIEWBOX.zonder}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="drie-klokken-mobile-title drie-klokken-mobile-description"
    >
      <title id="drie-klokken-mobile-title">De drie klokken</title>
      <desc id="drie-klokken-mobile-description">
        Tijdlijn van medio 2026 tot begin 2028. De centralisatie gaat in
        september 2027 live, drie maanden vóór de hoog-risicoverplichtingen op
        2 december 2027. De transparantieverplichtingen gelden al sinds 2
        augustus 2026.
      </desc>
      <style>{SVG_STYLES}</style>
      <defs>
        <clipPath id="drie-klokken-mobile-reveal">
          <rect
            className="drieKlokkenReveal"
            x="0"
            y="0"
            width="680"
            height="920"
          />
        </clipPath>
        <pattern
          id="drie-klokken-mobile-hatch"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <line
            className="drieKlokkenRiskHatch"
            x1="0"
            x2="0"
            y1="0"
            y2="14"
          />
        </pattern>
        <marker
          id="drie-klokken-mobile-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="drieKlokkenCopperFill" />
        </marker>
      </defs>

      {toonKop ? (
        <rect
          className="drieKlokkenFrame"
          x="1"
          y="1"
          width="678"
          height="918"
          rx="18"
        />
      ) : null}

      <g clipPath="url(#drie-klokken-mobile-reveal)">
        {toonKop ? (
          <>
            <text className="drieKlokkenKicker" x="34" y="48">
              MEDIO 2026 → BEGIN 2028
            </text>
            <text className="drieKlokkenTitle" x="34" y="86">
              Drie klokken.
            </text>
            <text className="drieKlokkenTitle" x="34" y="120">
              Eén ongunstige volgorde.
            </text>
          </>
        ) : null}

        <line
          className="drieKlokkenAxis"
          x1={MOBILE_GEOMETRY.xStart}
          x2={MOBILE_GEOMETRY.xEnd}
          y1="158"
          y2="158"
        />
        {ticks.map((tick) => (
          <g key={tick.label}>
            <line
              className="drieKlokkenTick"
              x1={tick.x}
              x2={tick.x}
              y1="149"
              y2="167"
            />
            <text
              className="drieKlokkenAxisLabel"
              x={tick.x}
              y="190"
              textAnchor={tick.anchor}
            >
              {tick.label}
            </text>
          </g>
        ))}

        <rect
          className="drieKlokkenRiskZone"
          x={goLiveX}
          y="212"
          width={riskWidth}
          height="640"
        />
        <rect
          x={goLiveX}
          y="212"
          width={riskWidth}
          height="640"
          fill="url(#drie-klokken-mobile-hatch)"
        />
        <line
          className="drieKlokkenRiskBoundary"
          x1={goLiveX}
          x2={goLiveX}
          y1="212"
          y2="852"
        />
        <line
          className="drieKlokkenRiskBoundary"
          x1={highRiskX}
          x2={highRiskX}
          y1="212"
          y2="852"
        />
        <text
          className="drieKlokkenRiskText"
          x={(goLiveX + highRiskX) / 2}
          y="235"
          textAnchor="middle"
        >
          RISICO
        </text>

        <text className="drieKlokkenTrackLabel" x="34" y="252">
          CENTRALISATIE
        </text>
        <text className="drieKlokkenTrackDetail" x="34" y="278">
          klant gaat live
        </text>
        <line
          className="drieKlokkenTrack"
          x1={MOBILE_GEOMETRY.xStart}
          x2={MOBILE_GEOMETRY.xEnd}
          y1="320"
          y2="320"
        />
        <line
          className="drieKlokkenMarkerStem drieKlokkenCopperStroke"
          x1={goLiveX}
          x2={goLiveX}
          y1="291"
          y2="349"
        />
        <circle
          className="drieKlokkenMarkerHalo drieKlokkenCopperStroke"
          cx={goLiveX}
          cy="320"
          r="12"
        />
        <circle className="drieKlokkenCopperFill" cx={goLiveX} cy="320" r="5" />
        <text
          className="drieKlokkenDate drieKlokkenDateMain"
          x={goLiveX - 15}
          y="374"
          textAnchor="end"
        >
          SEPT 2027
        </text>

        <path
          className="drieKlokkenRiskArrow"
          d={`M ${goLiveX + 13} 346 C ${goLiveX + 34} 382, ${highRiskX - 34} 421, ${highRiskX - 12} 478`}
          markerEnd="url(#drie-klokken-mobile-arrow)"
        />
        <text
          className="drieKlokkenRiskText"
          x={(goLiveX + highRiskX) / 2}
          y="414"
          textAnchor="middle"
          transform={`rotate(-90 ${(goLiveX + highRiskX) / 2} 414)`}
        >
          3 MAANDEN
        </text>

        <text className="drieKlokkenTrackLabel" x="34" y="492">
          AI ACT · HOOG RISICO
        </text>
        <line
          className="drieKlokkenTrack"
          x1={MOBILE_GEOMETRY.xStart}
          x2={MOBILE_GEOMETRY.xEnd}
          y1="546"
          y2="546"
        />
        <g className="drieKlokkenOldMarker">
          <circle
            className="drieKlokkenOldCircle"
            cx={transparencyX}
            cy="546"
            r="12"
          />
          <line
            className="drieKlokkenOldStrike"
            x1={transparencyX - 10}
            x2={transparencyX + 10}
            y1="556"
            y2="536"
          />
          <text
            className="drieKlokkenDate drieKlokkenDateMuted"
            x={transparencyX}
            y="520"
            textAnchor="start"
            textDecoration="line-through"
          >
            2 AUG 2026
          </text>
          <text
            className="drieKlokkenAxisLabel"
            x={transparencyX}
            y="586"
            textAnchor="start"
          >
            oude datum · verschoven
          </text>
        </g>
        <line
          className="drieKlokkenMarkerStem drieKlokkenVioletStroke"
          x1={highRiskX}
          x2={highRiskX}
          y1="517"
          y2="575"
        />
        <circle
          className="drieKlokkenMarkerHalo drieKlokkenVioletStroke"
          cx={highRiskX}
          cy="546"
          r="12"
        />
        <circle className="drieKlokkenVioletFill" cx={highRiskX} cy="546" r="5" />
        <text
          className="drieKlokkenDate drieKlokkenDateMain"
          x={highRiskX + 15}
          y="520"
          textAnchor="start"
        >
          2 DEC 2027
        </text>
        <text
          className="drieKlokkenRiskText"
          x={goLiveX}
          y="628"
          textAnchor="middle"
        >
          GO-LIVE VÓÓR
        </text>
        <text
          className="drieKlokkenRiskText"
          x={goLiveX}
          y="650"
          textAnchor="middle"
        >
          COMPLIANCE
        </text>

        <text className="drieKlokkenTrackLabel" x="34" y="708">
          AI ACT · TRANSPARANTIE
        </text>
        <line
          className="drieKlokkenTrack"
          x1={MOBILE_GEOMETRY.xStart}
          x2={MOBILE_GEOMETRY.xEnd}
          y1="760"
          y2="760"
        />
        <line
          className="drieKlokkenMarkerStem drieKlokkenBlueStroke"
          x1={transparencyX}
          x2={transparencyX}
          y1="731"
          y2="789"
        />
        <circle
          className="drieKlokkenMarkerHalo drieKlokkenBlueStroke"
          cx={transparencyX}
          cy="760"
          r="12"
        />
        <circle className="drieKlokkenBlueFill" cx={transparencyX} cy="760" r="5" />
        <text
          className="drieKlokkenDate drieKlokkenDateMain"
          x={transparencyX}
          y="720"
          textAnchor="start"
        >
          2 AUG 2026
        </text>
        <rect
          className="drieKlokkenBadge"
          x={transparencyX - 7}
          y="798"
          width="118"
          height="34"
          rx="17"
        />
        <text
          className="drieKlokkenBadgeText"
          x={transparencyX + 52}
          y="821"
          textAnchor="middle"
        >
          GELDT NU
        </text>

        {today ? (
          <TodayMarker
            date={today}
            geometry={MOBILE_GEOMETRY}
            lineStart={139}
            lineEnd={862}
            labelY={134}
          />
        ) : null}
      </g>
    </svg>
  );
}

export default function DrieKlokken({ toonKop = true }: DrieKlokkenProps) {
  const currentDateKey = useSyncExternalStore(
    subscribeToCurrentDate,
    getClientDateSnapshot,
    getServerDateSnapshot,
  );
  const today = currentDateKey ? dateFromKey(currentDateKey) : null;

  return (
    <figure
      className={toonKop ? undefined : "drieKlokkenVullend"}
      style={{
        width: "100%",
        height: toonKop ? undefined : "100%",
        minHeight: 0,
        margin: 0,
      }}
    >
      <DesktopTimeline today={today} toonKop={toonKop} />
      <MobileTimeline today={today} toonKop={toonKop} />
    </figure>
  );
}
