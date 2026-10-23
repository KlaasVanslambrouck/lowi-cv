import { describe, expect, it } from "vitest";
import { lowiCelHoofdstukken } from "@/content/lowiCellContent";
import { nidusCaseStudy } from "@/content/nidusCaseStudy";
import { placeholderContent } from "@/content/placeholderContent";
import { ROLE } from "@/content/role";
import { markdownFor, notFoundMarkdown } from "./markdownPages";
import { MARKDOWN_ROUTES } from "./markdownRoutes";
import { SITE_URL, absoluteUrl } from "./site";

function links(markdown: string): string[] {
  return [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(([, href]) => href);
}

describe.each(MARKDOWN_ROUTES)("Markdown van $path", (route) => {
  const markdown = markdownFor(route.slug, route.language);

  it("begint met één H1", () => {
    expect(markdown.startsWith("# ")).toBe(true);
    expect(markdown.match(/^# /gm)).toHaveLength(1);
  });

  it("linkt enkel absoluut", () => {
    for (const href of links(markdown)) {
      expect(
        href.startsWith(`${SITE_URL}`) ||
          href.startsWith("https://") ||
          href.startsWith("mailto:"),
        href,
      ).toBe(true);
    }
  });

  it("linkt naar de eigen HTML-versie, llms.txt en de sitemap", () => {
    expect(links(markdown)).toContain(absoluteUrl(route.path));
    expect(links(markdown)).toContain(absoluteUrl("/llms.txt"));
    expect(links(markdown)).toContain(absoluteUrl("/sitemap.xml"));
  });

  it("bevat geen ongevulde waarden", () => {
    expect(markdown).not.toContain("undefined");
    expect(markdown).not.toContain("[object Object]");
  });
});

describe("Markdown-inhoud", () => {
  it("de homepage volgt de taal van de URL", () => {
    expect(markdownFor("home", "nl")).toContain(
      placeholderContent.hero.thesis.nl,
    );
    expect(markdownFor("home", "en")).toContain(
      placeholderContent.hero.thesis.en,
    );
    expect(markdownFor("home", "en")).not.toContain(
      placeholderContent.hero.thesis.nl,
    );
  });

  it("de homepage zet de huidige functie bovenaan de ervaring", () => {
    const home = markdownFor("home", "en");
    const experience = home.split("## Experience")[1];
    expect(experience.trimStart()).toMatch(
      new RegExp(`^### ${ROLE.role} — ${ROLE.employer.name}`),
    );
  });

  it("Nidus bevat de architectuur en de volledige decision log", () => {
    const nidus = markdownFor("nidus", "en");
    for (const component of nidusCaseStudy.architecture) {
      expect(nidus).toContain(`| ${component.name} |`);
    }
    for (const entry of nidusCaseStudy.decisionLog) {
      expect(nidus).toContain(`### ${entry.title.en}`);
    }
  });

  it("LOWI bevat alle hoofdstukken", () => {
    const lowi = markdownFor("lowi", "nl");
    for (const chapter of lowiCelHoofdstukken) {
      expect(lowi).toContain(chapter.kernzin.nl);
    }
  });
});

describe("404 in Markdown", () => {
  const markdown = notFoundMarkdown();

  it("linkt naar homepage, sitemap en llms.txt", () => {
    expect(links(markdown)).toEqual(
      expect.arrayContaining([
        absoluteUrl("/"),
        absoluteUrl("/en"),
        absoluteUrl("/sitemap.xml"),
        absoluteUrl("/llms.txt"),
      ]),
    );
  });
});
