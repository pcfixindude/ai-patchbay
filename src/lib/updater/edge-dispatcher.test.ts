import { describe, expect, it, vi } from "vitest";
import { dispatchEcosystemUpdate } from "./edge-dispatcher";

const env = { serviceSecret: "test-secret", runnerUrl: "https://runner.test/update", runnerSecret: "runner-secret" };
describe("edge dispatcher service auth", () => {
  it("rejects missing or invalid apikeys", async () => {
    expect((await dispatchEcosystemUpdate(new Request("https://edge.test", { method:"POST", body:"{}" }), env)).status).toBe(401);
    expect((await dispatchEcosystemUpdate(new Request("https://edge.test", { method:"POST", headers:{apikey:"bad"}, body:"{}" }), env)).status).toBe(401);
  });
  it("rejects malformed and unsupported requests", async () => {
    expect((await dispatchEcosystemUpdate(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:"nope" }), env)).status).toBe(400);
    expect((await dispatchEcosystemUpdate(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"unknown"}) }), env)).status).toBe(400);
  });
  it("forwards a valid secret-authenticated request without exposing the secret as bearer auth", async () => {
    const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({status:"succeeded"}),{status:200,headers:{"content-type":"application/json"}}));
    const result=await dispatchEcosystemUpdate(new Request("https://edge.test", { method:"POST", headers:{apikey:"test-secret"}, body:JSON.stringify({adapterId:"github"}) }),env,fetcher);
    expect(result.status).toBe(200); expect(fetcher.mock.calls[0][1].headers).toMatchObject({"x-ecosystem-update-secret":"runner-secret"}); expect(fetcher.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});
