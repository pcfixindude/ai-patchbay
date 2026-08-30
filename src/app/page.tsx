import Link from "next/link";
import { ArrowRight, Cable, CheckCircle2, Database, ShieldCheck } from "lucide-react";

const chain = [
  { code: "QW", name: "Qwen3-Coder", type: "GGUF model", port: "WEIGHTS" },
  { code: "OL", name: "Ollama", type: "Local runtime", port: "OPENAI API" },
  { code: "HA", name: "Hermes Agent", type: "Agent harness", port: "MCP" },
  { code: "GH", name: "GitHub", type: "Tool", port: "REPOS" },
];

export default function Home() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow-line"><span className="live-dot" />A visual guide to the AI ecosystem</div>
          <h1>Understand what connects.<br /><span>Build with confidence.</span></h1>
          <p>Explore how AI models, runtimes, agents, APIs, and tools relate — then build a stack when you are ready.</p>
          <div className="hero-actions">
            <Link href="/explore" className="button primary">Explore ecosystem <ArrowRight size={16} /></Link>
            <Link href="/build" className="button secondary"><Cable size={16} /> Build a stack</Link>
          </div>
          <div className="trust-row">
            <span><CheckCircle2 size={14} /> Typed ports</span><span><ShieldCheck size={14} /> Evidence-backed</span><span><Database size={14} /> Data-driven</span>
          </div>
        </div>
        <div className="hero-bay" aria-label="Example compatible AI signal chain">
          <div className="bay-toolbar"><span>PATCHBAY / EXAMPLE 01</span><span className="bay-readout">CHAIN VALID</span></div>
          <div className="signal-chain">
            {chain.map((item, index) => (
              <div className="signal-stage" key={item.name}>
                <div className="mini-equipment"><div className="mini-screws"><i /><i /></div><span className="monogram">{item.code}</span><span><strong>{item.name}</strong><small>{item.type}</small></span><div className="mini-port"><i /><small>{item.port}</small></div></div>
                {index < chain.length - 1 && <div className="patch-cable"><span /><i /></div>}
              </div>
            ))}
          </div>
          <div className="bay-footer"><span>4 COMPONENTS</span><span>3 VERIFIED LINKS</span><span>LOCAL-FIRST</span></div>
        </div>
      </section>
      <section className="landing-bottom">
          <div><span className="metric">Explore</span><span>the ecosystem tree</span></div><div><span className="metric">Build</span><span>a compatible stack</span></div><div><span className="metric">Recommend</span><span>based on your needs</span></div>
        <p>Connections carry evidence and trust context. The catalog is curated, not exhaustive: an absent connection is not proof that an integration is impossible.</p>
      </section>
    </main>
  );
}
