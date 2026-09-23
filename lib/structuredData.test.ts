import { describe, expect, it } from "vitest";
import { schemaRole } from "@/content/role";
import { absoluteUrl, localizedPath } from "@/lib/site";
import {
  PERSON_ID,
  homeGraph,
  lowiGraph,
  nidusGraph,
  type StructuredDataNode,
} from "@/lib/structuredData";
import type { Language } from "@/types/content";

const LANGUAGES = ["nl", "en"] as const;

const PAGES = [
  { basePath: "/", graph: homeGraph },
  { basePath: "/nidus", graph: nidusGraph },
  { basePath: "/lowi", graph: lowiGraph },
] as const satisfies readonly {
  basePath: `/${string}`;
  graph: (language: Language) => readonly StructuredDataNode[];
}[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Elke @id die de graaf zelf definieert: een node met een @type.
function definedIds(graph: readonly StructuredDataNode[]): Set<string> {
  const ids = new Set<string>();
  for (const node of graph) {
    if (isRecord(node) && typeof node["@type"] === "string") {
      const id = node["@id"];
      if (typeof id === "string") ids.add(id);
    }
  }
  return ids;
}

// Elke @id waarnaar binnen een node verwezen wordt ({ "@id": … } zonder @type).
function referencedIds(graph: readonly StructuredDataNode[]): string[] {
  const references: string[] = [];

  function walk(value: unknown, isNodeRoot: boolean): void {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, false);
      return;
    }
    if (!isRecord(value)) return;

    const id = value["@id"];
    if (!isNodeRoot && typeof id === "string" && value["@type"] === undefined) {
      references.push(id);
    }

    for (const [key, child] of Object.entries(value)) {
      if (key === "@id" || key === "@type") continue;
      walk(child, false);
    }
  }

  for (const node of graph) walk(node, true);
  return references;
}

// De nodes zijn smalle interfaces; voor generieke controles lezen we ze als
// een gewone record (via unknown, want ze hebben geen index-signature).
function asRecords(
  graph: readonly StructuredDataNode[],
): Record<string, unknown>[] {
  return graph as unknown as Record<string, unknown>[];
}

const PAGE_TYPES = ["WebPage", "ProfilePage"];

function isPageNode(node: Record<string, unknown>): boolean {
  return typeof node["@type"] === "string" && PAGE_TYPES.includes(node["@type"]);
}

function nodesWithLanguage(
  graph: readonly StructuredDataNode[],
  language: Language,
): Record<string, unknown>[] {
  return asRecords(graph).filter((node) => node.inLanguage === language);
}

function personNode(
  graph: readonly StructuredDataNode[],
): Record<string, unknown> {
  const node = asRecords(graph).find((entry) => entry["@type"] === "Person");
  if (!node) throw new Error("geen Person-node in deze graaf");
  return node;
}

function pageNode(
  graph: readonly StructuredDataNode[],
): Record<string, unknown> {
  const node = asRecords(graph).find(isPageNode);
  if (!node) throw new Error("geen paginanode in deze graaf");
  return node;
}

describe.each(PAGES)("JSON-LD van $basePath", ({ basePath, graph }) => {
  it.each(LANGUAGES)("%s: precies één node met inLanguage van deze taal", (language) => {
    const matching = nodesWithLanguage(graph(language), language);
    expect(matching).toHaveLength(1);
    expect(matching[0]["@id"]).toBe(
      `${absoluteUrl(localizedPath(basePath, language))}#${
        basePath === "/" ? "profilepage" : "webpage"
      }`,
    );
  });

  it.each(LANGUAGES)("%s: de paginanode wijst naar zichzelf", (language) => {
    expect(pageNode(graph(language)).url).toBe(
      absoluteUrl(localizedPath(basePath, language)),
    );
  });

  it("de paginanodes van NL en EN hebben een verschillende @id", () => {
    expect(pageNode(graph("nl"))["@id"]).not.toBe(pageNode(graph("en"))["@id"]);
  });

  it("de Person-@id is in beide talen identiek", () => {
    expect(personNode(graph("nl"))["@id"]).toBe(PERSON_ID);
    expect(personNode(graph("en"))["@id"]).toBe(PERSON_ID);
  });

  it.each(LANGUAGES)("%s: elke verwijzing bestaat in dezelfde graaf", (language) => {
    const nodes = graph(language);
    const defined = definedIds(nodes);
    const missing = referencedIds(nodes).filter((id) => !defined.has(id));
    expect(missing).toEqual([]);
  });

  it("alles behalve de paginanode is in beide talen identiek", () => {
    const withoutPage = (language: Language) =>
      asRecords(graph(language)).filter((node) => !isPageNode(node));
    // De entiteiten (Person, LOWI, Nidus) beschrijven dezelfde dingen, dus
    // hun Engelse teksten mogen niet per taalversie verschillen.
    expect(JSON.stringify(withoutPage("nl"))).toBe(
      JSON.stringify(withoutPage("en")),
    );
  });
});

describe("Person en WebSite", () => {
  it("Person houdt de Engelse velden uit de content", () => {
    const person = personNode(homeGraph("nl"));
    expect(person.jobTitle).toBe(schemaRole.jobTitle);
    expect(person.knowsAbout).toEqual(personNode(homeGraph("en")).knowsAbout);
    // Steekproef: de knowsAbout-termen zijn Engels, niet vertaald.
    expect(person.knowsAbout).toContain("functional analysis");
  });

  it("WebSite is één node voor beide talen", () => {
    const website = asRecords(homeGraph("nl")).find(
      (node) => node["@type"] === "WebSite",
    );
    expect(website?.inLanguage).toEqual(["nl", "en"]);
    expect(nodesWithLanguage(homeGraph("nl"), "nl")).toHaveLength(1);
  });
});
