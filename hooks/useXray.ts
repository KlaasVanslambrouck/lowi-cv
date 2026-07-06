"use client";

import { useContext } from "react";
import { XrayContext } from "@/context/XrayContext";

// Centrale hook voor de X-ray weergavemodus.
export function useXray() {
  return useContext(XrayContext);
}
