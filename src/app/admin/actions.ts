"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEditor } from "@/lib/auth/authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { runUpdater } from "@/lib/updater/pipeline";
import type { AdapterId } from "@/lib/updater/types";

const reviewInputSchema = z.object({ proposalId: z.string().uuid(), decision: z.enum(["approve", "reject"]), notes: z.string().max(1000).optional() });
const evidenceInputSchema = z.object({ componentId: z.string().uuid(), url: z.url(), title: z.string().trim().min(2).max(240), publisher: z.string().trim().min(2).max(160), sourceType: z.enum(["official_docs", "official_repo", "model_card", "announcement", "community", "internal_test"]), publicationDate: z.string().date().optional(), notes: z.string().trim().max(2000).optional() });
const compatibilityInputSchema = z.object({ sourcePortId: z.string().uuid(), targetPortId: z.string().uuid(), status: z.enum(["verified_official","verified_first_party","verified_community","tested_internal","inferred","unverified","incompatible","deprecated"]), level: z.enum(["native","compatible","partial","none"]), confidence: z.coerce.number().min(0).max(1), notes: z.string().trim().min(2).max(4000), limitations: z.string().trim().max(4000).optional(), configurationNotes: z.string().trim().max(4000).optional(), evidenceUrl: z.url().optional() });
const bulkInputSchema = z.object({ proposalIds: z.array(z.string().uuid()).min(1).max(50), decision: z.enum(["approve","reject"]), notes: z.string().max(1000).optional() });
const edgeSourceSchema = z.object({ edgeId: z.string().uuid(), sourceId: z.string().uuid() });

export async function reviewProposal(formData: FormData) {
  const input = reviewInputSchema.parse({ proposalId: formData.get("proposalId"), decision: formData.get("decision"), notes: formData.get("notes") || undefined });
  const { supabase } = await requireEditor();
  const { error } = await supabase.rpc("review_update_proposal", { p_proposal_id: input.proposalId, p_decision: input.decision, p_review_notes: input.notes });
  if (error) throw new Error(`Proposal review failed: ${error.message}`);
  revalidatePath("/admin");
}

export async function attachEvidence(formData: FormData) {
  const input = evidenceInputSchema.parse({ componentId: formData.get("componentId"), url: formData.get("url"), title: formData.get("title"), publisher: formData.get("publisher"), sourceType: formData.get("sourceType"), publicationDate: formData.get("publicationDate") || undefined, notes: formData.get("notes") || undefined });
  const { supabase } = await requireEditor("/admin/evidence");
  const { error } = await supabase.rpc("attach_component_evidence", { p_component_id: input.componentId, p_url: input.url, p_title: input.title, p_publisher: input.publisher, p_source_type: input.sourceType, p_publication_date: input.publicationDate, p_notes: input.notes });
  if (error) throw new Error(`Evidence attachment failed: ${error.message}`);
  revalidatePath("/admin"); revalidatePath("/admin/evidence");
}

export async function saveCompatibility(formData: FormData) {
  const input = compatibilityInputSchema.parse({ sourcePortId: formData.get("sourcePortId"), targetPortId: formData.get("targetPortId"), status: formData.get("status"), level: formData.get("level"), confidence: formData.get("confidence"), notes: formData.get("notes"), limitations: formData.get("limitations") || undefined, configurationNotes: formData.get("configurationNotes") || undefined, evidenceUrl: formData.get("evidenceUrl") || undefined });
  const { supabase } = await requireEditor("/admin/compatibility");
  const { error } = await supabase.rpc("save_compatibility_with_evidence", { p_source_port_id: input.sourcePortId, p_target_port_id: input.targetPortId, p_status: input.status, p_level: input.level, p_confidence: input.confidence, p_notes: input.notes, p_limitations: input.limitations ?? "", p_configuration_notes: input.configurationNotes ?? "", p_evidence_url: input.evidenceUrl });
  if (error) throw new Error(`Compatibility save failed: ${error.message}`);
  revalidatePath("/admin/compatibility"); revalidatePath("/admin");
}

export async function attachCompatibilityEvidence(formData: FormData) {
  const input = edgeSourceSchema.parse({ edgeId: formData.get("edgeId"), sourceId: formData.get("sourceId") });
  const { supabase } = await requireEditor("/admin/compatibility");
  const { error } = await supabase.rpc("attach_compatibility_source", { p_edge_id: input.edgeId, p_source_id: input.sourceId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/compatibility");
}

export async function detachCompatibilityEvidence(formData: FormData) {
  const input = edgeSourceSchema.parse({ edgeId: formData.get("edgeId"), sourceId: formData.get("sourceId") });
  const { supabase } = await requireEditor("/admin/compatibility");
  const { error } = await supabase.rpc("detach_compatibility_source", { p_edge_id: input.edgeId, p_source_id: input.sourceId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/compatibility");
}

export async function createAndAttachCompatibilityEvidence(formData: FormData) {
  const edgeId = z.string().uuid().parse(formData.get("edgeId"));
  const input = evidenceInputSchema.omit({ componentId: true }).parse({ url: formData.get("url"), title: formData.get("title"), publisher: formData.get("publisher"), sourceType: formData.get("sourceType"), publicationDate: formData.get("publicationDate") || undefined, notes: formData.get("notes") || undefined });
  const { supabase } = await requireEditor("/admin/compatibility");
  const existing = await supabase.from("sources").select("id").eq("url", input.url).maybeSingle();
  const sourceId = existing.data?.id ?? (await supabase.from("sources").insert({ title: input.title, url: input.url, source_type: input.sourceType, publisher: input.publisher, publication_date: input.publicationDate, retrieved_at: new Date().toISOString(), notes: input.notes }).select("id").single()).data?.id;
  if (!sourceId) throw new Error("Unable to save evidence source.");
  const { error } = await supabase.rpc("attach_compatibility_source", { p_edge_id: edgeId, p_source_id: sourceId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/compatibility");
}

export async function bulkReview(formData: FormData) {
  const input = bulkInputSchema.parse({ proposalIds: formData.getAll("proposalId"), decision: formData.get("decision"), notes: formData.get("notes") || undefined });
  const { supabase } = await requireEditor("/admin/proposals");
  const { error } = await supabase.rpc("bulk_review_update_proposals", { p_proposal_ids: input.proposalIds, p_decision: input.decision, p_review_notes: input.notes });
  if (error) throw new Error(`Bulk review failed: ${error.message}`);
  revalidatePath("/admin"); revalidatePath("/admin/proposals");
}

export async function rerunUpdater(formData: FormData) {
  const requested = z.enum(["all","github","huggingface","openrouter","ollama"]).parse(formData.get("adapter"));
  await requireEditor("/admin");
  const client = createAdminClient(); const adapters: AdapterId[] = requested === "all" ? ["github","huggingface","openrouter","ollama"] : [requested];
  await Promise.all(adapters.map((adapter) => runUpdater(client, adapter)));
  revalidatePath("/admin"); revalidatePath("/admin/proposals");
}
