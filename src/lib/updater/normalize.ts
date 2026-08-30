import { createHash } from "node:crypto";

export function stableHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, nested]) => [key, canonicalize(nested)]));
  return value;
}

export function observationFingerprint(sourceSystem: string, externalId: string, fieldName: string, observedValue: unknown) {
  return stableHash({ sourceSystem, externalId, fieldName, observedValue });
}
