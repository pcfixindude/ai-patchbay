import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { authFixtures } from "./auth-fixtures";
import type { Database } from "../src/lib/database.types";

function localServiceKey() {
  const output = execFileSync("pnpm", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
  const value = output.split("\n").find((line) => line.startsWith("SERVICE_ROLE_KEY="))?.slice("SERVICE_ROLE_KEY=".length).trim();
  return value?.replace(/^['"]|['"]$/g, "");
}

export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? localServiceKey();
  if (!key) throw new Error("Local Supabase service key is unavailable for E2E fixtures.");
  const admin = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  for (const [role, fixture] of Object.entries(authFixtures)) {
    const { data: listed, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) throw listError;
    let user = listed.users.find((candidate) => candidate.email === fixture.email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({ email: fixture.email, password: fixture.password, email_confirm: true });
      if (error) throw error; user = data.user;
    } else {
      const { error } = await admin.auth.admin.updateUserById(user.id, { password: fixture.password, email_confirm: true });
      if (error) throw error;
    }
    const assignedRole = role === "viewer" ? "viewer" : role;
    const { error: profileError } = await admin.from("profiles").upsert({ id: user.id, role: assignedRole, display_name: `E2E ${role}` });
    if (profileError) throw profileError;
  }
}
