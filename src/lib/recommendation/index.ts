import { z } from "zod";
import { findPaths } from "@/lib/compatibility";
import type { EcosystemComponent, EcosystemData, HardwareConstraints, PathResult } from "@/lib/domain/types";

export const hardwareProfileSchema = z.object({ name: z.string().min(1).max(80).default("This device"), operatingSystem: z.enum(["macOS", "Windows", "Linux", "other"]), architecture: z.enum(["apple_silicon", "x64", "arm64", "other"]), memoryGb: z.number().min(4).max(2048), gpuType: z.enum(["apple", "nvidia", "other", "none"]), vramGb: z.number().min(0).max(512).optional(), appleChip: z.enum(["M1", "M2", "M3", "M4", "unknown"]).optional(), cudaAvailable: z.boolean().default(false), cpuOnly: z.boolean().default(false) });
export type HardwareProfile = z.infer<typeof hardwareProfileSchema>;
export type FitLevel = "excellent" | "good" | "possible" | "marginal" | "unlikely" | "incompatible" | "unknown";
export type RecommendationInput = { task: "coding" | "assistant" | "vision" | "automation"; runPreference: "local" | "prefer_local" | "hybrid" | "cloud"; interface: "cli" | "gui" | "ide" | "browser" | "any"; priorities: string[]; profile: HardwareProfile; verifiedOnly: boolean; };
export type ModelFitEstimate = { level: FitLevel; estimatedModelGb?: number; practicalMemoryGb?: number; confidence: "high" | "medium" | "low"; assumptions: string[] };
export type StackRecommendation = { path: PathResult; score: number; fit: ModelFitEstimate; privacy: string; setup: "easy" | "moderate" | "advanced"; why: string[]; tradeoffs: string[] };
export type RecommendationBlockerCode = "strict_cuda_no_viable_route" | "insufficient_local_memory" | "verified_only_no_viable_route" | "task_has_no_compatible_candidate";
export type RecommendationRelaxationCode = "disable_strict_cuda" | "increase_memory" | "allow_lower_trust" | "allow_cloud" | "choose_supported_task";
export type RecommendationDiagnostics = {
  recommendations: StackRecommendation[];
  blockers: Array<{ code: RecommendationBlockerCode; details: string }>;
  relaxations: Array<{ code: RecommendationRelaxationCode; details: string }>;
};

export function runtimeHardwareFit(runtime: EcosystemComponent, profile: HardwareProfile): "supported" | "incompatible" | "unknown" {
  const tags = runtime.tags.map((tag) => tag.toLowerCase());
  if (profile.cudaAvailable || profile.gpuType === "nvidia") return tags.includes("cuda") ? "supported" : tags.some((tag) => tag.includes("apple silicon")) ? "incompatible" : "unknown";
  if (profile.cpuOnly || profile.gpuType === "none") return tags.includes("cuda") ? "incompatible" : runtime.operatingSystems.includes(profile.operatingSystem) ? "supported" : "unknown";
  if (profile.architecture === "apple_silicon") return tags.includes("cuda") ? "incompatible" : runtime.operatingSystems.includes("macOS") ? "supported" : "incompatible";
  return runtime.operatingSystems.includes(profile.operatingSystem) ? "supported" : "unknown";
}

export function estimateModelFit(component: EcosystemComponent, profile: HardwareProfile, quantizationBits = 4): ModelFitEstimate {
  const metadata = component.modelMetadata;
  if (!metadata?.parameterCount) return { level: "unknown", confidence: "low", assumptions: ["Parameter count is not recorded; hardware fit cannot be estimated."] };
  const weightGb = metadata.parameterCount * quantizationBits / 8 / 1_000_000_000;
  const reserve = profile.architecture === "apple_silicon" ? 12 : 8;
  const practical = Math.ceil((weightGb * 1.22 + reserve) / 2) * 2;
  const available = profile.gpuType === "nvidia" && profile.vramGb ? profile.vramGb : profile.memoryGb;
  const ratio = available / practical;
  const level: FitLevel = ratio >= 1.5 ? "excellent" : ratio >= 1.15 ? "good" : ratio >= 1 ? "possible" : ratio >= .8 ? "marginal" : "unlikely";
  return { level, estimatedModelGb: Math.round(weightGb * 10) / 10, practicalMemoryGb: practical, confidence: metadata.quantization ? "high" : "medium", assumptions: [`Estimated if a compatible ${quantizationBits}-bit quantization is available.`, `Includes runtime/context safety margin and ${reserve} GB reserved for the OS and apps.`, metadata.activeParameterCount ? `Memory uses ${Math.round(metadata.parameterCount / 1e9)}B total parameters, not ${Math.round(metadata.activeParameterCount / 1e9)}B active MoE parameters.` : "KV cache is included as a conservative general overhead; architecture-specific cache data is unavailable."] };
}

