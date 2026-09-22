import { describe, expect, it } from "vitest";
import {
  ROLE,
  ROLE_START_LABEL,
  ROLE_START_MONTH,
  formatLongDate,
  siteDescription,
  siteTitle,
} from "./role";

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

  it("houdt titel en description binnen de SEO-grenzen", () => {
    expect(siteTitle.length).toBeLessThanOrEqual(60);
    expect(siteDescription.length).toBeGreaterThanOrEqual(140);
    expect(siteDescription.length).toBeLessThanOrEqual(160);
    expect(siteDescription).toContain(ROLE_START_LABEL.nl);
  });
});
