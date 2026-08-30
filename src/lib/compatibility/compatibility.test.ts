import { describe, expect, it } from "vitest";
import { compatibilityEdges, components, portById, ports } from "@/data/ecosystem";
import { canConnect, findCompatibleTargets, validateBuild } from "./index";

const context = { ports, edges: compatibilityEdges, components };
const getPort = (id: string) => {
  const port = portById.get(id);
  if (!port) throw new Error(`Missing test port ${id}`);
  return port;
};

describe("typed-port compatibility", () => {
  it("accepts a verified model to runtime connection", () => {
    const result = canConnect(getPort("qwen-gguf-out"), getPort("ollama-model-in"), context);
    expect(result.allowed).toBe(true);
    expect(result.status).toBe("verified_official");
  });

  it("rejects model weights connected directly to an agent API", () => {
    const result = canConnect(getPort("qwen-gguf-out"), getPort("hermes-model-api-in"), context);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/need a compatible runtime/i);
  });

  it("accepts a runtime API consumed by a compatible agent", () => {
    expect(canConnect(getPort("ollama-api-out"), getPort("hermes-model-api-in"), context).allowed).toBe(true);
  });

  it("rejects the wrong protocol and explains it", () => {
    const result = canConnect(getPort("hermes-mcp-out"), getPort("ollama-model-in"), context);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/incompatible port types/i);
  });

  it("finds only evidence-backed valid targets", () => {
    const targets = findCompatibleTargets(getPort("qwen-gguf-out"), context).map((port) => port.id);
    expect(targets).toEqual(expect.arrayContaining(["ollama-model-in", "lmstudio-model-in"]));
    expect(targets).not.toContain("hermes-model-api-in");
  });

  it("flags a build containing unverified links", () => {
    const result = validateBuild([{ sourcePortId: "mcp-server-out", targetPortId: "github-tool-in" }], context);
    expect(result.status).toBe("contains_unverified_links");
  });

  it("treats deprecated compatibility as invalid", () => {
    const edge = { ...compatibilityEdges[0], id: "deprecated", status: "deprecated" as const };
    const result = canConnect(getPort(edge.sourcePortId), getPort(edge.targetPortId), { ...context, edges: [edge] });
    expect(result.allowed).toBe(false);
  });
});
