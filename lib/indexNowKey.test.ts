import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { INDEXNOW_KEY } from "./site";

describe("IndexNow-sleutel", () => {
  const keyFile = path.resolve(__dirname, "..", "public", `${INDEXNOW_KEY}.txt`);

  it("heeft het IndexNow-formaat (32 tekens, [a-f0-9])", () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
  });

  it("staat als public/<sleutel>.txt met exact de sleutel als inhoud", () => {
    expect(existsSync(keyFile)).toBe(true);
    expect(readFileSync(keyFile, "utf8")).toBe(INDEXNOW_KEY);
  });
});
