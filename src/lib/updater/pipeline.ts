import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";
import { canAutoApply, classifyRisk } from "./policy";
import { observationFingerprint } from "./normalize";
import { updaters } from "./adapters";
import type { AdapterId, ExternalRefTarget, NormalizedObservation } from "./types";

type AdminClient = SupabaseClient<Database>;
function asJson(value: unknown): Json { return value as Json; }
function sourceIdFor(adapterId: AdapterId) { return { github: "40000000-0000-4000-8000-000000000001", huggingface: "40000000-0000-4000-8000-000000000002", openrouter: "40000000-0000-4000-8000-000000000003", ollama: "40000000-0000-4000-8000-000000000004" }[adapterId]; }
function fingerprint(observation: NormalizedObservation) { return observationFingerprint(observation.adapterId, observation.externalEntityId, observation.fieldName, observation.observedValue); }

async function must<T>(result: { data: T | null; error: { message: string } | null }, label: string): Promise<T> {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${label}: no data returned`);
  return result.data;
}

export async function runUpdater(client: AdminClient, adapterId: AdapterId, options: { smoke?: boolean } = {}) {
  const sourceId = sourceIdFor(adapterId);
  const source = await must(await client.from("update_sources").select("id,enabled,configuration").eq("id", sourceId).single(), "load updater source") as { id: string; enabled: boolean; configuration: Json };
  if (!source.enabled && !options.smoke) return { adapterId, skipped: true, reason: "Adapter is disabled." };
  const refs = await must(await client.from("component_external_refs").select("id,component_id,external_id,external_url").eq("source_system", adapterId), "load external refs");
  const targets: ExternalRefTarget[] = refs.map((row) => ({ externalRefId: row.id, componentId: row.component_id, externalId: row.external_id, externalUrl: row.external_url }));
  const started = await client.from("update_runs").insert({ update_source_id: sourceId, adapter_id: adapterId, status: "running", started_at: new Date().toISOString(), metadata: { smoke: Boolean(options.smoke) } }).select("id").maybeSingle();
  if (started.error?.code === "23505") return { adapterId, skipped: true, reason: "A run for this adapter is already active." };
  const run = await must(started, "create update run") as { id: string };
  const config = source.configuration as { timeoutMs?: number; concurrency?: number };
  let observations: NormalizedObservation[] = [];
  let error: Error | undefined;
  try {
    observations = await updaters[adapterId].discover({ targets, fetch, now: () => new Date(), token: adapterId === "github" ? process.env.GITHUB_TOKEN : adapterId === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.HUGGINGFACE_TOKEN, timeoutMs: config.timeoutMs ?? 8000, concurrency: config.concurrency ?? 2, userAgent: "AI-Patchbay-Updater/0.1 (+https://github.com/ai-patchbay)" });
  } catch (cause) { error = cause instanceof Error ? cause : new Error("Unknown adapter failure"); }

  let observationsCreated = 0; let proposalsCreated = 0; let autoApplied = 0; let reviewRequired = 0;
  const refsByExternalId = new Map(refs.map((row) => [row.external_id, row]));
  for (const item of observations) {
    const ref = refsByExternalId.get(item.externalEntityId) ?? refs.find((candidate) => candidate.external_id === item.externalEntityId);
    if (!ref) continue; // Mapping is explicit: never fall back to a display name.
    const observationInsert = await client.from("update_observations").insert({ update_run_id: run.id, component_external_ref_id: ref.id, source_system: item.adapterId, external_entity_id: item.externalEntityId, observation_type: item.observationType, field_name: item.fieldName, observed_value: asJson(item.observedValue), source_url: item.sourceUrl, source_timestamp: item.sourceTimestamp ?? null, retrieved_at: item.retrievedAt, payload_hash: item.payloadHash, payload_snapshot: asJson(item.payloadSnapshot), confidence: item.confidence, authority: item.authority, fingerprint: fingerprint(item) }).select("id").maybeSingle();
    if (observationInsert.error?.code === "23505") continue;
    const stored = await must(observationInsert, "store observation") as { id: string }; observationsCreated += 1;
    const risk = classifyRisk(item.fieldName);
    const proposalFingerprint = createHash("sha256").update(`${ref.component_id}:${item.fieldName}:${item.payloadHash}`).digest("hex");
    const existing = await client.from("proposed_changes").select("id").eq("fingerprint", proposalFingerprint).eq("change_status", "pending").maybeSingle();
    if (existing.data) continue;
    await client.from("proposed_changes").update({ change_status: "superseded", superseded_by: null }).eq("target_component_id", ref.component_id).eq("field_name", item.fieldName).eq("change_status", "pending");
    const proposal = await must(await client.from("proposed_changes").insert({ update_run_id: run.id, entity_table: "components", entity_id: ref.component_id, target_component_id: ref.component_id, observation_id: stored.id, operation: "set_component_last_verified_at", field_name: item.fieldName, risk_classification: risk, source_authority: item.authority, source_url: item.sourceUrl, confidence: item.confidence, objective_change: risk === "low", before_value: null, proposed_value: asJson({ last_verified_at: item.sourceTimestamp ?? item.retrievedAt, observed_value: item.observedValue }), rationale: `${item.adapterId} reported ${item.fieldName} for explicit external reference ${item.externalEntityId}.`, fingerprint: proposalFingerprint }).select("id").single(), "create proposal") as { id: string };
    proposalsCreated += 1;
    await client.from("update_audit_events").insert({ proposal_id: proposal.id, update_run_id: run.id, action: "proposal_created", after_value: asJson(item.observedValue), detail: { adapter: item.adapterId, risk } });
    if (canAutoApply(item)) {
      const applied = await client.rpc("review_update_proposal", { p_proposal_id: proposal.id, p_decision: "approve", p_review_notes: "Automatic low-risk application from an exact authoritative external reference." });
      if (applied.error) throw new Error(`Auto-apply proposal ${proposal.id}: ${applied.error.message}`);
      autoApplied += 1;
    } else {
      reviewRequired += 1;
    }
  }
  const status = error ? (observations.length ? "partial" : "failed") : "succeeded";
  await client.from("update_runs").update({ status, completed_at: new Date().toISOString(), finished_at: new Date().toISOString(), records_examined: targets.length, observations_created: observationsCreated, proposals_created: proposalsCreated, proposals_auto_applied: autoApplied, proposals_requiring_review: reviewRequired, error_count: error ? 1 : 0, error_summary: error?.message ?? null }).eq("id", run.id);
  return { runId: run.id, adapterId, status, recordsExamined: targets.length, observationsCreated, proposalsCreated, proposalsAutoApplied: autoApplied, proposalsRequiringReview: reviewRequired, error: error?.message };
}
