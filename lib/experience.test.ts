import { describe, expect, it } from "vitest";
import { ROLE } from "@/content/role";
import { buildResume } from "./cvResume";
import { experienceFor } from "./experience";

// De site (tijdlijn) en /cv.json lezen dezelfde functie; deze tests bewaken
// dat ze in beide fases hetzelfde vertellen.
describe("loopbaanlijst per rolfase", () => {
  it("markeert precies één huidige functie per fase", () => {
    for (const phase of ["incoming", "current"] as const) {
      const current = experienceFor(phase).filter((entry) => entry.isCurrent);
      expect(current, phase).toHaveLength(1);
    }
  });

  it("noemt in incoming Itineris de huidige functie, en In The Pocket nog niet", () => {
    const entries = experienceFor("incoming");
    const current = entries.find((entry) => entry.isCurrent);
    const newRole = entries.find(
      (entry) => entry.company === ROLE.employer.name,
    );

    expect(current?.company).toBe(ROLE.previousRole.employer.name);
    expect(current?.endDate).toBeUndefined();
    expect(current?.periodLabel?.nl).toBe("juni 2022 — heden");
    expect(current?.explanationId).toBe("current-experience");
    expect(newRole?.isCurrent).toBe(false);
    expect(newRole?.explanationId).toBeUndefined();
    expect(newRole?.periodLabel?.nl).toBe("vanaf okt 2026");
  });

  it("schuift in current de huidige functie op naar In The Pocket", () => {
    const entries = experienceFor("current");
    const current = entries.find((entry) => entry.isCurrent);
    const previous = entries.find(
      (entry) => entry.company === ROLE.previousRole.employer.name,
    );

    expect(current?.company).toBe(ROLE.employer.name);
    expect(current?.endDate).toBeUndefined();
    expect(previous?.endDate).toBe(ROLE.previousRole.endDate);
    expect(previous?.periodLabel?.nl).toBe("juni 2022 — sep 2026");
    expect(previous?.explanationId).toBeUndefined();
  });

  it("toont in current geen uitlegknop zolang er geen tekst is", () => {
    // CURRENT_EXPERIENCE_EXPLANATION_ID.current is null (TODO in role.ts).
    const withExplanation = experienceFor("current").filter(
      (entry) => entry.explanationId !== undefined,
    );

    expect(withExplanation).toHaveLength(0);
  });

  it("laat site en /cv.json dezelfde huidige functie zien", () => {
    for (const phase of ["incoming", "current"] as const) {
      const timelineCurrent = experienceFor(phase).find(
        (entry) => entry.isCurrent,
      );
      // In /cv.json is dat de bovenste entry zonder endDate die al gestart is.
      const resumeCurrent = buildResume(phase).work.find(
        (job) =>
          job.endDate === undefined &&
          (phase === "current" || job.name !== ROLE.employer.name),
      );

      expect(resumeCurrent?.name, phase).toBe(timelineCurrent?.company);
    }
  });

  it("geeft In The Pocket een Engelse summary in /cv.json", () => {
    for (const phase of ["incoming", "current"] as const) {
      const newRole = buildResume(phase).work.find(
        (job) => job.name === ROLE.employer.name,
      );
      expect(newRole?.summary, phase).toContain("AI ambition to adoption");
    }
  });

  it("bevat In The Pocket in beide fases, als laatste (nieuwste) entry", () => {
    for (const phase of ["incoming", "current"] as const) {
      const entries = experienceFor(phase);
      expect(entries.at(-1)?.company, phase).toBe(ROLE.employer.name);
      // In /cv.json staat diezelfde functie juist bovenaan.
      expect(buildResume(phase).work[0].name, phase).toBe(ROLE.employer.name);
    }
  });
});
