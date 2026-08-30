import { setupRecipes } from "@/data/setup-recipes";
import type { SavedBuild } from "@/lib/domain/schemas";
import type { EcosystemData } from "@/lib/domain/types";
import { generateSetupGuide as generateGuide, type GenerateSetupGuideOptions } from "./guide";
import type { SetupPlatform, SetupRecipe } from "./schemas";

export * from "./guide";
export * from "./schemas";

/** Application entrypoint using the source-backed recipe registry. */
export function generateSetupGuide(
  build: SavedBuild,
  data: EcosystemData,
  platformOrOptions: Exclude<SetupPlatform, "generic"> | GenerateSetupGuideOptions = "macOS",
) {
  return generateGuide(build, data, platformOrOptions, setupRecipes as SetupRecipe[]);
}
