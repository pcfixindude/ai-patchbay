// Hosted scheduling entrypoint. It is intentionally not deployed by this repository.
// The actual bounded collection remains in the server-only runner, invoked through an
// authenticated internal URL so no service-role credential reaches a browser.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { dispatchEcosystemUpdate } from "../../../src/lib/updater/edge-dispatcher.ts";

export async function handler(request: Request) {
  return dispatchEcosystemUpdate(request, { serviceSecret: Deno.env.get("ECOSYSTEM_UPDATE_SHARED_SECRET"), runnerUrl: Deno.env.get("ECOSYSTEM_UPDATE_RUNNER_URL"), runnerSecret: Deno.env.get("ECOSYSTEM_UPDATE_RUNNER_SECRET") });
}

if (import.meta.main) serve(handler);
