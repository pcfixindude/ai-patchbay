import { describe, expect, it, vi } from "vitest";
import { provisionUser, type ProvisioningGateway } from "./provisioning";

const input = { email: "admin@patchbay.test", password: "a-secure-password", role: "admin" as const };
const existingUser = { id: "90000000-0000-4000-8000-000000000002", email: input.email };

function gateway(overrides: Partial<ProvisioningGateway> = {}): ProvisioningGateway {
  return {
    createUser: vi.fn().mockResolvedValue({ user: existingUser, error: null }),
    listUsers: vi.fn().mockResolvedValue({ users: [], error: null }),
    upsertProfile: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  };
}

describe("production user provisioning", () => {
  it("creates a new Auth user and matching admin profile", async () => {
    const client = gateway();
    const result = await provisionUser(client, input);

    expect(result).toEqual({ created: true, user: existingUser });
    expect(client.createUser).toHaveBeenCalledWith({ email: input.email, password: input.password });
    expect(client.listUsers).not.toHaveBeenCalled();
    expect(client.upsertProfile).toHaveBeenCalledWith({ id: existingUser.id, role: "admin", display_name: "admin" });
  });

  it("repairs a missing profile for an already-existing Auth user without creating a duplicate", async () => {
    const client = gateway({
      createUser: vi.fn().mockResolvedValue({ user: null, error: new Error("A user with this email address has already been registered") }),
      listUsers: vi.fn().mockResolvedValue({ users: [existingUser], error: null }),
    });
    const result = await provisionUser(client, input);

    expect(result).toEqual({ created: false, user: existingUser });
    expect(client.createUser).toHaveBeenCalledTimes(1);
    expect(client.upsertProfile).toHaveBeenCalledWith({ id: existingUser.id, role: "admin", display_name: "admin" });
  });

  it("promotes the exact existing user through the profile upsert", async () => {
    const client = gateway({
      createUser: vi.fn().mockResolvedValue({ user: null, error: new Error("already registered") }),
      listUsers: vi.fn().mockResolvedValue({ users: [{ id: "other", email: "other@patchbay.test" }, existingUser], error: null }),
    });

    await provisionUser(client, input);
    expect(client.upsertProfile).toHaveBeenCalledWith({ id: existingUser.id, role: "admin", display_name: "admin" });
  });

  it("does not modify a profile when the failed create cannot be resolved to the requested email", async () => {
    const client = gateway({
      createUser: vi.fn().mockResolvedValue({ user: null, error: new Error("already registered") }),
      listUsers: vi.fn().mockResolvedValue({ users: [{ id: "other", email: "other@patchbay.test" }], error: null }),
    });

    await expect(provisionUser(client, input)).rejects.toThrow("already registered");
    expect(client.upsertProfile).not.toHaveBeenCalled();
  });
});
