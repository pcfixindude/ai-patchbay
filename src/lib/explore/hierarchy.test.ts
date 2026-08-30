import { describe, expect, it } from "vitest";
import { compatibilityEdges, components, ports } from "@/data/ecosystem";
import { expandedWithAncestors, visibleHierarchyComponents, visibleHierarchyEdges } from "./hierarchy";

describe("explore hierarchy", () => {
  it("keeps descendants hidden until their parent is expanded", () => {
    const visible = visibleHierarchyComponents(components, new Set());
    expect(visible.has("org-nous")).toBe(true);
    expect(visible.has("family-hermes")).toBe(false);
    const expanded = visibleHierarchyComponents(components, new Set(["org-nous"]));
    expect(expanded.has("family-hermes")).toBe(true);
  });

  it("reveals a search target by expanding its ancestors without changing unrelated branches", () => {
    const expanded = expandedWithAncestors("model-qwen3-coder-gguf", components, new Set(["org-nous"]));
    expect(expanded).toEqual(new Set(["org-nous", "org-alibaba"]));
  });

  it("renders only edges whose endpoint components are visible", () => {
    const hidden = visibleHierarchyEdges(compatibilityEdges, ports, new Set(["org-nous"]));
    expect(hidden).toEqual([]);
    const visible = visibleHierarchyEdges(compatibilityEdges, ports, new Set(["model-qwen3-coder-gguf", "runtime-ollama", "agent-hermes"]));
    expect(visible.map((edge) => edge.id)).toContain("edge-qwen-ollama");
  });
});
