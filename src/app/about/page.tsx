import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · AI Patchbay",
  description: "How AI Patchbay represents sourced AI ecosystem connections and trust.",
};

export default function AboutPage() {
  return <main className="about-page">
    <span className="eyebrow">About AI Patchbay</span>
    <h1>A map, not a claim of everything.</h1>
    <p>AI Patchbay is a visual, evidence-aware map of AI creators, models, runtimes, providers, agents, protocols, and tools. Expand the tree to explore, then inspect a record or connection for its sources.</p>
    <section><h2>How to read connections</h2><dl><div><dt>Verified</dt><dd>Supported by official documentation, a first-party source, or an explicitly recorded internal test.</dd></div><div><dt>Community</dt><dd>Supported by a credible community source; review it before relying on it for production.</dd></div><div><dt>Inferred or unverified</dt><dd>Shown as a lower-confidence possibility, not a confirmed integration.</dd></div></dl></section>
    <section><h2>Freshness and coverage</h2><p>AI tooling changes quickly, so records show when they were last checked. The catalog is deliberately curated. If something is missing, it may simply not have been researched or evidenced yet—not that it cannot work.</p></section>
    <div className="hero-actions"><Link href="/explore" className="button primary">Explore the ecosystem</Link><Link href="/build" className="button secondary">Build a stack</Link></div>
  </main>;
}
