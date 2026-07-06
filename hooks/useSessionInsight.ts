"use client";

import { useContext } from "react";
import { SessionInsightContext } from "@/context/SessionInsightContext";

export function useSessionInsight() {
  return useContext(SessionInsightContext);
}
