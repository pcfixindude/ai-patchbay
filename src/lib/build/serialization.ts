import { savedBuildSchema, type SavedBuild } from "@/lib/domain/schemas";

function toBase64Url(value: string): string {
  if (typeof window === "undefined") return Buffer.from(value, "utf8").toString("base64url");
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  if (typeof window === "undefined") return Buffer.from(value, "base64url").toString("utf8");
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function serializeBuild(build: SavedBuild): string {
  return toBase64Url(JSON.stringify(savedBuildSchema.parse(build)));
}

export function deserializeBuild(value: string): SavedBuild {
  if (value.length > 80_000) throw new Error("Build payload is too large.");
  try {
    return savedBuildSchema.parse(JSON.parse(fromBase64Url(value)));
  } catch {
    throw new Error("This build link is malformed or uses an unsupported format.");
  }
}
