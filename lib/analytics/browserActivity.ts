import { classifyUserAgent } from "./classify";
import { internalFlag } from "./session";

type ActivityListener = (now: number, meaningful: boolean) => void;
const listeners = new Set<ActivityListener>();
let cleanup: (() => void) | undefined;
let firstInteractionMs: number | null = null;
let lastActivityAt: number | null = null;
const counts: Record<string, number> = {};
let serverExcluded = false;
const eligibilityListeners = new Set<() => void>();

export function lastMeaningfulActivity() { return lastActivityAt ?? performance.now(); }

export function isInternalBrowser() {
  if (typeof window === "undefined") return false;
  try { return internalFlag(window.location.search, window.localStorage); }
  catch { return new URLSearchParams(window.location.search).get("internal") === "1"; }
}

export function humanContextAllowed() {
  if (typeof navigator === "undefined") return false;
  return !serverExcluded && !isInternalBrowser() && classifyUserAgent(navigator.userAgent, navigator.webdriver).automation_type === "human_candidate";
}

export function excludeHumanContext() {
  serverExcluded = true;
  eligibilityListeners.forEach((listener) => listener());
}

export function subscribeEligibility(listener: () => void) {
  eligibilityListeners.add(listener);
  return () => { eligibilityListeners.delete(listener); };
}

export function activitySignals() {
  return {
    webdriver: navigator.webdriver === true,
    firstInteractionMs: firstInteractionMs === null ? null : Math.round(firstInteractionMs),
    interactionCounts: { ...counts },
    visible: document.visibilityState === "visible",
    focused: document.hasFocus(),
  };
}

export function subscribeActivity(listener: ActivityListener) {
  listeners.add(listener);
  if (!cleanup) {
    lastActivityAt ??= performance.now();
    let lastPointer = -Infinity;
    const activity = (event: Event) => {
      if (!event.isTrusted) return;
      const now = performance.now();
      if (event.type === "pointermove" && now - lastPointer < 1000) return;
      if (event.type === "pointermove") lastPointer = now;
      firstInteractionMs ??= now;
      lastActivityAt = now;
      counts[event.type] = Math.min(100_000, (counts[event.type] ?? 0) + 1);
      listeners.forEach((fn) => fn(now, true));
    };
    const state = () => listeners.forEach((fn) => fn(performance.now(), false));
    const events = ["pointermove", "pointerdown", "touchstart", "keydown", "scroll"];
    events.forEach((name) => window.addEventListener(name, activity, { passive: true }));
    window.addEventListener("focus", state);
    window.addEventListener("blur", state);
    document.addEventListener("visibilitychange", state);
    cleanup = () => {
      events.forEach((name) => window.removeEventListener(name, activity));
      window.removeEventListener("focus", state);
      window.removeEventListener("blur", state);
      document.removeEventListener("visibilitychange", state);
    };
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { cleanup?.(); cleanup = undefined; }
  };
}
