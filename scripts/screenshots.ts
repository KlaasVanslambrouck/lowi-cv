// Vóór/na-screenshots van de Nidus-embed (NidusMockups) voor het redesign.
// Zie docs/redesign/HANDOFF.md, "Beslissingen" §4. Draait buiten npm test.
//
//   npm run screenshots -- --label baseline          start zelf `next dev` op poort 3217
//   npm run screenshots -- --label na-fase-2
//   npm run screenshots -- --label x --url http://localhost:3000   gebruikt een draaiende server
//   npm run screenshots -- --label na --align-to referentie --compare referentie
//
// Uitvoer: docs/redesign/embed-screenshots/<label>/nidus-<toestel>-<scherm>-<thema>-<breedte>[-deel].png
// plus posities.json. Per toestand: het hele .mockups-blok, en apart de drie
// onderdelen binnenin (-notitie, -knop, -kader). Het blok zelf is zo breed als
// zijn ouder, dus een bredere pagina verandert die screenshot ook als er binnenin
// niets wijzigt; de onderdelen zijn de eigenlijke controle.
//
// --align-to <label> zet elk onderdeel op dezelfde paginapositie als in die
// label (zie placeAt); --compare <label> meldt per bestand of het byte-identiek is.
// Een eerlijke vóór/na maak je zo: referentie op de oude code (een export van de
// vorige commit met `git show`, eigen `next dev --webpack`), daarna de nieuwe
// code met --align-to en --compare naar die referentie, met dezelfde bundler.
//
// Analytics: /api/track wordt in de browser geblokkeerd, en een zelf gestarte server
// krijgt een ongeldige service-role-sleutel en geen request-logging mee. Zo komen er
// geen screenshotbezoeken in de echte Supabase-tabellen.

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Locator, type Page } from "playwright";

const PORT = 3217;
const OUT_ROOT = path.join("docs", "redesign", "embed-screenshots");
const POSITIONS_FILE = "posities.json";

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

const LABEL_PATTERN = /^[a-z0-9-]+$/;

function parseArgs(args: readonly string[]): {
  label: string;
  url: string | null;
  compare: string | null;
  alignLabel: string | null;
} {
  let label: string | null = null;
  let url: string | null = null;
  let compare: string | null = null;
  let alignLabel: string | null = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--label") label = args[++i] ?? null;
    else if (args[i] === "--url") url = args[++i] ?? null;
    else if (args[i] === "--compare") compare = args[++i] ?? null;
    else if (args[i] === "--align-to") alignLabel = args[++i] ?? null;
    else throw new Error(`Onbekend argument: ${args[i]}`);
  }
  if (!label || !LABEL_PATTERN.test(label)) {
    throw new Error("Geef --label <naam> mee (kleine letters, cijfers, streepjes).");
  }
  for (const [flag, value] of [["--compare", compare], ["--align-to", alignLabel]] as const) {
    if (value !== null && !LABEL_PATTERN.test(value)) {
      throw new Error(`${flag} verwacht een bestaande label.`);
    }
  }
  return { label, url: url?.replace(/\/+$/, "") ?? null, compare, alignLabel };
}

// Byte-vergelijking: dezelfde Chromium codeert dezelfde pixels identiek.
function compareLabels(label: string, reference: string): number {
  const referenceDir = path.join(OUT_ROOT, reference);
  if (!existsSync(referenceDir)) throw new Error(`Geen screenshots onder ${referenceDir}.`);
  let differences = 0;
  console.log(`\nVergelijking ${label} ↔ ${reference}:`);
  const files = readdirSync(path.join(OUT_ROOT, label)).filter((file) => file.endsWith(".png"));
  for (const file of files.sort()) {
    const referenceFile = path.join(referenceDir, file);
    if (!existsSync(referenceFile)) {
      console.log(`  ?  ${file} (niet in ${reference})`);
      continue;
    }
    const same = readFileSync(path.join(OUT_ROOT, label, file)).equals(readFileSync(referenceFile));
    if (!same) differences++;
    console.log(`  ${same ? "=" : "≠"}  ${file}`);
  }
  return differences;
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

    // Waar de embed transparant is (notitie, afgeronde hoeken) schijnt de
    // pagina door. Alle voorouders krijgen daarom de achtergrond van vóór het
    // redesign (--cv-bg, geen patroon): op de oude pagina verandert dat niets,
    // op de nieuwe vergelijkt het alleen de component zelf.
    for (let element = root?.parentElement; element; element = element.parentElement) {
      element.style.setProperty("background-color", "var(--cv-bg)", "important");
      element.style.setProperty("background-image", "none", "important");
    }
  }, handle);
}

