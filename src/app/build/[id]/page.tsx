import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default async function SavedBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="centered-page"><span className="monogram large"><LockKeyhole size={24} /></span><span className="eyebrow">Saved build</span><h1>{id}</h1><p>Account-backed builds are reserved for the Supabase persistence milestone. V1 share links use validated, URL-safe state on the builder.</p><Link className="button primary" href="/build">Open builder</Link></main>;
}
