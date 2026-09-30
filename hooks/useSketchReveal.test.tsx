// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSketchReveal } from "./useSketchReveal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit = {},
  ) {
    FakeObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  disconnect() {
    this.disconnected = true;
  }

  unobserve() {}

  takeRecords() {
    return [];
  }

  // Meting met de bovenrand van het element op `top` px (viewport: 768 px).
  emit(top: number, isIntersecting: boolean, intersectionRatio = 0) {
    const entry = { boundingClientRect: { top }, isIntersecting, intersectionRatio };
    act(() => {
      this.callback(
        [entry as unknown as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    });
  }
}

function Probe({ enabled }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useSketchReveal(ref, { enabled });
  return <div ref={ref} data-state={state} />;
}

let container: HTMLDivElement;
let root: Root;

function mount(enabled?: boolean) {
  act(() => root.render(<Probe enabled={enabled} />));
}

function state() {
  return container.firstElementChild?.getAttribute("data-state");
}

// De hook maakt er twee: één op de drempellijn, één voor "volledig in beeld".
function lineObserver() {
  const observer = FakeObserver.instances.find((o) => o.options.rootMargin);
  if (!observer) throw new Error("geen lijn-observer aangemaakt");
  return observer;
}

function fullObserver() {
  const observer = FakeObserver.instances.find((o) => o.options.threshold !== undefined);
  if (!observer) throw new Error("geen volledig-in-beeld-observer aangemaakt");
  return observer;
}

function allDisconnected() {
  return FakeObserver.instances.every((o) => o.disconnected);
}

function stubReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe("useSketchReveal", () => {
  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    stubReducedMotion(false);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("rendert server-side in de eindtoestand (inhoud zichtbaar zonder JS)", () => {
    expect(renderToString(<Probe />)).toContain('data-state="on"');
  });

  it("wacht onder de viewport en tekent eenmalig zodra het de lijn passeert", () => {
    mount();
    expect(lineObserver().options.rootMargin).toBe("0px 0px -18% 0px");

    lineObserver().emit(2000, false);
    fullObserver().emit(2000, false);
    expect(state()).toBe("wait");

    lineObserver().emit(500, true);
    expect(state()).toBe("on");
    expect(allDisconnected()).toBe(true);
  });

  it("tekent onderaan de pagina zodra het volledig in beeld staat", () => {
    mount();
    lineObserver().emit(2000, false);
    expect(state()).toBe("wait");

    // Niet verder te scrollen: de lijn wordt nooit gehaald, maar alles is zichtbaar.
    fullObserver().emit(700, true, 0.5);
    expect(state()).toBe("wait");
    fullObserver().emit(690, true, 0.97);
    expect(state()).toBe("on");
    expect(allDisconnected()).toBe(true);
  });

  it("houdt de eindtoestand voor wat bij het laden al zichtbaar is", () => {
    mount();
    // Deels zichtbaar maar nog onder de drempel: toch niet verbergen.
    lineObserver().emit(700, false);
    expect(state()).toBe("on");
    expect(allDisconnected()).toBe(true);
  });

  it("houdt de eindtoestand voor wat erboven ligt (geopend via anker)", () => {
    mount();
    lineObserver().emit(-1200, false);
    expect(state()).toBe("on");
  });

  it("toont de eindtoestand bij afdrukken", () => {
    mount();
    lineObserver().emit(2000, false);
    expect(state()).toBe("wait");

    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });
    expect(state()).toBe("on");
    expect(allDisconnected()).toBe(true);
  });

  it("blijft in de eindtoestand bij reduced motion, zonder observer", () => {
    stubReducedMotion(true);
    mount();
    expect(FakeObserver.instances).toHaveLength(0);
    expect(state()).toBe("on");
  });

  it("blijft in de eindtoestand zonder IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    mount();
    expect(state()).toBe("on");
  });

  it("maakt geen observer aan als enabled false is", () => {
    mount(false);
    expect(FakeObserver.instances).toHaveLength(0);
    expect(state()).toBe("on");
  });

  it("ruimt de observers op bij unmount", () => {
    mount();
    expect(FakeObserver.instances).toHaveLength(2);
    act(() => root.render(<></>));
    expect(allDisconnected()).toBe(true);
  });
});
