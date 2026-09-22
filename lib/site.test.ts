import { describe, expect, it } from "vitest";
import { localizedPath } from "@/lib/site";

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
