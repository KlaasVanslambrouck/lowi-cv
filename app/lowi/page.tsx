import type { Metadata } from "next";
import ControlStack from "@/components/ControlStack";
import LowiCelPagina from "@/components/lowi-cel/LowiCelPagina";
import { lowiCelIntro } from "@/content/lowiCellContent";
import { placeholderContent } from "@/content/placeholderContent";
import { SessionInsightProvider } from "@/context/SessionInsightContext";
import { ThemeProvider } from "@/context/ThemeContext";
import styles from "@/components/lowi-cel/LowiCelPagina.module.css";

export const metadata: Metadata = {
  title: "LOWI — Lab of Wonder and Imagination | Klaas Vanslambrouck",
  description: `${lowiCelIntro.titel.nl} — ${lowiCelIntro.ondertitel.nl}. ${lowiCelIntro.scrollHint.nl}.`,
};

// Servercomponent volgens /nidus; de clientcomponent vertaalt via useLanguage().
export default function LowiPage() {
  return (
    <ThemeProvider>
      <SessionInsightProvider>
        <main className={styles.page}>
          <ControlStack labels={placeholderContent.uiLabels} showXray={false} />
          <LowiCelPagina />
        </main>
      </SessionInsightProvider>
    </ThemeProvider>
  );
}
