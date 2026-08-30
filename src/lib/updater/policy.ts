import type { NormalizedObservation, RiskClassification, SourceAuthority } from "./types";

const authorityRank: Record<SourceAuthority, number> = { official_api: 6, official_repo: 5, official_docs: 4, model_card: 3, announcement: 2, trusted_third_party: 1, community: 0 };
const highRiskTerms = ["compatibility", "trust", "recommend", "minimum_ram", "performance", "hardware", "edge"];
const mediumRiskTerms = ["open_source", "open_weights", "capability", "local_capable", "cli", "gui", "parent", "deprecated"];

export function classifyRisk(fieldName: string): RiskClassification {
  if (highRiskTerms.some((term) => fieldName.includes(term))) return "high";
  if (mediumRiskTerms.some((term) => fieldName.includes(term))) return "medium";
  return "low";
}

export function canAutoApply(observation: NormalizedObservation, currentAuthority?: SourceAuthority): boolean {
  return classifyRisk(observation.fieldName) === "low" && (observation.authority === "official_api" || observation.authority === "official_repo") && authorityRank[observation.authority] >= authorityRank[currentAuthority ?? "community"];
}

export function isHigherAuthority(next: SourceAuthority, current?: SourceAuthority) {
  return authorityRank[next] >= authorityRank[current ?? "community"];
}
