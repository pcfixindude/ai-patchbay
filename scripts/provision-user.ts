import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "../src/lib/database.types";

const input = z.object({ email: z.email(), password: z.string().min(12), role: z.enum(["editor", "admin"]) }).parse({ email: process.argv[2], password: process.argv[3], role: process.argv[4] });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SERVICE_ROLE_KEY before provisioning.");
const client = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const { data, error } = await client.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true });
if (error) throw error;
const { error: profileError } = await client.from("profiles").upsert({ id: data.user.id, role: input.role, display_name: input.email.split("@")[0] });
if (profileError) throw profileError;
console.log(`Provisioned ${input.role} ${input.email}.`);
