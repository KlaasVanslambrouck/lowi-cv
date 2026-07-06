"use client";

import { useContext } from "react";
import { ThemeContext } from "@/app/cv/context/ThemeContext";

export function useTheme() {
  return useContext(ThemeContext);
}
