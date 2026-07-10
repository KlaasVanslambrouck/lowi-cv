"use client";

import { useLanguage } from "@/hooks/useLanguage";
import type { NidusEnergyDetail as EnergyDetail } from "@/types/nidusCaseStudy";
import styles from "@/styles/nidusMockup.module.css";

interface NidusEnergyDetailProps {
  detail: EnergyDetail;
}

const timeLabels = ["16:00", "20:00", "00:00", "04:00", "08:00", "12:00"];

export default function NidusEnergyDetail({
  detail,
}: NidusEnergyDetailProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.energyDetail}>
      <article className={styles.energyHero}>
        <svg
          className={styles.energyHeroScene}
          viewBox="0 0 900 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="nidusSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8dfe4" />
              <stop offset="100%" stopColor="#faf7f2" />
            </linearGradient>
          </defs>
          <rect width="900" height="300" fill="url(#nidusSky)" />
          <circle cx="750" cy="64" r="24" fill="#c4820a" opacity="0.72" />
          <g fill="#fff" opacity="0.82">
            <ellipse cx="152" cy="72" rx="57" ry="19" />
            <ellipse cx="112" cy="82" rx="39" ry="16" />
            <ellipse cx="198" cy="82" rx="45" ry="16" />
            <ellipse cx="470" cy="52" rx="48" ry="16" />
            <ellipse cx="437" cy="61" rx="33" ry="13" />
            <ellipse cx="508" cy="61" rx="38" ry="13" />
          </g>
          <g transform="translate(590 116)">
            <rect x="16" y="62" width="184" height="105" rx="4" fill="#ddd5c8" />
            <path d="M0 72 L108 0 L220 72 Z" fill="#5a7358" opacity="0.84" />
            <rect x="92" y="102" width="39" height="65" fill="#b85c38" opacity="0.78" />
            <rect x="39" y="94" width="35" height="31" rx="3" fill="#faf7f2" />
            <rect x="153" y="94" width="25" height="31" rx="3" fill="#faf7f2" />
          </g>
          <path d="M0 255 Q220 220 450 254 T900 242 V300 H0 Z" fill="#b8c5ab" opacity="0.75" />
        </svg>

        <div className={styles.energyHeroValue}>
          <p className={styles.detailEyebrow}>{t(detail.hero.label)}</p>
          <p>
            <strong>{detail.hero.value}</strong>
            <span>{detail.hero.unit}</span>
          </p>
        </div>

        <p className={styles.energyHeroBadge}>
          <span className={styles.liveDot} aria-hidden="true" />
          {t(detail.hero.badge)}
        </p>
      </article>

      <aside className={styles.energyTip}>
        <span aria-hidden="true">●</span>
        <p>{t(detail.tip)}</p>
      </aside>

      <div className={styles.energyStats}>
        {detail.stats.map((stat) => (
          <article key={stat.label.en} className={styles.energyStatCard}>
            <p className={styles.detailEyebrow}>{t(stat.label)}</p>
            <p className={styles.energyStatValue}>
              <strong>{stat.value}</strong>
              <span>{stat.unit}</span>
            </p>
          </article>
        ))}
      </div>

      <div className={styles.energyMainGrid}>
        <div className={styles.energyChartColumn}>
          <article className={styles.energyChartCard}>
            <header className={styles.energyCardHeader}>
              <h4>{t(detail.powerChart.title)}</h4>
              <p>{t(detail.powerChart.subtitle)}</p>
            </header>

            <svg
              className={styles.energyChart}
              viewBox="0 0 600 220"
              aria-hidden="true"
              focusable="false"
            >
              <g className={styles.chartGrid}>
                <line x1="58" y1="32" x2="580" y2="32" />
                <line x1="58" y1="102" x2="580" y2="102" />
                <line x1="58" y1="172" x2="580" y2="172" />
              </g>
              <g className={styles.chartLabels}>
                <text x="4" y="36">1500W</text>
                <text x="24" y="106">0W</text>
                <text x="1" y="176">−1500W</text>
                {timeLabels.map((label, index) => (
                  <text key={label} x={60 + index * 101} y="211">
                    {label}
                  </text>
                ))}
              </g>
              <polyline
                className={styles.powerLine}
                points="58,88 82,82 105,91 129,76 152,84 176,79 199,92 223,86 246,95 270,89 293,99 316,93 340,106 363,121 387,145 410,134 434,161 457,149 481,168 504,142 528,154 551,126 580,137"
              />
            </svg>
          </article>

          <article className={styles.energyChartCard}>
            <header className={styles.energyCardHeader}>
              <h4>{t(detail.gasChart.title)}</h4>
              <p>{t(detail.gasChart.subtitle)}</p>
            </header>

            <svg
              className={styles.energyChart}
              viewBox="0 0 600 220"
              aria-hidden="true"
              focusable="false"
            >
              <g className={styles.chartGrid}>
                <line x1="58" y1="32" x2="580" y2="32" />
                <line x1="58" y1="102" x2="580" y2="102" />
                <line x1="58" y1="172" x2="580" y2="172" />
              </g>
              <g className={styles.chartLabels}>
                <text x="10" y="36">0,06</text>
                <text x="10" y="106">0,03</text>
                <text x="29" y="176">0</text>
                {timeLabels.map((label, index) => (
                  <text key={label} x={60 + index * 101} y="211">
                    {label}
                  </text>
                ))}
              </g>
              <g className={styles.gasBars}>
                <rect x="362" y="137" width="14" height="35" rx="3" />
                <rect x="383" y="112" width="14" height="60" rx="3" />
                <rect x="404" y="74" width="14" height="98" rx="3" />
                <rect x="425" y="95" width="14" height="77" rx="3" />
                <rect x="446" y="126" width="14" height="46" rx="3" />
                <rect x="467" y="151" width="14" height="21" rx="3" />
              </g>
            </svg>
          </article>
        </div>

        <div className={styles.energySideColumn}>
          <article className={styles.energyDeviceCard}>
            <header className={styles.energyCardHeader}>
              <h4>
                <span aria-hidden="true">🔌</span>
                {t(detail.deviceCard.title)}
              </h4>
              <p>{t(detail.deviceCard.subtitle)}</p>
            </header>
            <div className={styles.energyDeviceControls}>
              <div className={styles.energyFakeSelect}>
                <span>{t(detail.deviceCard.selectValue)}</span>
                <span aria-hidden="true">▾</span>
              </div>
              <span className={styles.energyStartButton}>
                {t(detail.deviceCard.buttonLabel)}
              </span>
            </div>
          </article>

          <article className={styles.energyPeakCard}>
            <div className={styles.energyPeakHeading}>
              <h4>{t(detail.peakCard.title)}</h4>
              {detail.peakCard.statusOk ? (
                <span className={styles.energyOkBadge}>✓ OK</span>
              ) : null}
            </div>
            <p className={styles.energyPeakPeriod}>
              {t(detail.peakCard.period)}
            </p>
            <div className={styles.energyPeakScale} aria-hidden="true">
              <span />
            </div>
            <div className={styles.energyPeakValues}>
              <div>
                <p>{t(detail.peakCard.peakLabel)}</p>
                <strong>{detail.peakCard.peakValue}</strong>
              </div>
              <div>
                <p>{t(detail.peakCard.thresholdLabel)}</p>
                <strong>{detail.peakCard.thresholdValue}</strong>
              </div>
            </div>
            <p className={styles.energyPeakRemaining}>
              {t(detail.peakCard.remaining)}
            </p>
          </article>

          <article className={styles.energyMeterCard}>
            <h4>{t(detail.meterCard.title)}</h4>
            <p className={styles.energyMeterValue}>
              <strong>{detail.meterCard.value}</strong>
              <span>{detail.meterCard.unit}</span>
            </p>
            <p className={styles.energyMeterSubtitle}>
              {t(detail.meterCard.subtitle)}
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
