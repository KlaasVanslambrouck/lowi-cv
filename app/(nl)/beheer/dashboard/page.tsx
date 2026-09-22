import { redirect } from "next/navigation";
import { verifyAdminAuth } from "@/lib/auth/admin";
import { createCookieSupabaseClient } from "@/lib/supabase/serverClient";
import LogoutButton from "./LogoutButton";
import styles from "../beheer.module.css";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    since?: string;
  }>;
}

interface AnalyticsRow {
  session_id: string | null;
  event_type: string | null;
  event_data: Record<string, unknown> | null;
  referrer: string | null;
  device_type: string | null;
  created_at: string;
}

interface CountEntry {
  label: string;
  count: number;
}

interface DwellEntry {
  sectionId: string;
  averageSeconds: number;
  count: number;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function parseSinceDate(value: string | undefined) {
  if (!value) return daysAgo(30);

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? daysAgo(30) : parsed;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isSince(row: AnalyticsRow, since: Date) {
  return new Date(row.created_at).getTime() >= since.getTime();
}

function readStringEventData(row: AnalyticsRow, key: string) {
  const value = row.event_data?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumberEventData(row: AnalyticsRow, key: string) {
  const value = row.event_data?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topCounts(map: Map<string, number>, limit = 8): CountEntry[] {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, limit);
}

function countUniqueSessions(rows: AnalyticsRow[], since: Date) {
  const sessions = new Set<string>();
  rows.forEach((row) => {
    if (row.session_id && isSince(row, since)) {
      sessions.add(row.session_id);
    }
  });
  return sessions.size;
}

function summarizeSections(rows: AnalyticsRow[]) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    if (row.event_type !== "section_view") return;
    const sectionId = readStringEventData(row, "sectionId");
    if (sectionId) increment(counts, sectionId);
  });
  return topCounts(counts);
}

function summarizeDwell(rows: AnalyticsRow[]): DwellEntry[] {
  const totals = new Map<string, { seconds: number; count: number }>();

  rows.forEach((row) => {
    if (row.event_type !== "dwell_time") return;
    const sectionId = readStringEventData(row, "sectionId");
    const seconds = readNumberEventData(row, "seconds");
    if (!sectionId || seconds === null) return;

    const current = totals.get(sectionId) ?? { seconds: 0, count: 0 };
    totals.set(sectionId, {
      seconds: current.seconds + seconds,
      count: current.count + 1,
    });
  });

  return Array.from(totals.entries())
    .map(([sectionId, value]) => ({
      sectionId,
      averageSeconds: Math.round((value.seconds / value.count) * 10) / 10,
      count: value.count,
    }))
    .sort((left, right) => right.averageSeconds - left.averageSeconds)
    .slice(0, 8);
}

function summarizeInteractions(rows: AnalyticsRow[]) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    if (row.event_type !== "interaction") return;
    const interactionId = readStringEventData(row, "interactionId");
    if (interactionId) increment(counts, interactionId);
  });
  return topCounts(counts);
}

function summarizeReferrers(rows: AnalyticsRow[]) {
  const firstReferrerBySession = new Map<string, string>();
  const sortedRows = [...rows].sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
  );

  sortedRows.forEach((row) => {
    if (!row.session_id || firstReferrerBySession.has(row.session_id)) return;
    firstReferrerBySession.set(row.session_id, row.referrer || "direct");
  });

  const counts = new Map<string, number>();
  firstReferrerBySession.forEach((referrer) => increment(counts, referrer));
  return topCounts(counts);
}

function DataTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: Array<[string, string | number]>;
}) {
  if (rows.length === 0) {
    return <p className={styles.emptyState}>Nog geen data voor deze periode.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">{headers[0]}</th>
            <th scope="col">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const sinceDate = parseSinceDate(params.since);
  const sinceInputValue = toDateInputValue(sinceDate);
  const thirtyDaysAgo = daysAgo(30);
  const querySince = sinceDate < thirtyDaysAgo ? sinceDate : thirtyDaysAgo;

  const supabase = await createCookieSupabaseClient();
  const adminAuth = await verifyAdminAuth(supabase);

  if (!adminAuth.ok) {
    redirect("/beheer");
  }

  const { data, error } = await supabase
    .from("portfolio_analytics")
    .select("session_id,event_type,event_data,referrer,device_type,created_at")
    .gte("created_at", querySince.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000)
    .returns<AnalyticsRow[]>();

  const rows = data ?? [];
  const filteredRows = rows.filter((row) => isSince(row, sinceDate));
  const sections = summarizeSections(filteredRows);
  const dwellTimes = summarizeDwell(filteredRows);
  const interactions = summarizeInteractions(filteredRows);
  const referrers = summarizeReferrers(filteredRows);

  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardShell}>
        <header className={styles.dashboardHeader}>
          <div>
            <p className={styles.eyebrow}>lowi / analytics</p>
            <h1 className={styles.dashboardTitle}>Dashboard</h1>
          </div>
          <div className={styles.dashboardActions}>
            <LogoutButton />
          </div>
        </header>

        <form className={styles.filterForm} action="/beheer/dashboard">
          <label className={styles.field}>
            <span className={styles.label}>Sinds</span>
            <input
              className={styles.filterInput}
              type="date"
              name="since"
              defaultValue={sinceInputValue}
            />
          </label>
          <button className={styles.secondaryButton} type="submit">
            Filter
          </button>
        </form>

        {error ? (
          <p className={styles.message}>
            Analytics konden niet geladen worden. Controleer de Supabase RLS en
            sessie.
          </p>
        ) : null}

        <section className={styles.summaryGrid} aria-label="Sessies">
          <div className={styles.metric}>
            <span className={styles.metricValue}>
              {countUniqueSessions(rows, daysAgo(7))}
            </span>
            <span className={styles.metricLabel}>unieke sessies / 7 dagen</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>
              {countUniqueSessions(rows, daysAgo(30))}
            </span>
            <span className={styles.metricLabel}>unieke sessies / 30 dagen</span>
          </div>
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionHeading}>Meest bekeken secties</h2>
            <DataTable
              headers={["Sectie", "Views"]}
              rows={sections.map((entry) => [entry.label, entry.count])}
            />
          </section>

          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionHeading}>Gemiddelde dwell-time</h2>
            <DataTable
              headers={["Sectie", "Seconden"]}
              rows={dwellTimes.map((entry) => [
                entry.sectionId,
                `${entry.averageSeconds}s (${entry.count})`,
              ])}
            />
          </section>

          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionHeading}>Interacties</h2>
            <DataTable
              headers={["Interactie", "Aantal"]}
              rows={interactions.map((entry) => [entry.label, entry.count])}
            />
          </section>

          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionHeading}>Referrers</h2>
            <DataTable
              headers={["Bron", "Sessies"]}
              rows={referrers.map((entry) => [entry.label, entry.count])}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
