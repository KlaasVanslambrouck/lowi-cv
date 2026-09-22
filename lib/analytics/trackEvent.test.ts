import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./trackEvent";

const fetchMock = vi.fn();
const beacon = vi.fn();
const event = { sessionId: "123e4567-e89b-42d3-a456-426614174000", eventType: "section_view" as const, eventData: { sectionId: "hero" } };
beforeEach(() => {
  const values = new Map<string, string>();
  const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v), removeItem: (k: string) => values.delete(k) };
  vi.stubGlobal("window", { location: { pathname: "/", search: "?via=linkedin" }, innerWidth: 1200, sessionStorage: storage, localStorage: storage });
  vi.stubGlobal("document", { referrer: "https://app.tellent.com/private?secret=discard", visibilityState: "visible", hasFocus: () => true });
  vi.stubGlobal("navigator", { webdriver: false, sendBeacon: beacon });
  fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  beacon.mockReset().mockReturnValue(true);
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("browser event transport", () => {
  it("keeps the departing section path and original attribution during SPA cleanup", () => {
    trackEvent(event);
    window.location.pathname = "/nidus";
    window.location.search = "?via=other";
    trackEvent({ ...event, path: "/" });
    const payload = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(payload.path).toBe("/");
    expect(payload.session).toMatchObject({ landing_path: "/", via: "linkedin", referrer: "https://app.tellent.com" });
    expect(payload.referrer).toBe("https://app.tellent.com");
    expect(payload.eventId).not.toBe(JSON.parse(fetchMock.mock.calls[0][1].body).eventId);
  });
  it("falls back to keepalive fetch when the beacon queue rejects a packet", () => {
    beacon.mockReturnValue(false);
    trackEvent(event, { preferBeacon: true });
    expect(beacon).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
  });
  it("avoids a second send after a successful beacon", () => {
    trackEvent(event, { preferBeacon: true });
    expect(beacon).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not send private paths", () => {
    window.location.pathname = "/beheer";
    trackEvent(event);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
