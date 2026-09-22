import type { Metadata } from "next";
import ExperimentShell from "@/components/biotech-case/experiment/ExperimentShell";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "The Experiment | Life Sciences AI Playground",
  description: "A deterministic scientific strategy game about scientist-supervised AI in biomedical research.",
  robots: { index: false, follow: false },
};

export default function TheExperimentPage() {
  return <ThemeProvider><ExperimentShell /></ThemeProvider>;
}