// Chromium rastert verlopen, vervagingen en letters in tegels; het resultaat
// hangt dus licht af van waar op de pagina iets staat (en van fracties van
// een pixel). Een ongewijzigde component op een andere plek geeft daardoor
// toch andere bytes. Daarom plaatst het script elk vastgelegd onderdeel op
// een vaste plek door de ouder van .mockups (buiten de component) te
// verschuiven:
// - zonder --align-to: op hele pixels; de plek wordt bewaard in posities.json;
// - met --align-to <label>: op exact de plek uit posities.json van die label.
type Position = { x: number; y: number };
type Positions = Record<string, Position>;

async function pagePosition(locator: Locator): Promise<Position> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
  });
}

// Meet en corrigeert tot drie keer: de layout rondt een relatieve verschuiving
// af (1/64 px) en na een klik kan de pagina nog even bijschuiven.
async function placeAt(mockups: Locator, part: Locator, target: Position | null): Promise<Position> {
  const start = await pagePosition(part);
  const goal = target ?? { x: Math.floor(start.x), y: Math.floor(start.y) };
  let current = start;
  for (let attempt = 0; attempt < 3; attempt++) {
    const delta = { x: goal.x - current.x, y: goal.y - current.y };
    if (Math.abs(delta.x) <= 0.01 && Math.abs(delta.y) <= 0.01) break;
    await mockups.evaluate((root, shift) => {
      const parent = root.parentElement;
      if (!parent) return;
      const top = Number.parseFloat(parent.style.top || "0");
      const left = Number.parseFloat(parent.style.left || "0");
      parent.style.position = "relative";
      parent.style.zIndex = "1000"; // boven latere secties, zodat klikken blijven werken
      parent.style.top = `${top + shift.y}px`;
      parent.style.left = `${left + shift.x}px`;
    }, delta);
    current = await pagePosition(part);
  }
  return current;
}

async function main(): Promise<void> {
  const { label, url, compare, alignLabel } = parseArgs(process.argv.slice(2));
  const baseUrl = url ?? `http://localhost:${PORT}`;
  const outDir = path.join(OUT_ROOT, label);
  mkdirSync(outDir, { recursive: true });

  const positions: Positions = {};
  const alignTo: Positions | null = alignLabel
    ? (JSON.parse(readFileSync(path.join(OUT_ROOT, alignLabel, POSITIONS_FILE), "utf8")) as Positions)
    : null;

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
        // Volgorde binnenin: p.note, div.deviceToggle (tablist), div.nidusFrame.
        const toggle = page.locator('#nidus-screenshots [role="tablist"]');
        const mockups = toggle.locator("..");
        const parts: Record<string, Locator> = {
          notitie: mockups.locator("> p").first(),
          knop: toggle,
          kader: page.locator('#nidus-screenshots [role="tablist"] + div'),
        };
        await mockups.scrollIntoViewIfNeeded();
        await hideOverlays(page, mockups);

        for (const device of DEVICES) {
          await mockups.getByRole("button", { name: device.label, exact: true }).click();
          for (const screen of SCREENS) {
            await mockups.getByRole("button", { name: screen.label, exact: true }).click();
            const name = `nidus-${device.id}-${screen.id}-${theme.id}-${viewport.width}`;
            const shots: [string, Locator][] = [
              [`${name}.png`, mockups],
              ...Object.entries(parts).map(
                ([part, locator]): [string, Locator] => [`${name}-${part}.png`, locator],
              ),
            ];
            // Muis weg: anders krijgt wat na het verschuiven onder de muis
            // komt (bv. een tab) een hovertoestand, en die verschilt per run.
            await page.mouse.move(0, 0);
            for (const [file, locator] of shots) {
              positions[file] = await placeAt(mockups, locator, alignTo?.[file] ?? null);
              const target = alignTo?.[file];
              if (
                target &&
                (Math.abs(positions[file].x - target.x) > 0.01 ||
                  Math.abs(positions[file].y - target.y) > 0.01)
              ) {
                console.warn(`! ${file}: niet exact op de doelpositie geplaatst`);
              }
              await locator.screenshot({ path: path.join(outDir, file), animations: "disabled" });
            }
            console.log(`✓ ${name} (+ notitie, knop, kader)`);
          }
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (server) stopDevServer(server);
  }
  writeFileSync(path.join(outDir, POSITIONS_FILE), `${JSON.stringify(positions, null, 2)}\n`);
  console.log(`\nKlaar: ${outDir}`);

  if (compare) {
    const differences = compareLabels(label, compare);
    console.log(differences === 0 ? "\nAlles identiek." : `\n${differences} bestand(en) verschillen.`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
