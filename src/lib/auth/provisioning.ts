import { z } from "zod";

export const provisioningInputSchema = z.object({
  email: z.email(),
  password: z.string().min(12),
  role: z.enum(["editor", "admin"]),
});

export type ProvisioningInput = z.infer<typeof provisioningInputSchema>;

type AuthUser = { id: string; email?: string | null };
type AuthResult = { user: AuthUser | null; error: Error | null };

export type ProvisioningGateway = {
  createUser: (input: { email: string; password: string }) => Promise<AuthResult>;
  listUsers: (page: number, perPage: number) => Promise<{ users: AuthUser[]; error: Error | null }>;
  upsertProfile: (profile: { id: string; role: ProvisioningInput["role"]; display_name: string }) => Promise<{ error: Error | null }>;
};

async function findUserByEmail(gateway: ProvisioningGateway, email: string) {
  const normalizedEmail = email.toLowerCase();
  const perPage = 1_000;

  for (let page = 1; page <= 100; page += 1) {
    const { users, error } = await gateway.listUsers(page, perPage);
    if (error) throw error;
    const user = users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (users.length < perPage) return null;
  }

  throw new Error("Unable to resolve the existing Auth user within the provisioning pagination limit.");
}

export async function provisionUser(gateway: ProvisioningGateway, rawInput: ProvisioningInput) {
  const input = provisioningInputSchema.parse(rawInput);
  const { user: createdUser, error: createError } = await gateway.createUser({ email: input.email, password: input.password });
  const user = createdUser ?? (createError ? await findUserByEmail(gateway, input.email) : null);

  if (!user) throw createError ?? new Error("Auth user creation returned no user.");

  const { error: profileError } = await gateway.upsertProfile({
    id: user.id,
    role: input.role,
    display_name: input.email.split("@")[0],
  });
  if (profileError) throw profileError;

  return { created: !createError, user };
}
