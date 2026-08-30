import type { AdapterId, ExternalRefTarget } from "./types";

export const defaultUpdaterConfiguration = {
  github: { enabled: true, timeoutMs: 8000, concurrency: 2 },
  huggingface: { enabled: true, timeoutMs: 8000, concurrency: 2 },
  openrouter: { enabled: true, timeoutMs: 8000, concurrency: 1 },
  ollama: { enabled: false, timeoutMs: 3000, concurrency: 1 },
} as const;

/** Small smoke-only set mirroring seeded explicit refs; database runs load mappings from component_external_refs. */
export const smokeTargets: Record<AdapterId, ExternalRefTarget[]> = {
  github: [
    { componentId: "00000000-0000-4000-8000-000000000003", externalRefId: "smoke-github-ollama", externalId: "ollama/ollama", externalUrl: "https://github.com/ollama/ollama" },
    { componentId: "00000000-0000-4000-8000-000000000005", externalRefId: "smoke-github-hermes", externalId: "NousResearch/hermes-agent", externalUrl: "https://github.com/NousResearch/hermes-agent" },
  ],
  huggingface: [{ componentId: "00000000-0000-4000-8000-000000000002", externalRefId: "smoke-hf-qwen", externalId: "Qwen/Qwen3-Coder-30B-A3B-Instruct", externalUrl: "https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct" }],
  openrouter: [{ componentId: "00000000-0000-4000-8000-000000000010", externalRefId: "smoke-or-qwen", externalId: "qwen/qwen3-32b", externalUrl: "https://openrouter.ai/qwen/qwen3-32b" }],
  ollama: [],
};
