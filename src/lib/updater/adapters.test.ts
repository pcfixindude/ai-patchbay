import { describe, expect, it, vi } from "vitest";
import { githubUpdater, huggingFaceUpdater, ollamaUpdater, openRouterUpdater } from "./adapters";
import { canAutoApply, classifyRisk } from "./policy";
import { freshnessLabel } from "./freshness";
import { stableHash } from "./normalize";

const now = () => new Date("2026-08-29T12:00:00.000Z");
const context = (fetch: typeof globalThis.fetch) => ({ targets: [{ componentId: "component-1", externalRefId: "ref-1", externalId: "owner/repo", externalUrl: "https://example.com/repo" }], fetch, now, timeoutMs: 40, concurrency: 1, userAgent: "test" });
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("updater adapters and policy", () => {
  it("normalizes GitHub repository and release facts with a pinned API request", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response({ html_url: "https://github.com/owner/repo", default_branch: "main", archived: false, updated_at: "2026-08-20T00:00:00Z", pushed_at: null })).mockResolvedValueOnce(response({ tag_name: "v1.2.3", published_at: "2026-08-21T00:00:00Z", html_url: "https://github.com/owner/repo/releases/tag/v1.2.3" }));
    const observations = await githubUpdater.discover(context(fetch));
    expect(observations).toHaveLength(2);
    expect(observations[0]).toMatchObject({ fieldName: "github_updated_at", authority: "official_api" });
    expect(fetch.mock.calls[0][1].headers["X-GitHub-Api-Version"]).toBe("2022-11-28");
  });

  it("normalizes Hugging Face model metadata from its API shape", async () => {
    const fetch = vi.fn().mockResolvedValue(response({ id: "owner/repo", lastModified: "2026-08-20T00:00:00Z", tags: ["text-generation"], pipeline_tag: "text-generation", library_name: "transformers", siblings: [{ rfilename: "config.json" }] }));
    const [item] = await huggingFaceUpdater.discover(context(fetch));
    expect(item.observedValue).toMatchObject({ id: "owner/repo", tags: ["text-generation"] });
    expect(item.authority).toBe("official_api");
  });

  it("uses only explicitly configured OpenRouter IDs and preserves catalog metadata", async () => {
    const fetch = vi.fn().mockResolvedValue(response({ data: [{ id: "owner/repo", canonical_slug: "owner/repo", context_length: 32768, architecture: { input_modalities: ["text"], output_modalities: ["text"] }, pricing: { prompt: "0.1" }, }, { id: "other/model", pricing: {} }] }));
    const [item] = await openRouterUpdater.discover(context(fetch));
    expect(item.observedValue).toMatchObject({ contextLength: 32768, inputModalities: ["text"] });
  });

  it("keeps local Ollama optional and normalizes installed models without catalog assumptions", async () => {
    const fetch = vi.fn().mockResolvedValue(response({ models: [{ name: "qwen:latest", model: "qwen:latest", modified_at: "2026-08-20T00:00:00Z", size: 42 }] }));
    const [item] = await ollamaUpdater.discover(context(fetch));
    expect(item).toMatchObject({ observationType: "local_installation", externalEntityId: "qwen:latest" });
  });

  it("retries retryable failures and fails closed on a timeout", async () => {
    const fetch = vi.fn().mockResolvedValue(response({ message: "slow down" }, 429));
    await expect(githubUpdater.discover(context(fetch))).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(3);
    const aborted = vi.fn().mockRejectedValue(new DOMException("timeout", "AbortError"));
    await expect(ollamaUpdater.discover(context(aborted))).rejects.toBeInstanceOf(Error);
  });

  it("never auto-applies high-risk compatibility claims or lower-authority replacements", () => {
    const base = { adapterId: "github" as const, externalEntityId: "owner/repo", observationType: "repo", fieldName: "github_updated_at", observedValue: "x", sourceUrl: "https://example.com", retrievedAt: now().toISOString(), payloadHash: "a".repeat(64), payloadSnapshot: {}, confidence: 1, authority: "official_api" as const };
    expect(classifyRisk("compatibility_edge_status")).toBe("high");
    expect(canAutoApply({ ...base, fieldName: "compatibility_edge_status" })).toBe(false);
    expect(canAutoApply({ ...base, authority: "community" }, "official_repo")).toBe(false);
    expect(canAutoApply({ ...base, authority: "official_docs" })).toBe(false);
    expect(canAutoApply(base, "official_repo")).toBe(true);
  });

  it("labels freshness centrally", () => {
    expect(freshnessLabel("2026-08-28T00:00:00Z", "identity", now())).toBe("Recently verified");
    expect(freshnessLabel("2025-01-01T00:00:00Z", "identity", now())).toBe("Stale verification");
    expect(freshnessLabel(undefined)).toBe("Unverified");
  });

  it("hashes nested snapshots deterministically without collapsing changed facts", () => {
    expect(stableHash({ b: { y: 2, x: 1 }, a: ["x"] })).toBe(stableHash({ a: ["x"], b: { x: 1, y: 2 } }));
    expect(stableHash({ repo: { updated_at: "one" } })).not.toBe(stableHash({ repo: { updated_at: "two" } }));
  });
});
