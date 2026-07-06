"use client";

import { useEffect, useState } from "react";

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
      if (existingSessionId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage bestaat pas na mount
        setSessionId(existingSessionId);
        return;
      }

      const nextSessionId = createSessionId();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
      setSessionId(nextSessionId);
    } catch {
      // Zonder sessionStorage blijft analytics uit; geen fallback naar persistente opslag.
      setSessionId(null);
    }
  }, []);

  return sessionId;
}
