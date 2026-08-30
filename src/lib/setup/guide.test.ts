import { describe, expect, it } from "vitest";
import { bootstrapEcosystem } from "@/data/ecosystem";
import type { SavedBuild } from "@/lib/domain/schemas";
import type { SetupRecipe } from "./schemas";
import { SetupDependencyCycleError, SetupPlaceholderError, generateSetupGuide, resolveSetupPlaceholders } from "./guide";

const build: SavedBuild = {
  version: 1,
  name: "Local Qwen",
  nodes: [
    { instanceId: "qwen", componentId: "model-qwen3-coder-gguf", position: { x: 0, y: 0 } },
    { instanceId: "ollama", componentId: "runtime-ollama", position: { x: 1, y: 0 } },
  ],
  connections: [{ id: "qwen-to-ollama", sourceNodeId: "qwen", sourcePortId: "qwen-gguf-out", targetNodeId: "ollama", targetPortId: "ollama-model-in" }],
};

const recipe = (id: string, kind: "component" | "edge", target: string, overrides: Partial<SetupRecipe> = {}): SetupRecipe => ({
  id,
  kind,
  ...(kind === "component" ? { componentId: target } : { edgeId: target }),
  title: id,
  sourceIds: ["source-ollama-import"],
  lastVerifiedAt: "2026-08-29",
  platforms: ["macOS", "Linux", "Windows"],
  dependsOn: [],
  variables: [],
  steps: [{ id: `${id}-step`, title: `${id} step`, description: "Configure it.", sourceId: "source-ollama-import", lastVerifiedAt: "2026-08-29", platforms: ["generic"], validation: "It works.", required: true, order: 0, dependsOn: [], variables: [] }],
  ...overrides,
} as SetupRecipe);

const fullRecipes = [
  recipe("qwen", "component", "model-qwen3-coder-gguf"),
  recipe("ollama", "component", "runtime-ollama"),
  recipe("qwen-ollama", "edge", "edge-qwen-ollama", { dependsOn: ["qwen", "ollama"] }),
];

describe("setup guide generation", () => {
  it("makes a complete, deterministically ordered guide only when both component and edge recipes exist", () => {
    const guide = generateSetupGuide(build, bootstrapEcosystem, { recipes: fullRecipes, now: new Date("2026-09-01") });
    expect(guide).toMatchObject({ coverage: "full", coveredConnections: 1, totalConnections: 1, confidence: "First-party verified", freshness: "current" });
    expect(guide.steps.map((step) => step.recipeId)).toEqual(["ollama", "qwen-ollama"]);
  });

  it("keeps available instructions when component coverage is incomplete", () => {
    const guide = generateSetupGuide(build, bootstrapEcosystem, { recipes: fullRecipes.filter((item) => item.id !== "ollama"), now: new Date("2026-09-01") });
    expect(guide.coverage).toBe("partial");
    expect(guide.missingComponents).toEqual(["runtime-ollama"]);
    expect(guide.steps.map((step) => step.recipeId)).toContain("qwen-ollama");
  });

  it("reports a missing edge recipe without claiming coverage from catalog presence", () => {
    const guide = generateSetupGuide(build, bootstrapEcosystem, { recipes: fullRecipes.filter((item) => item.kind !== "edge"), now: new Date("2026-09-01") });
    expect(guide).toMatchObject({ coverage: "partial", coveredConnections: 0, missingConnections: ["qwen-to-ollama"] });
  });

  it("honors explicit recipe dependencies", () => {
    const guide = generateSetupGuide(build, bootstrapEcosystem, { recipes: [...fullRecipes.slice(0, 2), recipe("qwen-ollama", "edge", "edge-qwen-ollama", { dependsOn: ["qwen"] })] });
    expect(guide.steps.map((step) => step.recipeId).indexOf("qwen")).toBeLessThan(guide.steps.map((step) => step.recipeId).indexOf("qwen-ollama"));
  });

  it("rejects recipe dependency cycles", () => {
    const cyclicBuild = { ...build, nodes: [{ instanceId: "ollama", componentId: "runtime-ollama", position: { x: 0, y: 0 } }, { instanceId: "hermes", componentId: "agent-hermes", position: { x: 1, y: 0 } }], connections: [] };
    const cyclic = [recipe("ollama", "component", "runtime-ollama", { dependsOn: ["hermes"] }), recipe("hermes", "component", "agent-hermes", { dependsOn: ["ollama"] })];
    expect(() => generateSetupGuide(cyclicBuild, bootstrapEcosystem, { recipes: cyclic })).toThrow(SetupDependencyCycleError);
  });

  it("marks old recipes stale and lowers the guide confidence", () => {
    const stale = fullRecipes.map((item) => ({ ...item, lastVerifiedAt: "2020-01-01" }));
    const guide = generateSetupGuide(build, bootstrapEcosystem, { recipes: stale, now: new Date("2026-09-01") });
    expect(guide).toMatchObject({ freshness: "stale", confidence: "Incomplete" });
    expect(guide.staleRecipeIds).toHaveLength(2);
  });

  it("requires declared variables and resolves declared placeholders", () => {
    const declarations = [{ name: "BASE_URL", description: "Local endpoint", required: true, secret: false }];
    expect(resolveSetupPlaceholders("Use {{BASE_URL}}", { BASE_URL: "http://localhost:11434" }, declarations)).toBe("Use http://localhost:11434");
    expect(() => resolveSetupPlaceholders("Use {{BASE_URL}}", {}, declarations)).toThrow(SetupPlaceholderError);
    expect(() => resolveSetupPlaceholders("Use {{UNKNOWN}}", {}, declarations)).toThrow(/not declared/);
  });

  it("keeps an unsupplied declared placeholder visible while listing it as required", () => {
    const withVariable = recipe("ollama", "component", "runtime-ollama", {
      variables: [{ name: "BASE_URL", description: "Endpoint", required: true, secret: false }],
      steps: [{ ...fullRecipes[0].steps[0], description: "Use {{BASE_URL}}.", variables: [] }],
    });
    const guide = generateSetupGuide({ ...build, nodes: build.nodes.slice(1), connections: [] }, bootstrapEcosystem, { recipes: [withVariable] });
    expect(guide.requiredVariables.map((variable) => variable.name)).toEqual(["BASE_URL"]);
    expect(guide.steps[0]?.resolvedDescription).toBe("Use {{BASE_URL}}.");
  });

  it("rejects a verified command without a source", () => {
    const invalid = recipe("bad", "component", "model-qwen3-coder-gguf", {
      steps: [{ id: "bad-step", title: "Bad", description: "Bad", sourceId: "source-ollama-import", lastVerifiedAt: "2026-08-29", platforms: ["generic"], required: true, order: 0, dependsOn: [], command: { command: "ollama --version", verified: true }, variables: [] }],
    });
    expect(() => generateSetupGuide(build, bootstrapEcosystem, { recipes: [invalid] })).toThrow(/verified command must cite a source/i);
  });
});
