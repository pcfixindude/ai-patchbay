import { z } from "zod";

export class UpdaterHttpError extends Error {
  constructor(message: string, readonly retryable: boolean) { super(message); this.name = "UpdaterHttpError"; }
}

const retryableStatus = new Set([408, 429, 500, 502, 503, 504]);

export async function fetchJson<T>(fetcher: typeof fetch, url: string, options: { headers: Record<string, string>; timeoutMs: number; retries?: number }, schema: z.ZodType<T>): Promise<T> {
  const retries = options.retries ?? 2;
  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const response = await fetcher(url, { headers: options.headers, signal: controller.signal });
      if (!response.ok) {
        const retryable = retryableStatus.has(response.status);
        if (retryable && attempt < retries) { await backoff(attempt); continue; }
        throw new UpdaterHttpError(`Request to ${url} failed with ${response.status}.`, retryable);
      }
      return schema.parse(await response.json());
    } catch (error) {
      const retryable = error instanceof UpdaterHttpError ? error.retryable : true;
      if (retryable && attempt < retries) { await backoff(attempt); continue; }
      throw error instanceof Error ? error : new UpdaterHttpError(`Request to ${url} failed.`, retryable);
    } finally { clearTimeout(timer); }
  }
}

export async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const output: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index]);
    }
  });
  await Promise.all(workers);
  return output;
}

async function backoff(attempt: number) {
  await new Promise((resolve) => setTimeout(resolve, 150 * 2 ** attempt));
}
