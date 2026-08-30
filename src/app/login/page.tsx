import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentAuthorization } from "@/lib/auth/authorization";

export const metadata = { title: "Sign in · AI Patchbay" };

function safeNext(value: string | undefined) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/admin"; }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { user } = await getCurrentAuthorization();
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  if (user) redirect(next);
  return <main className="login-page"><section className="login-card"><span className="eyebrow">Editor access</span><h1>Sign in to AI Patchbay</h1><p>Editorial access is provisioned intentionally. Signing in alone does not grant editor privileges.</p><LoginForm next={next} /></section></main>;
}
