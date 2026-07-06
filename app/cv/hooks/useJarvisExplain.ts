"use client";

import { useContext } from "react";
import { JarvisExplainContext } from "@/app/cv/context/JarvisExplainContext";

// Centrale hook voor de contextuele Jarvis-uitleglaag.
export function useJarvisExplain() {
  return useContext(JarvisExplainContext);
}
