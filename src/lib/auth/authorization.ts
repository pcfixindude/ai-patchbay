import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EditorRole = "editor" | "admin";

export async function getCurrentAuthorization() {
  const supabase = await createClient();
  // getClaims validates the cookie JWT; do not use getSession() as an authorization decision.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const id = typeof claims?.sub === "string" ? claims.sub : null;
  if (!id) return { supabase, user: null, role: null };
  const user = { id, email: typeof claims?.email === "string" ? claims.email : null };
  const { data: profile } = await supabase.from("profiles").select("role,display_name").eq("id", user.id).maybeSingle();
  return { supabase, user, role: profile?.role ?? "viewer", displayName: profile?.display_name ?? null };
}

export async function requireAuthenticatedUser(next = "/admin") {
  const authorization = await getCurrentAuthorization();
  if (!authorization.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return authorization as typeof authorization & { user: NonNullable<typeof authorization.user> };
}

export async function requireEditor(next = "/admin") {
  const authorization = await requireAuthenticatedUser(next);
  if (authorization.role !== "editor" && authorization.role !== "admin") redirect(`/admin?unauthorized=role`);
  return authorization as typeof authorization & { role: EditorRole };
}

export async function requireAdmin(next = "/admin") {
  const authorization = await requireAuthenticatedUser(next);
  if (authorization.role !== "admin") redirect(`/admin?unauthorized=admin`);
  return authorization as typeof authorization & { role: "admin" };
}
