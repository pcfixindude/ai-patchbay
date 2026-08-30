import type { SavedBuild } from "@/lib/domain/schemas";
import type { CompatibilityEdge, EcosystemData } from "@/lib/domain/types";
import { setupRecipeRegistrySchema, type NormalizedSetupRecipe, type NormalizedSetupRecipeStep, type SetupPlatform, type SetupRecipe, type SetupVariable } from "./schemas";

export type SetupStep = NormalizedSetupRecipeStep & {
  kind: "component" | "connection";
  componentId?: string;
  edgeId?: string;
  recipeId: string;
  command?: NormalizedSetupRecipeStep["command"] & { resolvedCommand?: string };
  resolvedDescription?: string;
};

export type SetupGuide = {
  steps: SetupStep[];
  coverage: "full" | "partial" | "missing";
  coveredConnections: number;
  totalConnections: number;
  missing: string[];
  missingComponents: string[];
  missingConnections: string[];
  confidence: "First-party verified" | "Incomplete";
  confidenceScore: number;
  freshness: "current" | "stale" | "unknown";
  staleRecipeIds: string[];
  requiredVariables: SetupVariable[];
  platform: SetupPlatform;
};

export class SetupDependencyCycleError extends Error {
  constructor(public readonly recipeIds: string[]) {
    super(`Setup recipe dependency cycle: ${recipeIds.join(" -> ")}`);
    this.name = "SetupDependencyCycleError";
  }
}

export class SetupPlaceholderError extends Error {
  constructor(message: string) { super(message); this.name = "SetupPlaceholderError"; }
}

export type GenerateSetupGuideOptions = {
  platform?: Exclude<SetupPlatform, "generic">;
  recipes?: SetupRecipe[];
  variables?: Record<string, string | undefined>;
  now?: Date;
  staleAfterDays?: number;
};

const defaultOptions: Required<Pick<GenerateSetupGuideOptions, "platform" | "staleAfterDays">> = { platform: "macOS", staleAfterDays: 180 };

function appliesTo(platforms: SetupPlatform[], platform: SetupPlatform) {
  return platforms.includes("generic") || platforms.includes(platform);
}

function findEdge(connection: SavedBuild["connections"][number], edges: CompatibilityEdge[]) {
  return edges.find((edge) => edge.sourcePortId === connection.sourcePortId && edge.targetPortId === connection.targetPortId);
}

function stale(recipe: NormalizedSetupRecipe, now: Date, staleAfterDays: number) {
  const verified = Date.parse(`${recipe.lastVerifiedAt}T00:00:00.000Z`);
  return Number.isNaN(verified) || now.getTime() - verified > staleAfterDays * 86_400_000;
}

/** Resolves only declared variables. Undeclared or missing placeholders are rejected. */
export function resolveSetupPlaceholders(template: string, variables: Record<string, string | undefined>, declarations: SetupVariable[]) {
  const declared = new Map(declarations.map((variable) => [variable.name, variable]));
  return template.replace(/{{([A-Z][A-Z0-9_]*)}}/g, (match, name: string) => {
    const declaration = declared.get(name);
    if (!declaration) throw new SetupPlaceholderError(`Placeholder ${name} is not declared.`);
    const value = variables[name] ?? declaration.defaultValue;
    if (value === undefined) {
      if (declaration.required) throw new SetupPlaceholderError(`Required variable ${name} is missing.`);
      return match;
    }
    return value;
  });
}

/** Keeps an unresolved declared placeholder visible in a guide; secrets never need to be supplied to render it. */
function renderSetupPlaceholders(template: string, variables: Record<string, string | undefined>, declarations: SetupVariable[]) {
  const declared = new Map(declarations.map((variable) => [variable.name, variable]));
  return template.replace(/{{([A-Z][A-Z0-9_]*)}}/g, (match, name: string) => {
    const declaration = declared.get(name);
    if (!declaration) throw new SetupPlaceholderError(`Placeholder ${name} is not declared.`);
    return variables[name] ?? declaration.defaultValue ?? match;
  });
}

function topologicallyOrder(recipes: NormalizedSetupRecipe[], implicitDependencies = new Map<string, string[]>()) {
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const state = new Map<string, "visiting" | "visited">();
  const ordered: NormalizedSetupRecipe[] = [];
  const visit = (recipe: NormalizedSetupRecipe, path: string[]) => {
    const current = state.get(recipe.id);
    if (current === "visited") return;
    if (current === "visiting") throw new SetupDependencyCycleError([...path, recipe.id]);
    state.set(recipe.id, "visiting");
    for (const dependency of [...new Set([...recipe.dependsOn, ...(implicitDependencies.get(recipe.id) ?? [])])].sort()) {
      const target = byId.get(dependency);
      if (target) visit(target, [...path, recipe.id]);
    }
    state.set(recipe.id, "visited");
    ordered.push(recipe);
  };
  [...recipes].sort((a, b) => a.id.localeCompare(b.id)).forEach((recipe) => visit(recipe, []));
  return ordered;
}

