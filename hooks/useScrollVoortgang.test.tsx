// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { laatsteBovenLijn, useScrollVoortgang } from "./useScrollVoortgang";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("laatsteBovenLijn", () => {
  const top = (y: number) => y;

  it("geeft het laatste element boven de lijn", () => {
    expect(laatsteBovenLijn([-500, 100, 380, 700], top, 400)).toBe(380);
  });

  it("geeft null zolang niets de lijn gepasseerd is", () => {
    expect(laatsteBovenLijn([450, 900], top, 400)).toBeNull();
  });
});

// Bovenranden per element; de test "scrolt" door ze aan te passen.
const bovenranden = new Map<string, number>();

// requestAnimationFrame is asynchroon: callbacks wachten tot de test ze afspeelt.
let frames: FrameRequestCallback[] = [];

function speelFramesAf() {
  const nu = frames;
  frames = [];
  for (const callback of nu) callback(0);
}

function Pagina({ onStaat }: { onStaat: (fase: string | null, index: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { actieveFase, actiefHoofdstukIndex } = useScrollVoortgang(ref);
  onStaat(actieveFase, actiefHoofdstukIndex);
  return (
    <div ref={ref}>
      <header data-phase="overzicht" data-test="intro" />
      <section data-section-id="lowi-cel-grens" data-phase="membraan" data-test="grens" />
      <section data-section-id="lowi-cel-groei" data-phase="deling1" data-test="groei">
        <ol>
          <li data-phase="deling1" data-test="stap1" />
          <li data-phase="deling2" data-test="stap2" />
          <li data-phase="deling3" data-test="stap3" />
        </ol>
      </section>
    </div>
  );
}

describe("useScrollVoortgang", () => {
  let container: HTMLDivElement;
  let root: Root;
  let staat: { fase: string | null; index: number };

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { top: bovenranden.get(this.dataset.test ?? "") ?? 9999 } as DOMRect;
    });
    // viewport 800 px hoog: de lijn ligt op 400 px
    vi.stubGlobal("innerHeight", 800);

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    staat = { fase: null, index: -1 };
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    bovenranden.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function scrol(posities: Record<string, number>) {
    for (const [naam, top] of Object.entries(posities)) bovenranden.set(naam, top);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      speelFramesAf();
    });
  }

  it("volgt hoofdstukken en de drie deelstanden, zonder extra hoofdstukken", () => {
    bovenranden.set("intro", 0);
    act(() => root.render(<Pagina onStaat={(fase, index) => (staat = { fase, index })} />));
    act(() => speelFramesAf());
    expect(staat).toEqual({ fase: "overzicht", index: -1 });

    scrol({ intro: -900, grens: 120 });
    expect(staat).toEqual({ fase: "membraan", index: 0 });

    scrol({ grens: -1200, groei: 200, stap1: 300, stap2: 600, stap3: 900 });
    expect(staat).toEqual({ fase: "deling1", index: 1 });

    scrol({ groei: -300, stap1: -200, stap2: 350, stap3: 700 });
    expect(staat).toEqual({ fase: "deling2", index: 1 });

    scrol({ groei: -700, stap1: -600, stap2: -250, stap3: 390 });
    // deling3 is nog altijd hoofdstuk 2 (index 1): de deelstanden tellen niet mee
    expect(staat).toEqual({ fase: "deling3", index: 1 });
  });
});
