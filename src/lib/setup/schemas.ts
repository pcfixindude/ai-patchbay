import { z } from "zod";

export const setupPlatformSchema = z.enum(["macOS", "Linux", "Windows", "generic"]);
export type SetupPlatform = z.infer<typeof setupPlatformSchema>;

export const setupVariableSchema = z.object({
  name: z.string().regex(/^[A-Z][A-Z0-9_]*$/, "Variables use UPPER_SNAKE_CASE names"),
  description: z.string().min(1),
  required: z.boolean().default(true),
  secret: z.boolean().default(false),
  defaultValue: z.string().optional(),
});
export type SetupVariable = z.output<typeof setupVariableSchema>;

export const setupCommandSchema = z.object({
  command: z.string().min(1),
  verified: z.boolean().default(false),
  sourceId: z.string().min(1).optional(),
  expectedResult: z.string().min(1).optional(),
}).superRefine((command, ctx) => {
  if (command.verified && !command.sourceId) {
    ctx.addIssue({ code: "custom", path: ["sourceId"], message: "A verified command must cite a source." });
  }
});
export type SetupCommand = z.output<typeof setupCommandSchema>;

export const setupStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sourceId: z.string().min(1),
  lastVerifiedAt: z.iso.date(),
  platforms: z.array(setupPlatformSchema).min(1),
  validation: z.string().min(1).optional(),
  required: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  dependsOn: z.array(z.string().min(1)).default([]),
  variables: z.array(setupVariableSchema).default([]),
  command: setupCommandSchema.optional(),
});
/** Authoring shape: defaulted fields may be omitted in curated recipe data. */
export type SetupRecipeStep = z.input<typeof setupStepSchema>;
export type NormalizedSetupRecipeStep = z.output<typeof setupStepSchema>;

const recipeBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).min(1),
  lastVerifiedAt: z.iso.date(),
  platforms: z.array(setupPlatformSchema).min(1),
  dependsOn: z.array(z.string().min(1)).default([]),
  variables: z.array(setupVariableSchema).default([]),
  steps: z.array(setupStepSchema).min(1),
});

export const componentSetupRecipeSchema = recipeBaseSchema.extend({
  kind: z.literal("component"),
  componentId: z.string().min(1),
});
export const edgeSetupRecipeSchema = recipeBaseSchema.extend({
  kind: z.literal("edge"),
  edgeId: z.string().min(1),
});
export const setupRecipeSchema = z.discriminatedUnion("kind", [componentSetupRecipeSchema, edgeSetupRecipeSchema]);
/** Authoring shape: validate with `setupRecipeRegistrySchema.parse` before execution. */
export type SetupRecipe = z.input<typeof setupRecipeSchema>;
export type NormalizedSetupRecipe = z.output<typeof setupRecipeSchema>;

export const setupRecipeRegistrySchema = z.array(setupRecipeSchema).superRefine((recipes, ctx) => {
  const ids = new Set<string>();
  for (const [index, recipe] of recipes.entries()) {
    if (ids.has(recipe.id)) ctx.addIssue({ code: "custom", path: [index, "id"], message: "Recipe IDs must be unique." });
    ids.add(recipe.id);
  }
});
