import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { runUpdater } from "../src/lib/updater/pipeline";
import type { Database } from "../src/lib/database.types";
import type { AdapterId } from "../src/lib/updater/types";
import { defaultUpdaterConfiguration, smokeTargets } from "../src/lib/updater/config";
import { updaters } from "../src/lib/updater/adapters";

const args = process.argv.slice(2);
const smoke = args.includes("--smoke");
const requested = args.filter((arg) => !arg.startsWith("--"));
const adapterIds: AdapterId[] = requested.length ? requested as AdapterId[] : ["github", "huggingface", "openrouter"];
for (const adapterId of adapterIds) if (!(adapterId in updaters)) throw new Error(`Unsupported adapter: ${adapterId}`);
if (smoke) {
  for (const adapterId of adapterIds) {
    const config = defaultUpdaterConfiguration[adapterId];
    const observations = await updaters[adapterId].discover({ targets: smokeTargets[adapterId], fetch, now: () => new Date(), token: adapterId === "github" ? process.env.GITHUB_TOKEN : adapterId === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.HUGGINGFACE_TOKEN, timeoutMs: config.timeoutMs, concurrency: config.concurrency, userAgent: "AI-Patchbay-Updater/0.1 (+https://github.com/ai-patchbay)" });
    console.log(JSON.stringify({ adapterId, observations }, null, 2));
  }
  process.exit(0);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
function localServiceRoleKey() {
  if (!url?.includes("127.0.0.1") && !url?.includes("localhost")) return undefined;
  const status = execFileSync("pnpm", ["supabase", "status", "-o", "env"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const value = status.split("\n").find((line) => line.startsWith("SECRET_KEY="))?.slice("SECRET_KEY=".length) ?? status.split("\n").find((line) => line.startsWith("SERVICE_ROLE_KEY="))?.slice("SERVICE_ROLE_KEY=".length);
  return value?.replace(/^['"]|['"]$/g, "");
}
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? localServiceRoleKey();
if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SERVICE_ROLE_KEY are required for updater writes.");
const client = createClient<Database>(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
for (const adapterId of adapterIds) console.log(JSON.stringify(await runUpdater(client, adapterId, { smoke }), null, 2));
