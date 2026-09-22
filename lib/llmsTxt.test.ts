import { describe, expect, it } from "vitest";
import { ROLE, resumeLabelFor } from "@/content/role";
import { SITE_URL } from "./site";
import { buildLlmsTxt } from "./llmsTxt";

describe("llms.txt", () => {
  it("begint met de naam als H1 en een blockquote", () => {
    const lines = buildLlmsTxt().split("\n");

    expect(lines[0]).toBe("# Klaas Vanslambrouck");
    expect(lines[2].startsWith("> ")).toBe(true);
  });

  it("bevat de verwachte secties", () => {
    const text = buildLlmsTxt();

    for (const heading of [
      "## Pages",
      "## Machine-readable",
      "## Projects",
      "## Contact",
    ]) {
      expect(text, heading).toContain(heading);
    }
  });

  it("linkt absoluut naar de machineleesbare versies", () => {
    const text = buildLlmsTxt();

    expect(text).toContain(`(${SITE_URL}/cv.json)`);
    expect(text).toContain(`(${SITE_URL}/cv.pdf)`);
    expect(text).toContain(`(${SITE_URL}/sitemap.xml)`);
    // Geen relatieve links: elke markdown-link start met de site-URL of mailto.
    for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
      expect(href.startsWith("https://") || href.startsWith("mailto:")).toBe(true);
    }
  });

  it("maakt het onderscheid met lowi.nl expliciet", () => {
    const text = buildLlmsTxt();

    expect(text).toContain("not related to lowi.nl");
    expect(text).toContain("Landelijk Orgaan Wetenschappelijke Integriteit");
  });

  it("volgt ROLE_PHASE in de blockquote", () => {
    expect(buildLlmsTxt("incoming")).toContain(
      `> ${resumeLabelFor("incoming")} —`,
    );
    expect(buildLlmsTxt("incoming")).toContain(
      `Incoming ${ROLE.role} at ${ROLE.employer.name}`,
    );
    expect(buildLlmsTxt("current")).toContain(
      `> ${resumeLabelFor("current")} —`,
    );
    expect(buildLlmsTxt("current")).not.toContain("Incoming");
  });

  it("staat volledig in de derde persoon", () => {
    for (const phase of ["incoming", "current"] as const) {
      const text = buildLlmsTxt(phase);

      expect(text, phase).not.toMatch(/\bI'?m\b/);
      expect(text, phase).not.toMatch(/\bI\b/);
      expect(text, phase).not.toMatch(/\bmy\b/i);
    }
  });

  it("noemt LOWI één keer bij naam in de identiteitsalinea", () => {
    const paragraph = buildLlmsTxt()
      .split("\n")
      .find((line) => line.includes("not related to lowi.nl"));

    expect(paragraph).toBeDefined();
    expect(paragraph?.match(/Klaas Vanslambrouck/g)).toHaveLength(1);
    expect(paragraph).toContain("LOWI (Lab of Wonder and Imagination)");
    // Geen dubbele gedachtestreepjes meer in deze alinea.
    expect(paragraph).not.toContain("—");
  });

  it("noemt beide projecten met hun status", () => {
    const text = buildLlmsTxt();

    expect(text).toContain("Nidus");
    expect(text).toContain("In production · personal use");
    expect(text).toContain("CRISPR & CHICKN");
    expect(text).toContain("In development");
  });
});
