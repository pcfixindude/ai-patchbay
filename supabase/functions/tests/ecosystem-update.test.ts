import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "../ecosystem-update/index.ts";

const originalFetch = globalThis.fetch;
const originalGet = Deno.env.get;
function setEnvironment(values: Record<string, string | undefined>) {
  Deno.env.get = ((name: string) => values[name]) as typeof Deno.env.get;
}

Deno.test("real handler rejects missing and invalid service apikey", async () => {
  setEnvironment({ ECOSYSTEM_UPDATE_SHARED_SECRET: "test-secret", ECOSYSTEM_UPDATE_RUNNER_URL: "https://runner.test", ECOSYSTEM_UPDATE_RUNNER_SECRET: "runner" });
  assertEquals((await handler(new Request("https://edge.test", { method:"POST", body:"{}" }))).status, 401);
  assertEquals((await handler(new Request("https://edge.test", { method:"POST", headers:{apikey:"wrong"}, body:"{}" }))).status, 401);
});

Deno.test("real handler rejects malformed and unsupported adapter input", async () => {
  setEnvironment({ ECOSYSTEM_UPDATE_SHARED_SECRET: "test-secret", ECOSYSTEM_UPDATE_RUNNER_URL: "https://runner.test", ECOSYSTEM_UPDATE_RUNNER_SECRET: "runner" });
  assertEquals((await handler(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:"bad-json" }))).status, 400);
  assertEquals((await handler(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"unknown"}) }))).status, 400);
});

Deno.test("real handler forwards a valid secret-authenticated request", async () => {
  setEnvironment({ ECOSYSTEM_UPDATE_SHARED_SECRET: "test-secret", ECOSYSTEM_UPDATE_RUNNER_URL: "https://runner.test", ECOSYSTEM_UPDATE_RUNNER_SECRET: "runner" });
  globalThis.fetch = ((_: RequestInfo | URL, init?: RequestInit) => {
    assertEquals((init?.headers as Record<string,string>)["x-ecosystem-update-secret"], "runner");
    assertEquals((init?.headers as Record<string,string>).Authorization, undefined);
    return Promise.resolve(new Response(JSON.stringify({ status:"succeeded", runId:"run-1" }), { status:200 }));
  }) as typeof fetch;
  const response = await handler(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"github"}) }));
  assertEquals(response.status, 200); assertEquals((await response.json()).runId, "run-1");
  globalThis.fetch = originalFetch; Deno.env.get = originalGet;
});

Deno.test("real handler preserves a locked/skipped updater result", async () => {
  setEnvironment({ ECOSYSTEM_UPDATE_SHARED_SECRET: "test-secret", ECOSYSTEM_UPDATE_RUNNER_URL: "https://runner.test", ECOSYSTEM_UPDATE_RUNNER_SECRET: "runner" });
  globalThis.fetch = (() => Promise.resolve(new Response(JSON.stringify({ adapterId:"github", skipped:true, reason:"A run for this adapter is already active." }), { status:200 }))) as typeof fetch;
  const body = await (await handler(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"github"}) }))).json();
  assertEquals(body.skipped, true); assertEquals(body.adapterId, "github"); globalThis.fetch = originalFetch;
});

Deno.test("real handler forwards partial multi-adapter summaries without rollback", async () => {
  setEnvironment({ ECOSYSTEM_UPDATE_SHARED_SECRET: "test-secret", ECOSYSTEM_UPDATE_RUNNER_URL: "https://runner.test", ECOSYSTEM_UPDATE_RUNNER_SECRET: "runner" });
  globalThis.fetch = (() => Promise.resolve(new Response(JSON.stringify({ status:"partial", results:[{adapterId:"github",status:"succeeded",observationsCreated:2},{adapterId:"huggingface",status:"failed",error:"fixture failure"}] }), { status:200 }))) as typeof fetch;
  const body = await (await handler(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"github"}) }))).json();
  assertEquals(body.status, "partial"); assertEquals(body.results[0].observationsCreated, 2); assertEquals(body.results[1].status, "failed"); globalThis.fetch = originalFetch;
});

Deno.test("repeated handler invocations forward the same idempotent request contract", async () => {
  setEnvironment({ ECOSYSTEM_UPDATE_SHARED_SECRET: "test-secret", ECOSYSTEM_UPDATE_RUNNER_URL: "https://runner.test", ECOSYSTEM_UPDATE_RUNNER_SECRET: "runner" });
  let calls=0; globalThis.fetch = (() => { calls++; return Promise.resolve(new Response(JSON.stringify({ status:"succeeded", observationsCreated:calls===1?1:0, proposalsCreated:calls===1?1:0 }), { status:200 })); }) as typeof fetch;
  const request=()=>new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"github"}) });
  const first=await (await handler(request())).json(); const second=await (await handler(request())).json();
  assertEquals(first.observationsCreated,1); assertEquals(second.observationsCreated,0); assertEquals(second.proposalsCreated,0); globalThis.fetch=originalFetch;
});
