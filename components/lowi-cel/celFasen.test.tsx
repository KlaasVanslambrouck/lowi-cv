import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { celLabels, kernzinMarkering } from "@/content/lowiCelTekst";
import { lowiCelHoofdstukken } from "@/content/lowiCellContent";
import CelTekening from "./CelTekening";
import {
  CEL_FASEN,
  HOOFDSTUK_FASE,
  cameraTransform,
  geschatteLabelBreedte,
  labelPlaatsen,
  laagOpaciteit,
  lensVoor,
  mitoTransformen,
} from "./celFasen";

describe("celstanden", () => {
  it("elk hoofdstuk heeft een geldige stand", () => {
    for (const hoofdstuk of lowiCelHoofdstukken) {
      expect(CEL_FASEN).toContain(HOOFDSTUK_FASE[hoofdstuk.id]);
    }
  });

  it("de camera zet het brandpunt in het midden, zoals in Cel.dc.html", () => {
    expect(cameraTransform("overzicht")).toBe("translate(400px, 400px) scale(1) translate(-400px, -405px)");
    expect(cameraTransform("mitochondrien")).toBe("translate(400px, 400px) scale(3.1) translate(-585px, -555px)");
  });

  it("deling vervangt ER, golgi en kern en wisselt de membraanvorm", () => {
    const d2 = laagOpaciteit("deling2");
    expect([d2.ruwER, d2.gladER, d2.golgi, d2.kern]).toEqual([0, 0, 0, 0]);
    expect([d2.membraan, d2.membraanOvaal, d2.membraanInsnoering]).toEqual([0, 1, 0]);
    expect(laagOpaciteit("deling3").blaasjes).toBe(0);
  });

  it("één mitochondrion verhuist in deling 2 en 3; de rest blijft staan", () => {
    const vroeg = mitoTransformen("deling1");
    const laat = mitoTransformen("deling2");
    expect(vroeg.filter((t, i) => t !== laat[i])).toHaveLength(1);
  });

  it("geen detailvergroting op een kleine cel", () => {
    expect(lensVoor("membraan", 520)).toBe("membraan");
    expect(lensVoor("membraan", 240)).toBeNull();
  });
});

describe("labels", () => {
  // 240 px = de sticky cel op een scherm van 320 à 390 px; 520 px = desktop.
  it.each([240, 330, 520])("blijven binnen een cel van %i px breed", (breedte) => {
    for (const fase of CEL_FASEN) {
      for (const taal of ["nl", "en"] as const) {
        for (const label of labelPlaatsen(fase, breedte, (id) => celLabels[id][taal])) {
          const x = (label.links / 100) * breedte;
          // Loopt de tekst om, dan is het label hoogstens punt + lijn + maxbreedte.
          const w = label.maxTekstBreedte
            ? 9 + label.lijnBreedte + label.maxTekstBreedte
            : geschatteLabelBreedte(celLabels[label.id][taal], label.tekstGrootte, label.lijnBreedte);
          const [van, tot] = label.naarRechts ? [x - 4.5, x - 4.5 + w] : [x + 4.5 - w, x + 4.5];
          expect(van, `${fase} ${label.id} ${taal}`).toBeGreaterThanOrEqual(0);
          expect(tot, `${fase} ${label.id} ${taal}`).toBeLessThanOrEqual(breedte);
          expect(label.boven).toBeGreaterThanOrEqual(6);
          expect(label.boven).toBeLessThanOrEqual(92);
        }
      }
    }
  });
});

describe("kernzinmarkering", () => {
  it("markeert alleen letterlijke passages uit de bestaande kernzinnen", () => {
    for (const hoofdstuk of lowiCelHoofdstukken) {
      const markering = kernzinMarkering[hoofdstuk.id];
      expect(hoofdstuk.kernzin.nl).toContain(markering.nl);
      expect(hoofdstuk.kernzin.en).toContain(markering.en);
    }
  });
});

describe("CelTekening zonder JS", () => {
  it("rendert server-side de volledige cel in het overzicht, met bijschrift", () => {
    const markup = renderToStaticMarkup(
      <CelTekening fase="overzicht" bijschrift={{ nl: "Artistieke visualisatie · niet op schaal", en: "x" }} />,
    );
    expect(markup).toContain('role="img"');
    expect(markup).toContain('data-fase="overzicht"');
    expect(markup).toContain("Artistieke visualisatie · niet op schaal");
    expect(markup).toContain("de hele cel");
    // vijf mitochondriën, kern en membraan zitten in de tekening
    expect(markup.match(/<g class="[^"]*mito[^"]*" style="transform/g)).toHaveLength(5);
  });
});
