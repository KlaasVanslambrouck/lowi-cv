import { describe, expect, it } from "vitest";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { nidusLayerTree } from "./nidusLayers";

describe("nidusLayerTree", () => {
  it("toont de architectuur van de case study per laag, van client naar ai", () => {
    expect(nidusLayerTree(nidusCaseStudy.architecture)).toBe(
      [
        "CLIENT  nidus · nidus-mobile",
        "API     nidus-api",
        "DATA    Supabase · nidus-ml · Databricks",
        "EDGE    nidus-pi",
        "AI      Claude Haiku",
      ].join("\n"),
    );
  });

  it("laat lagen zonder componenten weg", () => {
    const [first] = nidusCaseStudy.architecture;
    expect(nidusLayerTree(first ? [first] : [])).toBe("CLIENT  nidus");
  });
});
