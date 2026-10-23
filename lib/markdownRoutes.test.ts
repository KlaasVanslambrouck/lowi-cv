import { describe, expect, it } from "vitest";
import { MARKDOWN_ROUTES, markdownDestination } from "./markdownRoutes";
import { PUBLIC_ROUTES, localizedPath } from "./site";

// lib/markdownRoutes.ts schrijft de paden uit (next.config.ts mag geen
// "@/"-imports volgen); deze tests houden ze gelijk aan lib/site.ts.
describe("MARKDOWN_ROUTES", () => {
  it("dekt elke vertaalde publieke pagina in beide talen", () => {
    const expected = PUBLIC_ROUTES.filter((route) => route.localized).flatMap(
      (route) => [localizedPath(route.path, "nl"), localizedPath(route.path, "en")],
    );

    expect(MARKDOWN_ROUTES.map((route) => route.path).sort()).toEqual(
      [...expected].sort(),
    );
  });

  it("path is localizedPath(basePath, language)", () => {
    for (const route of MARKDOWN_ROUTES) {
      expect(route.path).toBe(localizedPath(route.basePath, route.language));
    }
  });

  it("geeft elke route een eigen interne bestemming", () => {
    const destinations = MARKDOWN_ROUTES.map(markdownDestination);
    expect(new Set(destinations).size).toBe(destinations.length);
  });
});
