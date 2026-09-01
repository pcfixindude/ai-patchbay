import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/database.types";
import { provisionUser, provisioningInputSchema } from "../src/lib/auth/provisioning";

async function passwordFromStdin() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

const password = process.argv[3] === "-" ? await passwordFromStdin() : process.argv[3];
const input = provisioningInputSchema.parse({ email: process.argv[2], password, role: process.argv[4] });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SERVICE_ROLE_KEY before provisioning.");
const client = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const result = await provisionUser({
  createUser: async ({ email, password: userPassword }) => {
    const { data, error } = await client.auth.admin.createUser({ email, password: userPassword, email_confirm: true });
    return { user: data.user, error };
  },
  listUsers: async (page, perPage) => {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    return { users: data.users, error };
  },
  upsertProfile: async (profile) => client.from("profiles").upsert(profile),
}, input);
console.log(`${result.created ? "Provisioned" : "Updated"} ${input.role} ${input.email}.`);
