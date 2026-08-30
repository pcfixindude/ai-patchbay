import { describe, expect, it } from "vitest";
import { compatibilityEdges, components, ports } from "@/data/ecosystem";
import type { PathResult } from "@/lib/domain/types";
import { findPaths, rankPaths, routeTrustSummary } from "./index";

const context = { ports, edges: compatibilityEdges, components };

describe("pathfinding", () => {
  it("finds a compatible multi-hop route", () => {
    const paths = findPaths("model-qwen3-coder-gguf", "agent-hermes", context);
    expect(paths[0]?.componentIds).toEqual(["model-qwen3-coder-gguf", "runtime-ollama", "agent-hermes"]);
  });

  it("respects local-only constraints", () => {
    const paths = findPaths("model-qwen3-coder-gguf", "agent-hermes", context, { localOnly: true });
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.componentIds.every((id) => components.find((item) => item.id === id)?.localCapable))).toBe(true);
  });

  it("filters route candidates by declared capabilities and trust policy", () => {
    expect(findPaths("model-qwen3-coder-gguf", "agent-hermes", context, { codingRequired: true, allowInferredUnverifiedRoutes: false })).toEqual([]);
    expect(findPaths("model-qwen3-coder-gguf", "agent-hermes", context, { toolCallingRequired: true, cliRequired: true })).toEqual([]);
    expect(findPaths("model-qwen3-coder-gguf", "agent-hermes", context, { cudaRequired: true })).toEqual([]);
    expect(findPaths("model-qwen3-coder-gguf", "agent-hermes", context, { verifiedOnly: true })[0]?.warnings).toEqual([]);
  });

  it("uses the route trust switches rather than UI-only labels", () => {
    const inferred = { ...compatibilityEdges[0], id: "inferred-route", status: "inferred" as const };
    const community = { ...compatibilityEdges[0], id: "community-route", status: "verified_community" as const };
    const testContext = { ...context, edges: [inferred, community] };
    expect(findPaths("model-qwen3-coder-gguf", "runtime-ollama", testContext, { verifiedOnly: true, allowCommunityRoutes: false })).toEqual([]);
    expect(findPaths("model-qwen3-coder-gguf", "runtime-ollama", testContext, { verifiedOnly: true, allowCommunityRoutes: true })[0]?.edgeIds).toEqual(["community-route"]);
    expect(findPaths("model-qwen3-coder-gguf", "runtime-ollama", testContext, { verifiedOnly: false, allowInferredUnverifiedRoutes: false })[0]?.edgeIds).toEqual(["community-route"]);
    expect(findPaths("model-qwen3-coder-gguf", "runtime-ollama", testContext, { verifiedOnly: false, allowInferredUnverifiedRoutes: true })).toHaveLength(2);
  });

  it("returns no route for an impossible direction", () => {
    expect(findPaths("tool-github", "model-qwen3-coder-gguf", context)).toEqual([]);
  });

  it("ranks verified paths above unverified paths and avoids deprecated edges", () => {
    const candidates: PathResult[] = [
      { componentIds: ["a", "b"], edgeIds: ["edge-mcp-github"], score: 0, warnings: [] },
      { componentIds: ["a", "b"], edgeIds: ["edge-qwen-ollama"], score: 0, warnings: [] },
    ];
    const ranked = rankPaths(candidates, compatibilityEdges);
    expect(ranked[0].edgeIds).toEqual(["edge-qwen-ollama"]);
    expect(ranked[1].warnings).toHaveLength(1);
    expect(ranked[0].explanation).toContain("1 strong-trust edge");
  });

  it("reports exact trust, stale, and deprecated composition", () => {
    const staleCommunity = { ...compatibilityEdges[0], id: "stale-community", status: "verified_community" as const, lastVerifiedAt: "2020-01-01" };
    const inferred = { ...compatibilityEdges[1], id: "inferred-summary", status: "inferred" as const };
    const path: PathResult = { componentIds: ["model-qwen3-coder-gguf", "runtime-ollama", "agent-hermes"], edgeIds: ["stale-community", "inferred-summary"], score: 0, warnings: [] };
    expect(routeTrustSummary(path, [staleCommunity, inferred], components)).toMatchObject({ totalEdges: 2, verifiedCommunity: 1, inferred: 1, unverified: 0, staleEdges: 1, deprecatedComponents: 0, weakestTrust: "inferred" });
  });
});
