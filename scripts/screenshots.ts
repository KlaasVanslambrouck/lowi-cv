// Vóór/na-screenshots van de Nidus-embed (NidusMockups) voor het redesign.
// Zie docs/redesign/HANDOFF.md, "Beslissingen" §4. Draait buiten npm test.
//
//   npm run screenshots -- --label baseline          start zelf `next dev` op poort 3217
//   npm run screenshots -- --label na-fase-2
//   npm run screenshots -- --label x --url http://localhost:3000   gebruikt een draaiende server
//
// Uitvoer: docs/redesign/embed-screenshots/<label>/nidus-<toestel>-<scherm>-<thema>-<breedte>.png
// Alleen het .mockups-blok zelf wordt vastgelegd (notitie, toestelknop, frame), zodat
// wijzigingen rond de embed de vergelijking niet verstoren.
//
// Analytics: /api/track wordt in de browser geblokkeerd, en een zelf gestarte server
// krijgt een ongeldige service-role-sleutel en geen request-logging mee. Zo komen er
// geen screenshotbezoeken in de echte Supabase-tabellen.

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Locator, type Page } from "playwright";

const PORT = 3217;
const OUT_ROOT = path.join("docs", "redesign", "embed-screenshots");

const DEVICES = [
  { id: "web", label: "Web" },
  { id: "mobiel", label: "Mobiel" },
] as const;
const SCREENS = [
  { id: "vandaag", label: "Vandaag" },
  { id: "energie", label: "Energie" },
] as const;
const THEMES = [
  { id: "licht", value: "light" },
  { id: "donker", value: "dark" },
] as const;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const;

function parseArgs(args: readonly string[]): { label: string; url: string | null } {
  let label: string | null = null;
  let url: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--label") label = args[++i] ?? null;
    else if (args[i] === "--url") url = args[++i] ?? null;
    else throw new Error(`Onbekend argument: ${args[i]}`);
  }
  if (!label || !/^[a-z0-9-]+$/.test(label)) {
    throw new Error("Geef --label <naam> mee (kleine letters, cijfers, streepjes).");
  }
  return { label, url: url?.replace(/\/+$/, "") ?? null };
}

function startDevServer(): ChildProcess {
  const nextBin = path.join("node_modules", "next", "dist", "bin", "next");
  return spawn(process.execPath, [nextBin, "dev", "-p", String(PORT)], {
    env: {
      ...process.env,
      // process.env gaat voor op .env.local: geen schrijfrechten, geen request-logging.
      SUPABASE_SERVICE_ROLE_KEY: "screenshots-disabled",
      PORTFOLIO_REQUEST_LOGGING: "false",
    },
    stdio: "ignore",
  });
}

function stopDevServer(server: ChildProcess): void {
  if (server.pid === undefined) return;
  // next dev start eigen kindprocessen; op Windows ruimt alleen taskkill /T die op.
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server.kill("SIGTERM");
  }
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // server luistert nog niet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server reageert niet op ${url} binnen ${timeoutMs / 1000} s.`);
}

// Vaste en sticky elementen buiten de embed (Jarvis-knop, ControlStack, later de
// SiteHeader, Next-devindicator) verbergen, anders liggen ze over de screenshot.
async function hideOverlays(page: Page, mockups: Locator): Promise<void> {
  const handle = await mockups.elementHandle();
  await page.evaluate((root) => {
    for (const element of document.body.querySelectorAll<HTMLElement>("*")) {
      if (root?.contains(element)) continue;
      const position = getComputedStyle(element).position;
      if (position === "fixed" || position === "sticky") element.style.visibility = "hidden";
    }
    document.querySelector<HTMLElement>("nextjs-portal")?.style.setProperty("display", "none");
  }, handle);
}

async function main(): Promise<void> {
  const { label, url } = parseArgs(process.argv.slice(2));
  const baseUrl = url ?? `http://localhost:${PORT}`;
  const outDir = path.join(OUT_ROOT, label);
  mkdirSync(outDir, { recursive: true });

  const server = url ? null : startDevServer();
  const browser = await chromium.launch();
  try {
    // Eerste compile van /nidus in dev kan even duren.
    await waitForServer(`${baseUrl}/nidus`, 180_000);

    for (const theme of THEMES) {
      for (const viewport of VIEWPORTS) {
        const context = await browser.newContext({
          viewport,
          deviceScaleFactor: 1,
          colorScheme: theme.value,
          reducedMotion: "reduce",
        });
        await context.addInitScript((value) => {
          try {
            window.localStorage.setItem("cv-theme", value);
          } catch {
            // zonder localStorage volgt het thema colorScheme
          }
        }, theme.value);
        await context.route("**/api/track", (route) => route.abort());

        const page = await context.newPage();
        await page.goto(`${baseUrl}/nidus`, { waitUntil: "networkidle" });
        await page.waitForSelector(`html[data-cv-theme="${theme.value}"]`);
        await page.evaluate(() => document.fonts.ready);

        // .mockups = ouder van de toestelknop; klassenamen van CSS Modules zijn gehasht.
        const mockups = page.locator('#nidus-screenshots [role="tablist"]').locator("..");
        await mockups.scrollIntoViewIfNeeded();
        await hideOverlays(page, mockups);

        for (const device of DEVICES) {
          await mockups.getByRole("button", { name: device.label, exact: true }).click();
          for (const screen of SCREENS) {
            await mockups.getByRole("button", { name: screen.label, exact: true }).click();
            const file = `nidus-${device.id}-${screen.id}-${theme.id}-${viewport.width}.png`;
            await mockups.screenshot({ path: path.join(outDir, file), animations: "disabled" });
            console.log(`✓ ${file}`);
          }
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (server) stopDevServer(server);
  }
  console.log(`\nKlaar: ${outDir}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
