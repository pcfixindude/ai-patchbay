import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { auditCatalog, formatCatalogAudit } from "../src/lib/catalog/audit";
import type { Database } from "../src/lib/database.types";

function localServiceRoleKey(url: string) {
  if (!url.includes("127.0.0.1") && !url.includes("localhost")) return undefined;
  const status = execFileSync("pnpm", ["supabase", "status", "-o", "env"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const line = status.split("\n").find((value) => value.startsWith("SECRET_KEY=")) ?? status.split("\n").find((value) => value.startsWith("SERVICE_ROLE_KEY="));
  return line?.slice(line.indexOf("=") + 1).replace(/^['"]|['"]$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? (url ? localServiceRoleKey(url) : undefined);
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and a server-only service role key are required for catalog auditing.");
const client = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const [components, edges, refs, sources, componentSources, edgeSources] = await Promise.all([
  client.from("components").select("id,slug,component_type,parent_component_id,official_website_url,docs_url,logo_path,tags").in("status", ["published", "deprecated"]),
  client.from("compatibility_edges").select("id,status,source_port_id,target_port_id"),
  client.from("component_external_refs").select("source_system"),
  client.from("sources").select("id", { count: "exact", head: true }),
  client.from("component_sources").select("component_id"),
  client.from("compatibility_edge_sources").select("compatibility_edge_id"),
]);
for (const [label, result] of Object.entries({ components, edges, refs, sources, componentSources, edgeSources })) if (result.error) throw new Error(`Could not read ${label}: ${result.error.message}`);
const evidenceComponents = new Set((componentSources.data ?? []).map((row) => row.component_id));
const verifiedEdgeIds = new Set((edges.data ?? []).filter((edge) => ["verified_official", "verified_first_party", "verified_community", "tested_internal"].includes(edge.status)).map((edge) => edge.id));
const evidencedEdgeIds = new Set((edgeSources.data ?? []).map((row) => row.compatibility_edge_id));
const audit = auditCatalog({ components: components.data ?? [], edges: edges.data ?? [], externalRefs: refs.data ?? [], sourceCount: sources.count ?? 0, componentEvidenceCount: evidenceComponents.size, verifiedEdgeEvidenceCount: [...verifiedEdgeIds].filter((id) => evidencedEdgeIds.has(id)).length, requiredRuntimeCapabilities: { "llama-cpp": ["CUDA", "CPU"] } });
if (audit.verifiedEdgesMissingEvidence > 0) throw new Error(`${audit.verifiedEdgesMissingEvidence} verified compatibility edge(s) lack attached evidence.`);
if (audit.requiredRuntimeCapabilityGaps.length > 0) throw new Error(`Required runtime capability tags are missing: ${audit.requiredRuntimeCapabilityGaps.join(", ")}.`);
console.log(formatCatalogAudit(audit));
