import { describe, expect, it } from "vitest";
import {
  ROLE,
  ROLE_START_LABEL,
  ROLE_START_MONTH,
  formatLongDate,
  siteDescriptionFor,
  siteTitleFor,
} from "./role";
import type { Language, RolePhase } from "@/types/content";

const LANGUAGES: readonly Language[] = ["nl", "en"];
const PHASES: readonly RolePhase[] = ["incoming", "current"];

describe("formatLongDate", () => {
  it("zet een ISO-datum om naar leesbare NL- en EN-tekst", () => {
    expect(formatLongDate("2026-10-05")).toEqual({
      nl: "5 oktober 2026",
      en: "5 October 2026",
    });
    expect(formatLongDate("2027-01-31")).toEqual({
      nl: "31 januari 2027",
      en: "31 January 2027",
    });
  });

  it("weigert een onvolledige of onbestaande datum", () => {
    expect(() => formatLongDate("2026-10")).toThrow();
    expect(() => formatLongDate("2026-13-01")).toThrow();
  });
});

describe("afgeleide rolcopy", () => {
  it("leidt de zichtbare startdatum af uit ROLE.startDate", () => {
    expect(ROLE.startDate).toBe("2026-10-05");
    expect(ROLE_START_LABEL).toEqual(formatLongDate(ROLE.startDate));
    // De maand voor /cv.json verandert niet door de dag.
    expect(ROLE_START_MONTH).toBe("2026-10");
  });

  it("houdt titel en description binnen de SEO-grenzen, in beide talen en fases", () => {
    for (const phase of PHASES) {
      for (const language of LANGUAGES) {
        expect(siteTitleFor(language, phase).length).toBeLessThanOrEqual(60);

        const description = siteDescriptionFor(language, phase);
        expect(description.length).toBeGreaterThanOrEqual(140);
        expect(description.length).toBeLessThanOrEqual(160);
      }
    }
  });

  it("noemt de startdatum in de incoming-fase, in de taal van de pagina", () => {
    expect(siteDescriptionFor("nl", "incoming")).toContain(ROLE_START_LABEL.nl);
    expect(siteDescriptionFor("en", "incoming")).toContain(ROLE_START_LABEL.en);
    // Na de start is de datum geen nieuws meer.
    expect(siteDescriptionFor("nl", "current")).not.toContain(ROLE_START_LABEL.nl);
    expect(siteDescriptionFor("en", "current")).not.toContain(ROLE_START_LABEL.en);
  });

  it("gebruikt in beide talen dezelfde titel: de rolnaam is Engels", () => {
    for (const phase of PHASES) {
      expect(siteTitleFor("nl", phase)).toBe(siteTitleFor("en", phase));
    }
  });
});
