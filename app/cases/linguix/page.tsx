import type { Metadata } from "next";
import LinguixLayout from "@/components/linguix/LinguixLayout";
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
      <LinguixLayout content={linguixContent} />
    </ThemeProvider>
  );
}