function uniqueVariables(recipes: NormalizedSetupRecipe[]) {
  const variables = new Map<string, SetupVariable>();
  for (const recipe of recipes) for (const variable of [...recipe.variables, ...recipe.steps.flatMap((step) => step.variables)]) variables.set(variable.name, variable);
  return [...variables.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Creates a deterministic, source-aware setup plan from exact serialized build IDs and port connections.
 * Missing recipes intentionally yield partial coverage; catalog presence never implies an instruction.
 */
export function generateSetupGuide(
  build: SavedBuild,
  data: EcosystemData,
  platformOrOptions: Exclude<SetupPlatform, "generic"> | GenerateSetupGuideOptions = "macOS",
  defaultRecipes: SetupRecipe[] = [],
): SetupGuide {
  const options: GenerateSetupGuideOptions = typeof platformOrOptions === "string" ? { platform: platformOrOptions } : platformOrOptions;
  const platform = options.platform ?? defaultOptions.platform;
  const recipes = setupRecipeRegistrySchema.parse(options.recipes ?? defaultRecipes);
  const now = options.now ?? new Date();
  const staleAfterDays = options.staleAfterDays ?? defaultOptions.staleAfterDays;
  const componentIds = [...new Set(build.nodes.map((node) => node.componentId))];
  // Model and organization records are selected artifacts, not installable
  // software. Their setup belongs to the evidenced typed edge that consumes
  // them; requiring a fictional install recipe would make a complete route
  // look incomplete.
  const componentById = new Map(data.components.map((component) => [component.id, component]));
  const actionableComponentIds = componentIds.filter((id) => !["organization", "creator", "model_family", "model", "model_variant"].includes(componentById.get(id)?.componentType ?? ""));
  const applicableComponentRecipes = recipes.filter((recipe): recipe is Extract<NormalizedSetupRecipe, { kind: "component" }> => recipe.kind === "component" && appliesTo(recipe.platforms, platform));
  const componentRecipes = new Map(applicableComponentRecipes.map((recipe) => [recipe.componentId, recipe]));
  const selectedComponents = actionableComponentIds.map((id) => componentRecipes.get(id)).filter((recipe): recipe is Extract<NormalizedSetupRecipe, { kind: "component" }> => Boolean(recipe));
  const missingComponents = actionableComponentIds.filter((id) => !componentRecipes.has(id));
  const applicableEdgeRecipes = recipes.filter((recipe): recipe is Extract<NormalizedSetupRecipe, { kind: "edge" }> => recipe.kind === "edge" && appliesTo(recipe.platforms, platform));
  const edgeRecipes = new Map(applicableEdgeRecipes.map((recipe) => [recipe.edgeId, recipe]));
  const edgeSelections = build.connections.map((connection) => ({ connection, edge: findEdge(connection, data.compatibilityEdges) }));
  const selectedEdges = edgeSelections.map(({ edge }) => edge ? edgeRecipes.get(edge.id) : undefined).filter((recipe): recipe is Extract<NormalizedSetupRecipe, { kind: "edge" }> => Boolean(recipe));
  const missingConnections = edgeSelections.filter(({ edge }) => !edge || !edgeRecipes.has(edge.id)).map(({ connection }) => connection.id);
  const selected = [...new Map([...selectedComponents, ...selectedEdges].map((recipe) => [recipe.id, recipe])).values()];
  // A connection cannot be configured before its represented endpoint
  // components. This derives dependencies from typed ports, never names.
  const recipeForComponent = new Map(selectedComponents.map((recipe) => [recipe.componentId, recipe.id]));
  const portById = new Map(data.ports.map((port) => [port.id, port]));
  const edgeById = new Map(data.compatibilityEdges.map((edge) => [edge.id, edge]));
  const implicitDependencies = new Map(selectedEdges.map((recipe) => {
    const edge = edgeById.get(recipe.edgeId);
    const endpointRecipeIds = edge
      ? [portById.get(edge.sourcePortId)?.componentId, portById.get(edge.targetPortId)?.componentId]
        .map((componentId) => componentId ? recipeForComponent.get(componentId) : undefined)
        .filter((id): id is string => Boolean(id))
      : [];
    return [recipe.id, endpointRecipeIds];
  }));
  const ordered = topologicallyOrder(selected, implicitDependencies);
  const variables = uniqueVariables(ordered);
  const mergedDeclarations = variables;
  const steps = ordered.flatMap((recipe) => [...recipe.steps]
    .filter((step) => appliesTo(step.platforms, platform))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((step): SetupStep => ({
      ...step,
      kind: recipe.kind === "edge" ? "connection" : "component",
      componentId: recipe.kind === "component" ? recipe.componentId : undefined,
      edgeId: recipe.kind === "edge" ? recipe.edgeId : undefined,
      recipeId: recipe.id,
      resolvedDescription: renderSetupPlaceholders(step.description, options.variables ?? {}, [...recipe.variables, ...step.variables, ...mergedDeclarations]),
      command: step.command ? { ...step.command, resolvedCommand: renderSetupPlaceholders(step.command.command, options.variables ?? {}, [...recipe.variables, ...step.variables, ...mergedDeclarations]) } : undefined,
    })));
  const staleRecipeIds = ordered.filter((recipe) => stale(recipe, now, staleAfterDays)).map((recipe) => recipe.id);
  const relevantEdges = edgeSelections.map(({ edge }) => edge).filter((edge): edge is CompatibilityEdge => Boolean(edge));
  const confidenceScore = selected.length === 0 ? 0 : Math.round((relevantEdges.reduce((sum, edge) => sum + edge.confidence, 0) / Math.max(1, relevantEdges.length)) * 100) / 100;
  const coverage = missingComponents.length || missingConnections.length ? (steps.length ? "partial" : "missing") : "full";
  return {
    steps,
    coverage,
    coveredConnections: build.connections.length - missingConnections.length,
    totalConnections: build.connections.length,
    missing: [...missingComponents.map((id) => `component:${id}`), ...missingConnections.map((id) => `connection:${id}`)],
    missingComponents,
    missingConnections,
    confidence: coverage === "full" && staleRecipeIds.length === 0 ? "First-party verified" : "Incomplete",
    confidenceScore,
    freshness: selected.length === 0 ? "unknown" : staleRecipeIds.length ? "stale" : "current",
    staleRecipeIds,
    requiredVariables: variables.filter((variable) => variable.required),
    platform,
  };
}
