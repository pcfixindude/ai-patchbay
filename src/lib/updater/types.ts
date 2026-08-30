import { z } from "zod";

export const sourceAuthoritySchema = z.enum(["official_api", "official_repo", "official_docs", "model_card", "announcement", "trusted_third_party", "community"]);
export const riskClassificationSchema = z.enum(["low", "medium", "high"]);
export const adapterIdSchema = z.enum(["github", "huggingface", "openrouter", "ollama"]);

export const normalizedObservationSchema = z.object({
  adapterId: adapterIdSchema,
  externalEntityId: z.string().min(1).max(300),
  observationType: z.string().min(1).max(80),
  fieldName: z.string().min(1).max(120),
  observedValue: z.unknown(),
  sourceUrl: z.url(),
  sourceTimestamp: z.string().datetime().optional(),
  retrievedAt: z.string().datetime(),
  payloadHash: z.string().regex(/^[a-f0-9]{64}$/),
  payloadSnapshot: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
  authority: sourceAuthoritySchema,
});
export type NormalizedObservation = z.infer<typeof normalizedObservationSchema>;
export type SourceAuthority = z.infer<typeof sourceAuthoritySchema>;
export type RiskClassification = z.infer<typeof riskClassificationSchema>;
export type AdapterId = z.infer<typeof adapterIdSchema>;

export interface ExternalRefTarget {
  componentId: string;
  externalRefId: string;
  externalId: string;
  externalUrl: string;
}

export interface UpdateContext {
  targets: ExternalRefTarget[];
  fetch: typeof fetch;
  now: () => Date;
  token?: string;
  timeoutMs: number;
  concurrency: number;
  userAgent: string;
}

export interface EcosystemUpdater {
  id: AdapterId;
  sourceType: string;
  discover(context: UpdateContext): Promise<NormalizedObservation[]>;
}
