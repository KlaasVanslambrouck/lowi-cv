import { describe, expect, it } from "vitest";
import {
  PUBLIC_ROUTES,
  SITE_URL,
  absoluteUrl,
  basePathOf,
  isLocalizedPath,
  languageOfPath,
  localizedPath,
} from "@/lib/site";

describe("localizedPath", () => {
  it("laat Nederlandse paden ongemoeid", () => {
    expect(localizedPath("/", "nl")).toBe("/");
    expect(localizedPath("/nidus", "nl")).toBe("/nidus");
    expect(localizedPath("/#projects", "nl")).toBe("/#projects");
  });

  it("zet Engelse paden onder /en", () => {
    expect(localizedPath("/nidus", "en")).toBe("/en/nidus");
    expect(localizedPath("/lowi", "en")).toBe("/en/lowi");
    expect(localizedPath("/nidus#nidus-architectuur", "en")).toBe(
      "/en/nidus#nidus-architectuur",
    );
  });

  it("geeft de Engelse homepage zonder trailing slash", () => {
    expect(localizedPath("/", "en")).toBe("/en");
    expect(localizedPath("/#projects", "en")).toBe("/en#projects");
  });

  it("weigert externe en al geprefixte paden", () => {
    expect(() => localizedPath("https://example.com", "en")).toThrow();
    expect(() => localizedPath("/en/nidus", "en")).toThrow();
    expect(() => localizedPath("/en", "nl")).toThrow();
  });
});

describe("basePathOf", () => {
  it("haalt het /en-prefix weg", () => {
    expect(basePathOf("/en")).toBe("/");
    expect(basePathOf("/en/nidus")).toBe("/nidus");
    expect(basePathOf("/en/lowi")).toBe("/lowi");
  });

  it("laat Nederlandse paden ongemoeid", () => {
    expect(basePathOf("/")).toBe("/");
    expect(basePathOf("/nidus")).toBe("/nidus");
    expect(basePathOf("/cases/linguix")).toBe("/cases/linguix");
  });

  it("ziet een pad dat alleen met 'en' begint niet als Engels", () => {
    expect(basePathOf("/energie")).toBe("/energie");
  });

  it("vormt met localizedPath een heen-en-terug voor elke vertaalde route", () => {
    for (const route of PUBLIC_ROUTES.filter((entry) => entry.localized)) {
      for (const language of ["nl", "en"] as const) {
        expect(basePathOf(localizedPath(route.path, language))).toBe(route.path);
      }
    }
  });
});

describe("isLocalizedPath", () => {
  it("is waar voor de pagina's met een Engelse versie", () => {
    expect(isLocalizedPath("/")).toBe(true);
    expect(isLocalizedPath("/nidus")).toBe(true);
    expect(isLocalizedPath("/lowi")).toBe(true);
  });

  it("is onwaar voor NL-only routes en machinebestanden", () => {
    expect(isLocalizedPath("/cases/linguix")).toBe(false);
    expect(isLocalizedPath("/beheer")).toBe(false);
    expect(isLocalizedPath("/cv.json")).toBe(false);
    expect(isLocalizedPath("/cv.pdf")).toBe(false);
  });
});

describe("absoluteUrl", () => {
  it("geeft de homepage zonder trailing slash", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL);
    expect(absoluteUrl(localizedPath("/", "en"))).toBe(`${SITE_URL}/en`);
  });

  it("plakt andere paden achter de basis-URL", () => {
    expect(absoluteUrl("/nidus")).toBe(`${SITE_URL}/nidus`);
    expect(absoluteUrl("nidus")).toBe(`${SITE_URL}/nidus`);
  });
});

describe("languageOfPath", () => {
  it("leidt de taal af uit het pad", () => {
    expect(languageOfPath("/")).toBe("nl");
    expect(languageOfPath("/nidus")).toBe("nl");
    expect(languageOfPath("/cases/linguix")).toBe("nl");
    expect(languageOfPath("/en")).toBe("en");
    expect(languageOfPath("/en/nidus")).toBe("en");
  });

  it("ziet een pad dat toevallig met 'en' begint als Nederlands", () => {
    expect(languageOfPath("/energie")).toBe("nl");
  });

  it("klopt voor elke gelokaliseerde route in beide talen", () => {
    for (const route of PUBLIC_ROUTES.filter((entry) => entry.localized)) {
      for (const language of ["nl", "en"] as const) {
        expect(languageOfPath(localizedPath(route.path, language))).toBe(language);
      }
    }
  });
});
