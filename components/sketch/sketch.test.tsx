import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Arrow from "./Arrow";
import Connector from "./Connector";
import Highlight from "./Highlight";
import MarginNote from "./MarginNote";
import Stamp from "./Stamp";
import Strike from "./Strike";
import Underline from "./Underline";

// Server-render: zo ziet een bezoeker zonder JS de accenten.
describe("schetsaccenten", () => {
  it("houden de tekst als echte tekst en verbergen alleen de decoratie", () => {
    const markup = renderToStaticMarkup(
      <p>
        <Highlight>werkende systemen</Highlight>{" "}
        <Underline>onderzoek</Underline>{" "}
        <MarginNote>hier werk ik</MarginNote>{" "}
        <Stamp>Start 5 oktober 2026</Stamp>
      </p>,
    );

    for (const text of [
      "werkende systemen",
      "onderzoek",
      "hier werk ik",
      "Start 5 oktober 2026",
    ]) {
      expect(markup).toContain(text);
    }
    const svgTags = markup.match(/<svg[^>]*>/g) ?? [];
    expect(svgTags.length).toBeGreaterThan(0);
    for (const tag of svgTags) {
      expect(tag).toContain('aria-hidden="true"');
    }
  });

  it("Strike geeft screenreaders beide versies via del en ins", () => {
    const markup = renderToStaticMarkup(
      <Strike to="een werkend systeem">Een idee</Strike>,
    );
    expect(markup).toMatch(/<del[^>]*>Een idee<svg/);
    expect(markup).toMatch(/<ins[^>]*>een werkend systeem<\/ins>/);
  });

  it("Arrow en Connector zijn volledig decoratief", () => {
    for (const markup of [
      renderToStaticMarkup(<Arrow />),
      renderToStaticMarkup(<Connector />),
    ]) {
      expect(markup).toMatch(/^<svg[^>]*aria-hidden="true"/);
    }
  });
});
