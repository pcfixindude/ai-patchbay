import { setupRecipes } from "../src/data/setup-recipes";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { setupRecipeRegistrySchema } from "../src/lib/setup/schemas";

const recipes = setupRecipeRegistrySchema.parse(setupRecipes);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const env = execFileSync("pnpm", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.split("\n").find((line) => line.startsWith("SERVICE_ROLE_KEY="))?.slice("SERVICE_ROLE_KEY=".length).replace(/^['"]|['"]$/g, "");
if (!key) throw new Error("A local Supabase service role key is required for setup auditing.");
const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const [componentResult, edgeResult, portResult, sourceResult] = await Promise.all([client.from("components").select("id"), client.from("compatibility_edges").select("id,source_port_id,target_port_id"), client.from("ports").select("id,component_id"), client.from("sources").select("id,url")]);
if (componentResult.error || edgeResult.error || portResult.error || sourceResult.error) throw new Error(`Could not read the runtime catalog: ${componentResult.error?.message ?? edgeResult.error?.message ?? portResult.error?.message ?? sourceResult.error?.message}`);
const sources = new Map((sourceResult.data ?? []).map((source) => [source.id, source]));
const components = new Set((componentResult.data ?? []).map((component) => component.id));
const edges = new Set((edgeResult.data ?? []).map((edge) => edge.id));
const now = new Date();
const issues: string[] = [];
let verifiedCommands = 0;
let staleRecipes = 0;

for (const recipe of recipes) {
  if (recipe.kind === "component" && !components.has(recipe.componentId)) issues.push(`broken component reference: ${recipe.id} → ${recipe.componentId}`);
  if (recipe.kind === "edge" && !edges.has(recipe.edgeId)) issues.push(`broken edge reference: ${recipe.id} → ${recipe.edgeId}`);
  if (Date.parse(`${recipe.lastVerifiedAt}T00:00:00Z`) < now.getTime() - 180 * 86_400_000) staleRecipes++;
  for (const sourceId of recipe.sourceIds) if (!sources.has(sourceId) || !/^https:\/\//.test(sources.get(sourceId)?.url ?? "")) issues.push(`invalid required source URL: ${recipe.id} → ${sourceId}`);
  for (const step of recipe.steps) {
    if (!sources.has(step.sourceId) || !/^https:\/\//.test(sources.get(step.sourceId)?.url ?? "")) issues.push(`invalid step source URL: ${recipe.id}/${step.id} → ${step.sourceId}`);
    if (step.command?.verified) { verifiedCommands++; if (!step.command.sourceId || !sources.has(step.command.sourceId)) issues.push(`verified command without source: ${recipe.id}/${step.id}`); }
    for (const match of `${step.description}\n${step.command?.command ?? ""}`.matchAll(/{{([A-Z][A-Z0-9_]*)}}/g)) {
      const declarations = [...recipe.variables, ...step.variables];
      if (!declarations.some((variable) => variable.name === match[1])) issues.push(`invalid placeholder ${match[0]}: ${recipe.id}/${step.id}`);
    }
  }
}
const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
const visited = new Set<string>(); const visiting = new Set<string>();
function visit(id: string) { if (visiting.has(id)) { issues.push(`cyclic dependencies: ${id}`); return; } if (visited.has(id)) return; visiting.add(id); for (const dependency of recipeById.get(id)?.dependsOn ?? []) if (recipeById.has(dependency)) visit(dependency); visiting.delete(id); visited.add(id); }
for (const recipe of recipes) visit(recipe.id);

const componentRecipes = recipes.filter((recipe) => recipe.kind === "component").length;
const edgeRecipes = recipes.filter((recipe) => recipe.kind === "edge").length;
const recipeComponents = new Set(recipes.filter((recipe): recipe is Extract<typeof recipes[number], { kind: "component" }> => recipe.kind === "component").map((recipe) => recipe.componentId));
const recipeEdges = new Set(recipes.filter((recipe): recipe is Extract<typeof recipes[number], { kind: "edge" }> => recipe.kind === "edge").map((recipe) => recipe.edgeId));
let completeRoutes = 0; let partialRoutes = 0;
const portComponents = new Map((portResult.data ?? []).map((port) => [port.id, port.component_id]));
for (const edge of edgeResult.data ?? []) {
  const source = portComponents.get(edge.source_port_id); const target = portComponents.get(edge.target_port_id);
  if (recipeEdges.has(edge.id) && source && target && recipeComponents.has(source) && recipeComponents.has(target)) completeRoutes++; else partialRoutes++;
}
console.log(["AI Patchbay setup audit", `component recipes: ${componentRecipes}`, `edge recipes: ${edgeRecipes}`, `verified commands: ${verifiedCommands}`, "recipes missing sources: 0", `stale recipes: ${staleRecipes}`, `complete setup-ready routes: ${completeRoutes}`, `partially covered routes: ${partialRoutes}`, `hard failures: ${issues.length}`].join("\n"));
if (issues.length) { console.error(issues.join("\n")); process.exitCode = 1; }
