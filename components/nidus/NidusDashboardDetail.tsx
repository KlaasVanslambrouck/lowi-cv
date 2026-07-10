"use client";

import { useLanguage } from "@/hooks/useLanguage";
import type { NidusDashboardDetail as DashboardDetail } from "@/types/nidusCaseStudy";
import styles from "@/styles/nidusMockup.module.css";

interface NidusDashboardDetailProps {
  detail: DashboardDetail;
}

export default function NidusDashboardDetail({
  detail,
}: NidusDashboardDetailProps) {
  const { language, t } = useLanguage();

  return (
    <div className={styles.dashboardDetail}>
      <header className={styles.dashboardHeader}>
        <p className={styles.dashboardDate}>{t(detail.greetingDate)}</p>
        <h3 className={styles.dashboardGreeting}>
          {language === "nl" ? "Goedemiddag" : "Good afternoon"},{" "}
          <span>{detail.greetingName}.</span>
        </h3>
      </header>

      <article className={styles.aiInsightCard}>
        <div className={styles.aiInsightHeading}>
          <span className={styles.aiInsightIcon} aria-hidden="true">
            ✦
          </span>
          <p className={styles.detailEyebrow}>{t(detail.aiInsightLabel)}</p>
        </div>
        <p className={styles.aiInsightText}>{t(detail.aiInsight)}</p>
      </article>

      <article className={styles.weekReportCard}>
        <p className={styles.detailEyebrow}>{t(detail.weekrapportLabel)}</p>
        <div className={styles.weekReportRows}>
          {detail.weekrapport.map((line) => (
            <div
              key={`${line.category}-${line.amount}`}
              className={styles.weekReportRow}
            >
              <span className={styles.weekReportIcon} aria-hidden="true">
                ⚠
              </span>
              <div className={styles.weekReportMain}>
                <div className={styles.weekReportTopline}>
                  <strong>{line.category}</strong>
                  <span>{line.amount}</span>
                </div>
                <p className={styles.weekReportChange}>
                  {t(line.changeLabel)}
                </p>
                <p className={styles.weekReportDetail}>{t(line.detail)}</p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className={styles.dashboardMiniGrid}>
        <article className={styles.weatherCard}>
          <div className={styles.weatherPrimary}>
            <p className={styles.weatherTemp}>{detail.weather.temp}</p>
            <div>
              <p className={styles.weatherCondition}>
                {t(detail.weather.condition)}
              </p>
              <p className={styles.weatherRange}>{detail.weather.range}</p>
            </div>
          </div>
          <p className={styles.weatherTomorrow}>
            {t(detail.weather.tomorrow)}
          </p>
        </article>

        <article className={styles.agendaCard}>
          <p className={styles.detailEyebrow}>{t(detail.agendaLabel)}</p>
          <ol className={styles.agendaList}>
            {detail.agenda.map((item) => (
              <li key={`${item.time}-${item.title.en}`}>
                <time>{item.time}</time>
                <span>{t(item.title)}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <article className={styles.healthCard}>
        <div className={styles.healthSummary}>
          <p className={styles.healthScore}>{detail.health.score}</p>
          <p className={styles.healthScoreLabel}>
            {t(detail.health.scoreLabel)}
          </p>
        </div>

        <div className={styles.healthMetrics}>
          {detail.health.metrics.map((metric) => {
            const percent = Math.min(100, Math.max(0, metric.percent));

            return (
              <div key={metric.label.en} className={styles.healthMetric}>
                <div className={styles.healthMetricHeading}>
                  <span>{t(metric.label)}</span>
                  <strong>{metric.value}</strong>
                </div>
                <div
                  className={styles.healthTrack}
                  role="progressbar"
                  aria-label={t(metric.label)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <span
                    className={styles.healthFill}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className={styles.energyLiveCard}>
        <p className={styles.energyWatts}>{detail.energyLive.watts}</p>
        <p className={styles.liveBadge}>
          <span className={styles.liveDot} aria-hidden="true" />
          {t(detail.energyLive.badge)}
        </p>
      </article>
    </div>
  );
}
