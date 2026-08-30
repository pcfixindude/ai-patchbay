"use client";

import { TriangleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="admin-page">
      <section className="admin-lock">
        <span className="monogram large"><TriangleAlert size={24} /></span>
        <span className="eyebrow">Data source unavailable</span>
        <h1>The ecosystem could not be loaded</h1>
        <p>Check the configured Supabase project and try again. AI Patchbay will not silently substitute fixture data for a failed database connection.</p>
        <button className="button primary" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
