"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter(); const [error, setError] = useState<string>(); const [pending, setPending] = useState(false);
  async function signIn(formData: FormData) {
    setPending(true); setError(undefined);
    const email = String(formData.get("email") ?? "").trim(); const password = String(formData.get("password") ?? "");
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
    if (authError) { setError("Invalid email or password."); setPending(false); return; }
    router.replace(next); router.refresh();
  }
  return <form action={signIn} className="login-form"><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button></form>;
}
