import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/** Server-only privileged client for future reviewed admin/updater operations. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase administrative credentials are not configured.");
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
