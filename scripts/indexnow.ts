// Meldt de publieke URL's aan bij IndexNow (Bing, Yandex, …; Google doet niet mee).
//
//   npm run indexnow             dry-run: toont de aanvraag, verstuurt niets
//   npm run indexnow -- --send   controleert het sleutelbestand en verstuurt
//
// NEXT_PUBLIC_SITE_URL komt uit .env.local (via --env-file-if-exists in package.json).

import sitemap from "@/app/sitemap";
import {
  INDEXNOW_ENDPOINT,
  buildIndexNowPayload,
  describeIndexNowStatus,
  urlsFromSitemap,
  type IndexNowPayload,
} from "@/lib/indexNow";
import { INDEXNOW_KEY, SITE_URL } from "@/lib/site";

function parseArgs(args: readonly string[]): { send: boolean } {
  const unknown = args.filter((arg) => arg !== "--send");
  if (unknown.length > 0) {
    throw new Error(`Onbekende argumenten: ${unknown.join(" ")}`);
  }
  return { send: args.includes("--send") };
}

function printPayload(payload: IndexNowPayload): void {
  console.log(`host:        ${payload.host}`);
  console.log(`key:         ${payload.key}`);
  console.log(`keyLocation: ${payload.keyLocation}`);
  console.log(`urlList (${payload.urlList.length}):`);
  for (const url of payload.urlList) {
    console.log(`  - ${url}`);
  }
}

async function verifyKeyFile(payload: IndexNowPayload): Promise<void> {
  // redirect: "manual" — het bestand moet exact op keyLocation staan.
  const response = await fetch(payload.keyLocation, { redirect: "manual" });
  const body = response.status === 200 ? await response.text() : "";

  if (response.status !== 200 || body !== payload.key) {
    throw new Error(
      `${payload.keyLocation} gaf status ${response.status}` +
        (response.status === 200 ? " maar niet exact de sleutel als inhoud" : "") +
        ". Sleutelbestand nog niet gedeployed?",
    );
  }
  console.log(`Sleutelbestand OK: ${payload.keyLocation}`);
}

async function submit(payload: IndexNowPayload): Promise<void> {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  console.log(
    `IndexNow: HTTP ${response.status} — ${describeIndexNowStatus(response.status)}`,
  );
  if (response.status !== 200 && response.status !== 202) {
    const detail = (await response.text()).trim();
    if (detail) console.log(detail);
    process.exitCode = 1;
  }
}

async function main(): Promise<void> {
  const { send } = parseArgs(process.argv.slice(2));
  const urlList = urlsFromSitemap(await sitemap());
  const payload = buildIndexNowPayload(SITE_URL, INDEXNOW_KEY, urlList);

  printPayload(payload);

  if (!send) {
    console.log("\nDry-run: niets verstuurd. Gebruik --send om te versturen.");
    return;
  }

  console.log("");
  await verifyKeyFile(payload);
  await submit(payload);
}

main().catch((error: unknown) => {
  console.error(
    `Fout: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
