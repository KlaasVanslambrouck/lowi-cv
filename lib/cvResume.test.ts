import { describe, expect, it } from "vitest";
import { ROLE } from "@/content/role";
import { buildResume } from "./cvResume";

// Regex uit het officiële JSON Resume-schema (definitie "iso8601"):
// jaar, jaar-maand of jaar-maand-dag.
const ISO8601 =
  /^([1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]|[1-2][0-9]{3}-[0-1][0-9]|[1-2][0-9]{3})$/;

// Bewust geen schemavalidator als dependency: het schema kent geen verplichte
// velden, dus de waarde zit in vormcontrole + de fase-logica.
describe("JSON Resume", () => {
  it("heeft enkel bekende secties op de root", () => {
    expect(Object.keys(buildResume()).sort()).toEqual([
      "$schema",
      "basics",
      "education",
      "languages",
      "meta",
      "skills",
      "work",
    ]);
  });

  it("vult basics met strings en een geldige locatie", () => {
    const { basics } = buildResume();

    expect(basics.name).toBe("Klaas Vanslambrouck");
    expect(basics.email).toContain("@");
    expect(basics.url).toMatch(/^https:\/\//);
    expect(basics.summary.length).toBeGreaterThan(80);
    expect(basics.location).toEqual({ city: "Oudenaarde", countryCode: "BE" });
    expect(basics.profiles.length).toBeGreaterThan(0);

    for (const profile of basics.profiles) {
      expect(profile.network).not.toBe("");
      expect(profile.username).not.toBe("");
      expect(profile.url).toMatch(/^https:\/\//);
    }
  });

  it("gebruikt geldige ISO 8601-datums in work en education", () => {
    const resume = buildResume();

    for (const job of resume.work) {
      expect(job.startDate, job.name).toMatch(ISO8601);
      if (job.endDate) expect(job.endDate, job.name).toMatch(ISO8601);
    }
    for (const study of resume.education) {
      expect(study.startDate, study.institution).toMatch(ISO8601);
      if (study.endDate) expect(study.endDate, study.institution).toMatch(ISO8601);
    }
  });

  it("sorteert work omgekeerd chronologisch", () => {
    const starts = buildResume().work.map((job) =>
      job.startDate && job.startDate.length === 4
        ? `${job.startDate}-00`
        : (job.startDate ?? ""),
    );
    const sorted = [...starts].sort((left, right) => right.localeCompare(left));

    expect(starts).toEqual(sorted);
  });

  it("zet in fase incoming de nieuwe functie bovenaan zonder einddatum bij de vorige", () => {
    const resume = buildResume("incoming");
    const [first] = resume.work;
    const previous = resume.work.find(
      (job) => job.name === ROLE.previousRole.employer.name,
    );

    expect(first.name).toBe(ROLE.employer.name);
    expect(first.position).toBe(ROLE.role);
    expect(first.startDate).toBe("2026-10");
    expect(previous?.endDate).toBeUndefined();
    expect(resume.basics.label).toBe(
      `Incoming ${ROLE.role} at ${ROLE.employer.name}`,
    );
  });

  it("sluit in fase current de vorige functie af", () => {
    const resume = buildResume("current");
    const previous = resume.work.find(
      (job) => job.name === ROLE.previousRole.employer.name,
    );

    expect(resume.work[0].name).toBe(ROLE.employer.name);
    expect(previous?.endDate).toBe(ROLE.previousRole.endDate);
    expect(resume.basics.label).toBe(`${ROLE.role} at ${ROLE.employer.name}`);
  });

  it("zet de companyNote in description en houdt name bij de eigennaam", () => {
    const resume = buildResume();
    const freelance = resume.work.find((job) => job.name === "Freelance");
    const egov = resume.work.find((job) => job.name === "EGOV VZW");

    expect(freelance?.description).toBe("various clients, incl. Soundfield NV");
    expect(egov?.description).toBe("project at FPS Finance");
    // Zonder note blijft description weg.
    expect(
      resume.work.find((job) => job.name === ROLE.previousRole.employer.name)
        ?.description,
    ).toBeUndefined();
  });

  it("gebruikt Engelse skill-keywords", () => {
    const skills = buildResume().skills;
    const analysis = skills.find((skill) =>
      skill.name.startsWith("Analysis"),
    );

    expect(analysis?.keywords).toContain("Functional analysis");
    expect(analysis?.keywords).toContain(
      "Translating between business and engineering",
    );
    expect(skills.flatMap((skill) => skill.keywords)).not.toContain(
      "Datapijplijnen",
    );
  });

  it("verwijst in meta naar de eigen URL's", () => {
    const { meta } = buildResume();

    expect(meta.canonical).toMatch(/\/cv\.json$/);
    expect(meta.pdf).toMatch(/\/cv\.pdf$/);
    expect(meta.lastModified).toMatch(ISO8601);
  });
});
