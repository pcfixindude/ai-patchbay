import { z } from "zod";
import { fetchJson, mapWithConcurrency } from "./http";
import { stableHash } from "./normalize";
import type { EcosystemUpdater, NormalizedObservation } from "./types";

function observation(base: Omit<NormalizedObservation, "payloadHash"> & { payloadSnapshot: Record<string, unknown> }): NormalizedObservation {
  return { ...base, payloadHash: stableHash(base.payloadSnapshot) };
}
function iso(value: string | undefined, fallback: Date) { return value ? new Date(value).toISOString() : fallback.toISOString(); }

const githubRepoSchema = z.object({ html_url: z.url(), default_branch: z.string(), archived: z.boolean(), updated_at: z.string(), pushed_at: z.string().nullable(), releases_url: z.string().optional() });
const githubReleaseSchema = z.object({ tag_name: z.string(), published_at: z.string().nullable(), html_url: z.url() });
export const githubUpdater: EcosystemUpdater = { id: "github", sourceType: "official_repo", async discover(context) {
  const results = await mapWithConcurrency(context.targets, context.concurrency, async (target) => { try {
    const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": context.userAgent, ...(context.token ? { Authorization: `Bearer ${context.token}` } : {}) };
    const repo = await fetchJson(context.fetch, `https://api.github.com/repos/${target.externalId}`, { headers, timeoutMs: context.timeoutMs }, githubRepoSchema);
    const release = await fetchJson(context.fetch, `https://api.github.com/repos/${target.externalId}/releases/latest`, { headers, timeoutMs: context.timeoutMs, retries: 0 }, githubReleaseSchema).catch(() => undefined);
    const snapshot = { repo, release };
    return [observation({ adapterId: "github", externalEntityId: target.externalId, observationType: "repository", fieldName: "github_updated_at", observedValue: repo.updated_at, sourceUrl: repo.html_url, sourceTimestamp: iso(repo.updated_at, context.now()), retrievedAt: context.now().toISOString(), payloadSnapshot: snapshot, confidence: 1, authority: "official_api" }), ...(release ? [observation({ adapterId: "github", externalEntityId: target.externalId, observationType: "release", fieldName: "latest_release", observedValue: { tag: release.tag_name, publishedAt: release.published_at }, sourceUrl: release.html_url, sourceTimestamp: iso(release.published_at ?? undefined, context.now()), retrievedAt: context.now().toISOString(), payloadSnapshot: snapshot, confidence: 1, authority: "official_api" })] : [])];
  } catch { return []; } });
  return results.flat();
} };

const hfSchema = z.object({ id: z.string(), lastModified: z.string().optional(), tags: z.array(z.string()).default([]), pipeline_tag: z.string().nullable().optional(), library_name: z.string().nullable().optional(), siblings: z.array(z.object({ rfilename: z.string() })).default([]) });
export const huggingFaceUpdater: EcosystemUpdater = { id: "huggingface", sourceType: "model_card", async discover(context) {
  const results = await mapWithConcurrency(context.targets, context.concurrency, async (target) => { try {
    // Hub model IDs are owner/repository paths. Preserve the slash; `%2F` is not accepted consistently by the Hub API.
    const model = await fetchJson(context.fetch, `https://huggingface.co/api/models/${encodeURI(target.externalId)}`, { headers: { "User-Agent": context.userAgent, ...(context.token ? { Authorization: `Bearer ${context.token}` } : {}) }, timeoutMs: context.timeoutMs }, hfSchema);
    const snapshot = { id: model.id, lastModified: model.lastModified, tags: model.tags, pipeline_tag: model.pipeline_tag, library_name: model.library_name, siblings: model.siblings.map((item) => item.rfilename) };
    return observation({ adapterId: "huggingface", externalEntityId: target.externalId, observationType: "model_repository", fieldName: "huggingface_metadata", observedValue: snapshot, sourceUrl: `https://huggingface.co/${model.id}`, sourceTimestamp: model.lastModified ? iso(model.lastModified, context.now()) : undefined, retrievedAt: context.now().toISOString(), payloadSnapshot: snapshot, confidence: 0.98, authority: "official_api" });
  } catch { return undefined; } });
  return results.filter((result): result is NormalizedObservation => Boolean(result));
} };

const openRouterSchema = z.object({ data: z.array(z.object({ id: z.string(), canonical_slug: z.string().optional(), context_length: z.number().nullable().optional(), architecture: z.object({ input_modalities: z.array(z.string()).optional(), output_modalities: z.array(z.string()).optional() }).optional(), pricing: z.record(z.string(), z.unknown()).optional() })) });
export const openRouterUpdater: EcosystemUpdater = { id: "openrouter", sourceType: "official_api", async discover(context) {
  const catalog = await fetchJson(context.fetch, "https://openrouter.ai/api/v1/models?output_modalities=all", { headers: { "User-Agent": context.userAgent, ...(context.token ? { Authorization: `Bearer ${context.token}` } : {}) }, timeoutMs: context.timeoutMs }, openRouterSchema);
  const wanted = new Set(context.targets.map((target) => target.externalId));
  return catalog.data.filter((model) => wanted.has(model.id) || (model.canonical_slug && wanted.has(model.canonical_slug))).map((model) => {
    const snapshot = { id: model.id, canonicalSlug: model.canonical_slug, contextLength: model.context_length, inputModalities: model.architecture?.input_modalities ?? [], outputModalities: model.architecture?.output_modalities ?? [], pricing: model.pricing ?? {} };
    return observation({ adapterId: "openrouter", externalEntityId: model.id, observationType: "provider_catalog", fieldName: "openrouter_catalog_metadata", observedValue: snapshot, sourceUrl: `https://openrouter.ai/${model.id}`, retrievedAt: context.now().toISOString(), payloadSnapshot: snapshot, confidence: 1, authority: "official_api" });
  });
} };

const ollamaSchema = z.object({ models: z.array(z.object({ name: z.string(), model: z.string().optional(), modified_at: z.string().optional(), size: z.number().optional() })).default([]) });
export const ollamaUpdater: EcosystemUpdater = { id: "ollama", sourceType: "local_runtime", async discover(context) {
  const endpoint = process.env.OLLAMA_ENDPOINT ?? "http://127.0.0.1:11434";
  const data = await fetchJson(context.fetch, `${endpoint.replace(/\/$/, "")}/api/tags`, { headers: { "User-Agent": context.userAgent }, timeoutMs: context.timeoutMs, retries: 0 }, ollamaSchema);
  return data.models.map((model) => { const snapshot = { name: model.name, model: model.model, modifiedAt: model.modified_at, size: model.size }; return observation({ adapterId: "ollama", externalEntityId: model.model ?? model.name, observationType: "local_installation", fieldName: "ollama_installed_model", observedValue: snapshot, sourceUrl: `${endpoint}/api/tags`, sourceTimestamp: model.modified_at ? iso(model.modified_at, context.now()) : undefined, retrievedAt: context.now().toISOString(), payloadSnapshot: snapshot, confidence: 1, authority: "official_api" }); });
} };

export const updaters: Record<EcosystemUpdater["id"], EcosystemUpdater> = { github: githubUpdater, huggingface: huggingFaceUpdater, openrouter: openRouterUpdater, ollama: ollamaUpdater };
