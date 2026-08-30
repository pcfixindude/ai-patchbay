export type EdgeDispatcherEnv = { serviceSecret?: string; runnerUrl?: string; runnerSecret?: string };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** Runtime-neutral service dispatcher; Deno and Vitest exercise the same auth boundary. */
export async function dispatchEcosystemUpdate(request: Request, env: EdgeDispatcherEnv, fetcher: typeof fetch = fetch) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!env.serviceSecret || request.headers.get("apikey") !== env.serviceSecret) return json({ error: "unauthorized" }, 401);
  const payload = await request.json().catch(() => null) as { adapterId?: string } | null;
  if (!payload || (payload.adapterId !== undefined && !["github", "huggingface", "openrouter", "ollama"].includes(payload.adapterId))) return json({ error: "invalid_adapter" }, 400);
  if (!env.runnerUrl || !env.runnerSecret) return json({ error: "runner_not_configured" }, 503);
  const response = await fetcher(env.runnerUrl, { method: "POST", headers: { "content-type": "application/json", "x-ecosystem-update-secret": env.runnerSecret }, body: JSON.stringify(payload) });
  return new Response(await response.text(), { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/json" } });
}
