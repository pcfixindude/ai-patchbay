"use client";

import { useMemo, useState } from "react";
import { findPaths } from "@/lib/compatibility";
import type { EcosystemData, HardwareConstraints } from "@/lib/domain/types";

type TrustConstraint = "verifiedOnly" | "allowCommunityRoutes" | "allowInferredUnverifiedRoutes" | "avoidDeprecated";

export function RoutePlanner({ data }: { data: EcosystemData }) {
  const [start, setStart] = useState(() => data.components.find((component) => component.slug === "qwen3-coder-gguf")?.id ?? "");
  const [goal, setGoal] = useState(() => data.components.find((component) => component.slug === "hermes-agent")?.id ?? "");
  const [constraints, setConstraints] = useState<HardwareConstraints>({ verifiedOnly: true, allowCommunityRoutes: false, allowInferredUnverifiedRoutes: false, avoidDeprecated: true });
  const paths = useMemo(() => findPaths(start, goal, { ports: data.ports, edges: data.compatibilityEdges, components: data.components }, constraints), [constraints, data, goal, start]);
  const name = (id: string) => data.components.find((component) => component.id === id)?.shortName ?? id;
  const toggle = (key: TrustConstraint) => setConstraints((current) => ({ ...current, [key]: !current[key] }));
  return <section className="route-planner" aria-label="Route planner">
    <div className="catalog-heading"><span className="eyebrow">Route planner</span><span className="count">{paths.length}</span></div>
    <label>From<select value={start} onChange={(event) => setStart(event.target.value)}>{data.components.filter((c) => data.ports.some((p) => p.componentId === c.id && p.direction !== "input")).map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}</select></label>
    <label>To<select value={goal} onChange={(event) => setGoal(event.target.value)}>{data.components.filter((c) => data.ports.some((p) => p.componentId === c.id && p.direction !== "output")).map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}</select></label>
    <div className="route-constraints">
      <label><input type="checkbox" checked={constraints.verifiedOnly ?? false} onChange={() => toggle("verifiedOnly")} /> Verified only</label>
      <label><input type="checkbox" checked={constraints.allowCommunityRoutes ?? false} onChange={() => toggle("allowCommunityRoutes")} /> Allow community</label>
      <label><input type="checkbox" checked={constraints.allowInferredUnverifiedRoutes ?? false} onChange={() => toggle("allowInferredUnverifiedRoutes")} /> Allow inferred/unverified</label>
      <label><input type="checkbox" checked={constraints.avoidDeprecated ?? true} onChange={() => toggle("avoidDeprecated")} /> Avoid deprecated</label>
    </div>
    {paths.slice(0, 3).map((path) => { const summary = path.trustSummary; return <div className="route-result" key={path.edgeIds.join("-")}><strong>{summary?.inferred || summary?.unverified ? "Lower confidence" : summary?.verifiedCommunity ? "Community-supported" : "Highest confidence"}</strong><span>{path.componentIds.map(name).join(" → ")}</span>{summary && <small>Official/first-party: {summary.verifiedOfficial + summary.verifiedFirstParty + summary.testedInternal} · Community: {summary.verifiedCommunity} · Inferred: {summary.inferred} · Unverified: {summary.unverified} · Stale: {summary.staleEdges} · Deprecated: {summary.deprecatedComponents} · Weakest: {summary.weakestTrust?.replaceAll("_", " ") ?? "none"}</small>}<small>{path.explanation?.join(" · ")}</small>{path.warnings.length > 0 && <small>Lower confidence: {path.warnings.join(", ")}</small>}</div>; })}
    {!paths.length && <p className="empty-copy">No route satisfies {constraints.verifiedOnly ? "Verified only" : "the selected trust policy"}{constraints.avoidDeprecated ? " + Avoid deprecated" : ""}. Allow community or inferred routes to relax it.</p>}
  </section>;
}
