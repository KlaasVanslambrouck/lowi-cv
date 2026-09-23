import { describe, expect, it } from "vitest";
import { ActiveDwell } from "./activeDwell";
import { classifyUserAgent } from "./classify";
import { initialAcquisition, internalFlag, parseAcquisition, publicPath } from "./session";
import { requestObservation } from "./requestObservation";
import { PUBLIC_ROUTES, localizedPath } from "@/lib/site";
import { validateTrackPayload } from "./trackValidation";

const browser = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36";
function storage() {
  const values = new Map<string, string>();
  return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); }, removeItem: (k: string) => { values.delete(k); } };
}

describe("agent declarations are not verified identities", () => {
  it.each([
    ["GPTBot/1.0", "ai_training", "openai"],
    ["OAI-SearchBot/1.0", "ai_search", "openai"],
    [`${browser}; ChatGPT-User/1.0`, "ai_user_fetch", "openai"],
    ["ClaudeBot/1.0", "ai_training", "anthropic"],
    ["Claude-SearchBot/1.0", "ai_search", "anthropic"],
    ["Claude-User/1.0", "ai_user_fetch", "anthropic"],
    ["PerplexityBot", "ai_search", "perplexity"],
    ["Perplexity-User", "ai_user_fetch", "perplexity"],
    ["Googlebot/2.1", "search_engine", "google"],
    ["bingbot/2.0", "search_engine", "microsoft"],
    ["Applebot/0.1", "search_engine", "other"],
    ["facebookexternalhit/1.1", "social_preview", "meta"],
    ["LinkedInBot/1.0", "social_preview", "other"],
    ["Slackbot-LinkExpanding 1.0", "social_preview", "other"],
    ["Discordbot/2.0", "social_preview", "other"],
    ["Twitterbot/1.0", "social_preview", "other"],
  ])("classifies %s as %s", (ua, automation_type, provider) => {
    expect(classifyUserAgent(ua)).toMatchObject({ automation_type, provider, confidence: "declared" });
  });
  it("does not call ordinary browser claims verified humans", () => {
    expect(classifyUserAgent(browser)).toMatchObject({ automation_type: "human_candidate", provider: null, confidence: "inferred" });
    expect(classifyUserAgent(null).automation_type).toBe("unknown");
  });
  it.each(["HeadlessChrome/140.0", "curl/8.0", "python-requests/2.0"])("only infers automation for %s", (ua) => {
    expect(classifyUserAgent(ua)).toMatchObject({ automation_type: "automation", confidence: "inferred" });
  });
  it("webdriver is only inferred and does not upgrade declared identity", () => {
    expect(classifyUserAgent(browser, true)).toMatchObject({ automation_type: "automation", confidence: "inferred" });
    expect(classifyUserAgent("Claude-User", true).confidence).toBe("declared");
  });
});

describe("first-touch acquisition and internal browser", () => {
  it("persists internal status and explicitly resets it", () => {
    const local = storage();
    expect(internalFlag("", local)).toBe(false);
    expect(internalFlag("?internal=1", local)).toBe(true);
    expect(internalFlag("?via=linkedin", local)).toBe(true);
    expect(internalFlag("?internal=0", local)).toBe(false);
    expect(internalFlag("", local)).toBe(false);
  });
  it("captures UTM/via labels and only a referrer origin", () => {
    expect(parseAcquisition("/", "?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio&utm_content=profile&via=tellent", "https://app.tellent.com/private?token=secret#person"))
      .toEqual({ landing_path: "/", referrer: "https://app.tellent.com", source: "linkedin", medium: "social", campaign: "portfolio", content: "profile", via: "tellent" });
  });
  it("preserves first touch across reload/navigation, and resets for a new session", () => {
    const session = storage();
    const first = initialAcquisition("a", session, "/", "?via=linkedin", "https://app.tellent.com/job");
    expect(initialAcquisition("a", session, "/nidus", "?via=other", "https://portfolio.test/")).toEqual(first);
    expect(initialAcquisition("b", session, "/en", "?via=new", "").via).toBe("new");
  });
  it("does not retain unrelated queries or sensitive campaign values", () => {
    expect(parseAcquisition("/nidus?token=secret#part", "?utm_source=a%40example.com&token=secret", "javascript:alert(1)")).toMatchObject({ landing_path: "/nidus", source: null, referrer: null });
    expect(publicPath("/beheer/dashboard")).toBeNull();
  });
});

describe("publicPath laat alleen bekende publieke paden door", () => {
  it.each([
    // Pagina's in beide talen.
    ["/", "/"],
    ["/en", "/en"],
    ["/nidus", "/nidus"],
    ["/en/nidus", "/en/nidus"],
    ["/lowi", "/lowi"],
    ["/en/lowi", "/en/lowi"],
    // Machinebestanden.
    ["/cv.pdf", "/cv.pdf"],
    ["/cv.json", "/cv.json"],
    ["/robots.txt", "/robots.txt"],
    ["/sitemap.xml", "/sitemap.xml"],
    ["/llms.txt", "/llms.txt"],
    // Noindex-cases, met en zonder subpad.
    ["/cases/linguix", "/cases/linguix"],
    ["/cases/biotech-case/the-experiment", "/cases/biotech-case/the-experiment"],
    ["/projects/nidus", "/projects/nidus"],
    // Genormaliseerd: trailing slash, query en fragment verdwijnen.
    ["/nidus/", "/nidus"],
    ["/en/", "/en"],
    ["/nidus?utm_source=x#top", "/nidus"],
  ])("laat %s door als %s", (input, expected) => {
    expect(publicPath(input)).toBe(expected);
  });

  it.each([
    "/beheer",
    "/beheer/dashboard",
    "/en/bestaat-niet",
    "/bestaat-niet",
    "/api/track",
    "/cases/Hoofdletters",
    "https://example.com/nidus",
    `/${"a".repeat(201)}`,
  ])("weigert %s", (input) => {
    expect(publicPath(input)).toBeNull();
  });

  it("weigert alles wat geen string is", () => {
    expect(publicPath(undefined)).toBeNull();
    expect(publicPath(42)).toBeNull();
  });

  // Bewaking: een nieuwe route in PUBLIC_ROUTES mag niet stil uit de analytics
  // vallen doordat iemand vergeet publicPath bij te werken.
  it("laat elke route uit PUBLIC_ROUTES in beide talen door", () => {
    for (const route of PUBLIC_ROUTES) {
      const paths = route.localized
        ? [localizedPath(route.path, "nl"), localizedPath(route.path, "en")]
        : [route.path];
      for (const path of paths) {
        expect(publicPath(path), path).toBe(path);
      }
    }
  });
});

