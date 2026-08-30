import Link from "next/link";
import { BulkReviewClient } from "./bulk-review-client";
import { requireEditor } from "@/lib/auth/authorization";

export const metadata = { title: "Review queue · AI Patchbay" };

export default async function ProposalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const status = typeof params.status === "string" ? params.status : "pending"; const risk = typeof params.risk === "string" ? params.risk : undefined; const query = typeof params.q === "string" ? params.q : "";
  const { supabase } = await requireEditor("/admin/proposals"); let request = supabase.from("proposed_changes").select("id,target_component_id,field_name,risk_classification,source_authority,change_status,created_at,rationale").eq("change_status", status).order("created_at", { ascending: false }).limit(100);
  if (risk) request = request.eq("risk_classification", risk); const { data: rows, error } = await request; if (error) throw new Error(error.message);
  const ids = [...new Set(rows.flatMap((row) => row.target_component_id ? [row.target_component_id] : []))]; const { data: components } = ids.length ? await supabase.from("components").select("id,name,component_type").in("id", ids) : { data: [] }; const names = new Map(components?.map((item) => [item.id, item]) ?? []);
  const visible = rows.filter((row) => !query || `${names.get(row.target_component_id ?? "")?.name ?? ""} ${row.field_name ?? ""} ${row.rationale ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const proposalRows = visible.map((row) => ({ id:row.id, component:names.get(row.target_component_id ?? "")?.name ?? "Unmapped component", field:row.field_name, risk:row.risk_classification, authority:row.source_authority, createdAt:row.created_at }));
  return <main className="detail-page"><Link href="/admin" className="detail-link">← Update Center</Link><section className="detail-card"><span className="eyebrow">Editorial review</span><h1>Review queue</h1><form className="filter-bar"><input name="q" defaultValue={query} placeholder="Search proposals" /><select name="status" defaultValue={status}><option value="pending">Pending</option><option value="auto_applied">Auto-applied</option><option value="rejected">Rejected</option><option value="approved">Approved</option></select><select name="risk" defaultValue={risk ?? ""}><option value="">All risks</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><button className="button secondary">Filter</button></form><BulkReviewClient proposals={proposalRows}/></section></main>;
}
