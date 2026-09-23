import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  assertProductionSiteUrl,
  buildIndexNowPayload,
  urlsFromSitemap,
} from "./indexNow";
import { PUBLIC_ROUTES, absoluteUrl, localizedPath } from "./site";

const KEY = "0123456789abcdef0123456789abcdef";

describe("IndexNow", () => {
  it("neemt de URL's uit de sitemap, dus ook de /en-versies", async () => {
    expect(urlsFromSitemap(await sitemap())).toEqual(
      PUBLIC_ROUTES.flatMap((route) =>
        route.localized
          ? [
              absoluteUrl(localizedPath(route.path, "nl")),
              absoluteUrl(localizedPath(route.path, "en")),
            ]
          : [absoluteUrl(route.path)],
      ),
    );
  });

  it("weigert http en vercel.app", () => {
    expect(() =>
      assertProductionSiteUrl("http://klaasvanslambrouck.dev"),
    ).toThrow(/https:\/\//);
    expect(() =>
      assertProductionSiteUrl("https://lowiklaasvanslambrouck.vercel.app"),
    ).toThrow(/vercel/i);
  });

  it("bouwt host, keyLocation en urlList voor de productiesite", () => {
    const payload = buildIndexNowPayload("https://klaasvanslambrouck.dev", KEY, [
      "https://klaasvanslambrouck.dev/",
      "https://klaasvanslambrouck.dev/nidus",
    ]);

    expect(payload).toEqual({
      host: "klaasvanslambrouck.dev",
      key: KEY,
      keyLocation: `https://klaasvanslambrouck.dev/${KEY}.txt`,
      urlList: [
        "https://klaasvanslambrouck.dev/",
        "https://klaasvanslambrouck.dev/nidus",
      ],
    });
  });

  it("weigert URL's van een andere host", () => {
    expect(() =>
      buildIndexNowPayload("https://klaasvanslambrouck.dev", KEY, [
        "https://example.com/",
      ]),
    ).toThrow(/example\.com/);
  });
});
