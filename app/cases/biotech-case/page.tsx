import type { Metadata } from "next";
import BiotechPlayground from "@/components/biotech-case/BiotechPlayground";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Life Sciences AI Playground | LOWI",
  description: "An interactive strategy lab for exploring, evaluating and shaping agentic AI opportunities in life sciences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BiotechCasePage() {
  return (
    <ThemeProvider>
      <BiotechPlayground />
    </ThemeProvider>
  );
}
