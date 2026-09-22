"use client";

import { useEffect, useState } from "react";
import { initialAcquisition, publicPath } from "@/lib/analytics/session";
import { isInternalBrowser } from "@/lib/analytics/browserActivity";

const SESSION_STORAGE_KEY = "cv-session-id";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = char === "x" ? randomValue : (randomValue & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function useAnalyticsSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const existingSessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      isInternalBrowser();
      if (existingSessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existingSessionId)) {
        if (publicPath(window.location.pathname)) initialAcquisition(existingSessionId, window.sessionStorage, window.location.pathname, window.location.search, document.referrer);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage bestaat pas na mount
        setSessionId(existingSessionId);
        return;
      }

      const nextSessionId = createSessionId();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
      if (publicPath(window.location.pathname)) initialAcquisition(nextSessionId, window.sessionStorage, window.location.pathname, window.location.search, document.referrer);
      setSessionId(nextSessionId);
    } catch {
      // Zonder sessionStorage blijft analytics uit; geen fallback naar persistente opslag.
      setSessionId(null);
    }
  }, []);

  return sessionId;
}