export function recommendStacks(data: EcosystemData, input: RecommendationInput): StackRecommendation[] {
  const cudaStrict = input.profile.cudaAvailable && input.priorities.includes("cuda");
  const constraints: HardwareConstraints = { localOnly: input.runPreference === "local", verifiedOnly: input.verifiedOnly, avoidDeprecated: true, appleSilicon: input.profile.architecture === "apple_silicon" };
  const sources = data.components.filter((c) => c.componentType.includes("model") && (input.task !== "coding" || c.codingCapable) && (input.task !== "vision" || c.visionCapable));
  const goals = data.components.filter((c) => (input.task === "coding" ? c.componentType === "coding_agent" || c.componentType === "agent" : c.componentType === "agent"));
  const candidates = sources.flatMap((source) => goals.flatMap((goal) => findPaths(source.id, goal.id, { ports: data.ports, edges: data.compatibilityEdges, components: data.components }, constraints, 5).slice(0, 1).map((path) => ({ source, path }))));
  return candidates.flatMap(({ source, path }) => {
    const fit = estimateModelFit(source, input.profile); const local = path.componentIds.every((id) => data.components.find((c) => c.id === id)?.localCapable);
    const runtimes = path.componentIds.map((id) => data.components.find((c) => c.id === id)).filter((c): c is EcosystemComponent => c?.componentType === "runtime");
    const runtimeFits = runtimes.map((runtime) => runtimeHardwareFit(runtime, input.profile));
    if (runtimeFits.some((fit) => fit === "incompatible") || (cudaStrict && runtimeFits.some((fit) => fit !== "supported"))) return [];
    if ((cudaStrict || input.runPreference === "local") && ["marginal", "unlikely", "incompatible"].includes(fit.level)) return [];
    const cpuPenalty = (input.profile.cpuOnly || input.profile.gpuType === "none") && (source.modelMetadata?.parameterCount ?? 0) > 14e9 ? 35 : 0;
    const runtimeBonus = runtimeFits.filter((fit) => fit === "supported").length * 12 - runtimeFits.filter((fit) => fit === "unknown").length * 8;
    const interfaceMatch = input.interface === "any" || path.componentIds.some((id) => {
      const component = data.components.find((candidate) => candidate.id === id);
      return input.interface === "cli" ? component?.cliAvailable : input.interface === "gui" ? component?.guiAvailable : true;
    });
    const setup: StackRecommendation["setup"] = path.componentIds.length <= 2 ? "easy" : path.componentIds.length <= 3 ? "moderate" : "advanced";
    const setupBonus = input.priorities.includes("easy_setup") ? setup === "easy" ? 18 : setup === "moderate" ? 8 : -10 : 0;
    const pathScore = path.score / Math.max(path.edgeIds.length, 1) - path.edgeIds.length * 15;
    const score = pathScore + runtimeBonus - cpuPenalty + (local && input.runPreference !== "cloud" ? 25 : 0) + (["excellent", "good"].includes(fit.level) ? 20 : fit.level === "possible" ? 5 : -20) + (input.priorities.includes("privacy") && local ? 20 : 0) + (input.interface === "any" ? 0 : interfaceMatch ? 18 : -12) + setupBonus;
    const strongTrust = (path.trustSummary?.verifiedOfficial ?? 0) + (path.trustSummary?.verifiedFirstParty ?? 0);
    const result: StackRecommendation = { path, score, fit, privacy: local ? "Fully local model path" : "Cloud model or provider is in this path", setup, why: [`${fit.level} hardware fit for ${input.profile.memoryGb} GB ${input.profile.architecture === "apple_silicon" ? "unified memory" : "memory"}.`, `${strongTrust} first-party/official compatibility links.`, runtimeFits.includes("supported") ? "The selected runtime matches this hardware profile." : "Runtime hardware support is not fully documented.", local ? "The routed inference path stays local." : "This stack uses a cloud-capable component."], tradeoffs: [cpuPenalty ? "CPU-only execution is likely slow/heavy for this model size." : "Model capability still depends on the selected artifact and task.", path.trustSummary?.staleEdges ? "One or more compatibility records have stale verification." : ""] .filter(Boolean) };
    return [result];
  }).filter((result, index, all) => all.findIndex((candidate) => candidate.path.componentIds.join("/") === result.path.componentIds.join("/")) === index).sort((a, b) => b.score - a.score).slice(0, 3);
}

/** Returns machine-readable no-route guidance without turning a relaxation into a hidden constraint change. */
export function diagnoseRecommendations(data: EcosystemData, input: RecommendationInput): RecommendationDiagnostics {
  const recommendations = recommendStacks(data, input);
  if (recommendations.length) return { recommendations, blockers: [], relaxations: [] };

  const blockers: RecommendationDiagnostics["blockers"] = [];
  const relaxations: RecommendationDiagnostics["relaxations"] = [];
  const add = (code: RecommendationBlockerCode, details: string, relaxation: RecommendationRelaxationCode, relaxationDetails: string) => {
    blockers.push({ code, details });
    relaxations.push({ code: relaxation, details: relaxationDetails });
  };
  const sources = data.components.filter((component) => component.componentType.includes("model") && (input.task !== "coding" || component.codingCapable) && (input.task !== "vision" || component.visionCapable));
  if (!sources.length) add("task_has_no_compatible_candidate", "No catalog model satisfies the selected task capability.", "choose_supported_task", "Choose a task with a compatible model route.");
  if (input.profile.cudaAvailable && input.priorities.includes("cuda")) add("strict_cuda_no_viable_route", "No route satisfies strict CUDA runtime support and the selected hardware fit.", "disable_strict_cuda", "Allow non-CUDA runtimes or select CUDA-supported hardware.");
  if (input.runPreference === "local") add("insufficient_local_memory", "No fully local route has a practical fit for the available memory.", "increase_memory", "Increase available memory or permit a cloud-capable route.");
  if (input.verifiedOnly) add("verified_only_no_viable_route", "No remaining route meets the verified-only trust requirement.", "allow_lower_trust", "Allow lower-trust routes only after reviewing their evidence.");
  if (input.runPreference === "local") relaxations.push({ code: "allow_cloud", details: "Permit a cloud-capable route if fully local execution is not required." });
  return { recommendations, blockers, relaxations };
}
