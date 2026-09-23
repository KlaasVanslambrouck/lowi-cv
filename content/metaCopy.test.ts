import { describe, expect, it } from "vitest";
import { lowiCelMeta } from "@/content/lowiCellContent";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import type { Language, PageMetaCopy } from "@/types/content";

// De titeltemplate van de root layout plakt dit achter elke paginatitel.
const TITLE_SUFFIX = " | Klaas Vanslambrouck";
const LANGUAGES = ["nl", "en"] as const;

const PAGES: readonly { name: string; copy: PageMetaCopy }[] = [
  { name: "/nidus", copy: nidusCaseStudy.meta },
  { name: "/lowi", copy: lowiCelMeta },
];

describe.each(PAGES)("meta-copy van $name", ({ copy }) => {
  it.each(LANGUAGES)("%s: titel blijft met de template binnen 60 tekens", (language: Language) => {
    expect((copy.title[language] + TITLE_SUFFIX).length).toBeLessThanOrEqual(60);
  });

  it.each(LANGUAGES)("%s: description telt 140-160 tekens", (language: Language) => {
    const { length } = copy.description[language];
    expect(length).toBeGreaterThanOrEqual(140);
    expect(length).toBeLessThanOrEqual(160);
  });
});
