import { describe, expect, it } from "vitest";
import type { SavedBuild } from "@/lib/domain/schemas";
import { deserializeBuild, serializeBuild } from "./serialization";

const build: SavedBuild = {
  version: 1,
  name: "Local coding stack",
  nodes: [
    { instanceId: "qwen-1", componentId: "model-qwen3-coder-gguf", position: { x: 10, y: 20 } },
    { instanceId: "ollama-1", componentId: "runtime-ollama", position: { x: 300, y: 20 } },
  ],
  connections: [{ id: "c1", sourceNodeId: "qwen-1", sourcePortId: "qwen-gguf-out", targetNodeId: "ollama-1", targetPortId: "ollama-model-in" }],
};

describe("saved build serialization", () => {
  it("round-trips a valid build", () => expect(deserializeBuild(serializeBuild(build))).toEqual(build));
  it("rejects malformed graph input", () => expect(() => deserializeBuild("not-valid-base64-json")).toThrow(/malformed/i));
  it("rejects unknown schema versions", () => {
    const invalid = Buffer.from(JSON.stringify({ ...build, version: 99 })).toString("base64url");
    expect(() => deserializeBuild(invalid)).toThrow(/unsupported format/i);
  });
});
