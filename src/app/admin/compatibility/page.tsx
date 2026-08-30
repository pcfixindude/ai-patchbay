import Link from "next/link";
import { CompatibilityEditor } from "./compatibility-editor";
import { requireEditor } from "@/lib/auth/authorization";

export const metadata = { title: "Compatibility editor · AI Patchbay" };

export default async function CompatibilityPage() {
  const { supabase } = await requireEditor("/admin/compatibility");
  const [{ data: ports, error }, { data: edges }, { data: sources }, { data: links }, { data: audits }] = await Promise.all([
    supabase.from("ports").select("id,name,direction,protocol_type,transport_type,data_type,description,components!inner(id,name)").order("name"),
    supabase.from("compatibility_edges").select("id,source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_notes,last_verified_at").order("updated_at", { ascending:false }),
    supabase.from("sources").select("id,title,url,source_type,publisher,publication_date,retrieved_at,notes").order("retrieved_at", { ascending:false }).limit(100),
    supabase.from("compatibility_edge_sources").select("compatibility_edge_id,source_id"),
    supabase.from("update_audit_events").select("id,actor_id,action,created_at,before_value,after_value,detail").eq("action", "compatibility_saved").order("created_at", { ascending:false }).limit(100),
  ]);
  if (error) throw new Error(error.message);
  return <main className="detail-page"><Link href="/admin" className="detail-link">← Update Center</Link><CompatibilityEditor ports={ports} edges={edges ?? []} sources={sources ?? []} links={links ?? []} audits={audits ?? []} /></main>;
}