describe("active dwell boundaries", () => {
  it("does not restart the idle allowance just because a new section appears", () => {
    const clock = new ActiveDwell(60000, 0);
    clock.state(60000, true, true, true);
    expect(clock.meaningfulTotal(70000)).toBe(0);
  });
  it("ignores sub-second impressions and credits them only once the threshold is reached", () => {
    const clock = new ActiveDwell(0);
    clock.state(0, true, true, true);
    expect(clock.meaningfulTotal(999)).toBe(0);
    expect(clock.meaningfulTotal(1000)).toBe(1000);
  });
  it("stops at 30 seconds even when the timer wakes much later", () => {
    const clock = new ActiveDwell(0);
    clock.state(0, true, true, true);
    expect(clock.total(326000)).toBe(30000);
    clock.activity(326000);
    expect(clock.total(337000)).toBe(41000);
  });
  it("excludes hidden time and resumes without a new intersection", () => {
    const clock = new ActiveDwell(0);
    clock.state(0, true, true, true);
    clock.state(5000, false, true, true);
    clock.state(15000, true, true, true);
    expect(clock.total(20000)).toBe(10000);
  });
  it("excludes unfocused and out-of-section time", () => {
    const clock = new ActiveDwell(0);
    clock.state(0, true, false, true);
    clock.state(5000, true, true, false);
    expect(clock.total(10000)).toBe(0);
    clock.state(10000, true, true, true);
    expect(clock.total(11000)).toBe(1000);
    expect(clock.total(11000)).toBe(1000);
  });
  it("does not retroactively credit idle time when interaction resumes", () => {
    const clock = new ActiveDwell(0);
    clock.state(0, true, true, true);
    clock.activity(90000);
    expect(clock.total(91000)).toBe(31000);
  });
});

describe("request observation", () => {
  it.each(["/", "/en", "/nidus", "/lowi", "/cases/linguix/notities", "/projects/nidus", "/robots.txt", "/sitemap.xml", "/llms.txt", "/cv.pdf", "/cv.json"])("includes %s", (path) => {
    expect(requestObservation(new URL(`https://site.test${path}?token=private`), "GET", new Headers({ "user-agent": "Claude-User" }))).toMatchObject({ path, automation_type: "ai_user_fetch", confidence: "declared" });
  });
  it.each(["/_next/static/chunk.js", "/photo.png", "/font.woff2", "/favicon.ico", "/api/track", "/health", "/beheer/dashboard", "/en/foo.js"])("excludes %s", (path) => {
    expect(requestObservation(new URL(`https://site.test${path}`), "GET", new Headers())).toBeNull();
  });
  it("ignores prefetch/RSC and untrusted geo headers", () => {
    const url = new URL("https://site.test/");
    expect(requestObservation(url, "GET", new Headers({ rsc: "1" }))).toBeNull();
    expect(requestObservation(url, "GET", new Headers({ purpose: "prefetch" }))).toBeNull();
    expect(requestObservation(url, "POST", new Headers())).toBeNull();
    const headers = new Headers({ "x-vercel-ip-country": "BE", "x-vercel-ip-country-region": "VLG", "x-forwarded-for": "192.0.2.1" });
    expect(requestObservation(url, "GET", headers)).toMatchObject({ country: null, region: null });
    const result = requestObservation(url, "GET", headers, true);
    expect(result).toMatchObject({ country: "BE", region: "VLG" });
    expect(JSON.stringify(result)).not.toContain("192.0.2.1");
  });
});

describe("v2 payload validation", () => {
  const event = { sessionId: "123e4567-e89b-42d3-a456-426614174000", eventType: "dwell_time", eventData: { sectionId: "nidus", seconds: 326, activeSeconds: 41, dwellVersion: 2, impressionId: "123e4567-e89b-42d3-a456-426614174001" } };
  it("accepts raw and active dwell while retaining legacy payload support", () => {
    expect(validateTrackPayload(event)?.eventData).toEqual(event.eventData);
    expect(validateTrackPayload({ ...event, eventData: { sectionId: "nidus", seconds: 12 } })).not.toBeNull();
  });
  it.each([-1, NaN, Infinity, 86401, 400])("rejects invalid active dwell %s", (activeSeconds) => {
    expect(validateTrackPayload({ ...event, eventData: { ...event.eventData, activeSeconds } })).toBeNull();
  });
  it("rejects client-supplied verification, unknown signal data and malformed context", () => {
    expect(validateTrackPayload({ ...event, confidence: "verified" })).toBeNull();
    expect(validateTrackPayload({ ...event, signals: { webdriver: true, ip: "192.0.2.1" } })).toBeNull();
    expect(validateTrackPayload({ ...event, session: { ...parseAcquisition("/", "", ""), is_internal: "false" } })).toBeNull();
  });
});
