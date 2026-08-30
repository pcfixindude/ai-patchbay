export const freshnessThresholdDays = { identity: 180, providerAvailability: 30, compatibility: 90, pricing: 30 } as const;

export function freshnessLabel(verifiedAt?: string, kind: keyof typeof freshnessThresholdDays = "identity", now = new Date()) {
  if (!verifiedAt) return "Unverified";
  const age = Math.floor((now.getTime() - new Date(verifiedAt).getTime()) / 86_400_000);
  if (age > freshnessThresholdDays[kind]) return "Stale verification";
  if (age > freshnessThresholdDays[kind] * 0.65) return "Verification aging";
  return "Recently verified";
}
