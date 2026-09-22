import type { Metadata } from "next";
import LinguixCaseView from "@/components/linguix/LinguixCaseView";
import { linguixContent } from "@/content/linguixContent";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: linguixContent.titel,
  robots: {
    index: false,
    follow: false,
  },
};

export default function LinguixPage() {
  return (
    <ThemeProvider>
      <LinguixCaseView content={linguixContent} />
    </ThemeProvider>
  );
}
