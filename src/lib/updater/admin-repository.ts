import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { freshnessLabel } from "./freshness";

export async function getAdminUpdateCenter(client: SupabaseClient<Database>) {
  const [runs, proposals, components] = await Promise.all([
    client.from("update_runs").select("id,adapter_id,status,created_at,completed_at,records_examined,observations_created,proposals_created,proposals_auto_applied,proposals_requiring_review,error_count,error_summary").order("created_at", { ascending: false }).limit(24),
    client.from("proposed_changes").select("id,target_component_id,field_name,operation,risk_classification,source_authority,source_url,confidence,change_status,proposed_value,rationale,created_at,review_notes").order("created_at", { ascending: false }).limit(40),
    client.from("components").select("id,name,slug,last_verified_at").in("status", ["published", "deprecated"]).eq("visibility", "public"),
  ]);
  if (runs.error) throw new Error(`Unable to load update runs: ${runs.error.message}`);
  if (proposals.error) throw new Error(`Unable to load proposed changes: ${proposals.error.message}`);
  if (components.error) throw new Error(`Unable to load component freshness: ${components.error.message}`);
  const componentById = new Map(components.data.map((component) => [component.id, component]));
  return {
    runs: runs.data,
    proposals: proposals.data.map((proposal) => ({ ...proposal, component: proposal.target_component_id ? componentById.get(proposal.target_component_id) : undefined })),
    staleComponents: components.data.filter((component) => freshnessLabel(component.last_verified_at ?? undefined) === "Stale verification"),
  };
}
