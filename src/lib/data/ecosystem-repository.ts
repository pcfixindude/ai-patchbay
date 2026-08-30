import "server-only";

import { bootstrapEcosystem } from "@/data/ecosystem";
import type { Database } from "@/lib/database.types";
import type { EcosystemComponent, EcosystemData, Port, Source, CompatibilityEdge, EcosystemExternalRef } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { mapCompatibilityEdge, mapComponent, mapPort, mapSource } from "./mappers";

type PublicTables = Database["public"]["Tables"];
type ModelMetadataRow = PublicTables["model_metadata"]["Row"];

export class EcosystemDataError extends Error {
  constructor(message: string, readonly causeDetail?: string) {
    super(message);
    this.name = "EcosystemDataError";
  }
}

export function getConfiguredDataSource(): "supabase" | "bootstrap" {
  const configured = process.env.AI_PATCHBAY_DATA_SOURCE ?? "supabase";
  if (configured !== "supabase" && configured !== "bootstrap") {
    throw new EcosystemDataError(`Unsupported AI_PATCHBAY_DATA_SOURCE value: ${configured}`);
  }
  if (configured === "bootstrap" && process.env.NODE_ENV === "production") {
    throw new EcosystemDataError("Bootstrap data is disabled in production. Configure Supabase instead.");
  }
  return configured;
}

function groupSourceIds<T extends { source_id: string }>(rows: T[], key: (row: T) => string) {
  const grouped = new Map<string, string[]>();
  for (const row of rows) grouped.set(key(row), [...(grouped.get(key(row)) ?? []), row.source_id]);
  return grouped;
}

function ensure<T>(result: { data: T | null; error: { message: string } | null }, label: string): T {
  if (result.error) throw new EcosystemDataError(`Unable to load ${label}.`, result.error.message);
  if (!result.data) throw new EcosystemDataError(`No ${label} data was returned.`);
  return result.data;
}

export async function getEcosystemData(): Promise<EcosystemData> {
  if (getConfiguredDataSource() === "bootstrap") return bootstrapEcosystem;

  const supabase = await createClient();
  const [componentResult, metadataResult, portResult, edgeResult, sourceResult, componentSourceResult, metadataSourceResult, edgeSourceResult, externalRefResult] = await Promise.all([
    supabase.from("components").select("*").in("status", ["published", "deprecated"]).eq("visibility", "public").order("name"),
    supabase.from("model_metadata").select("*"),
    supabase.from("ports").select("*").order("name"),
    supabase.from("compatibility_edges").select("*").order("created_at"),
    supabase.from("sources").select("*").order("publisher"),
    supabase.from("component_sources").select("component_id, source_id"),
    supabase.from("model_metadata_sources").select("component_id, source_id"),
    supabase.from("compatibility_edge_sources").select("compatibility_edge_id, source_id"),
    supabase.from("component_external_refs").select("component_id,source_system,external_id,external_url,canonical"),
  ]);

  const componentRows = ensure(componentResult, "published components");
  const metadataRows = ensure(metadataResult, "model metadata");
  const portRows = ensure(portResult, "ports");
  const edgeRows = ensure(edgeResult, "compatibility records");
  const sourceRows = ensure(sourceResult, "sources");
  const componentSourceRows = ensure(componentSourceResult, "component evidence links");
  const metadataSourceRows = ensure(metadataSourceResult, "model evidence links");
  const edgeSourceRows = ensure(edgeSourceResult, "compatibility evidence links");
  const externalRefRows = ensure(externalRefResult, "external references");

  const metadataByComponent = new Map<string, ModelMetadataRow>(metadataRows.map((row) => [row.component_id, row]));
  const componentSources = groupSourceIds(componentSourceRows, (row) => row.component_id);
  for (const [componentId, ids] of groupSourceIds(metadataSourceRows, (row) => row.component_id)) {
    componentSources.set(componentId, [...new Set([...(componentSources.get(componentId) ?? []), ...ids])]);
  }
  const edgeSources = groupSourceIds(edgeSourceRows, (row) => row.compatibility_edge_id);
  const externalRefs = new Map<string, EcosystemExternalRef[]>();
  for (const row of externalRefRows) {
    const ref: EcosystemExternalRef = { sourceSystem: row.source_system as EcosystemExternalRef["sourceSystem"], externalId: row.external_id, externalUrl: row.external_url, canonical: row.canonical };
    externalRefs.set(row.component_id, [...(externalRefs.get(row.component_id) ?? []), ref]);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return {
    components: componentRows.map((row) => mapComponent(row, metadataByComponent.get(row.id), componentSources.get(row.id), externalRefs.get(row.id))),
    ports: portRows.map(mapPort),
    compatibilityEdges: edgeRows.map((row) => mapCompatibilityEdge(row, edgeSources.get(row.id))),
    sources: sourceRows.map(mapSource),
    dataSource: { mode: "supabase", label: url.includes("127.0.0.1") || url.includes("localhost") ? "Local Supabase" : "Supabase" },
  };
}

export async function getPublishedComponents(): Promise<EcosystemComponent[]> {
  return (await getEcosystemData()).components;
}

export async function getComponentBySlug(slug: string): Promise<{ component?: EcosystemComponent; data: EcosystemData }> {
  const data = await getEcosystemData();
  return { component: data.components.find((component) => component.slug === slug), data };
}

export async function searchComponents(query: string): Promise<EcosystemComponent[]> {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const components = await getPublishedComponents();
  if (!terms.length) return components;
  return components.filter((component) => {
    const text = [component.name, component.shortName, component.description, component.componentType, ...component.tags, ...component.operatingSystems].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export async function getPortsForComponents(componentIds: string[]): Promise<Port[]> {
  const data = await getEcosystemData();
  const ids = new Set(componentIds);
  return data.ports.filter((port) => ids.has(port.componentId));
}

export async function getCompatibilityEdges(): Promise<CompatibilityEdge[]> {
  return (await getEcosystemData()).compatibilityEdges;
}

export async function getCompatibilityEvidence(edgeIds: string[]): Promise<Source[]> {
  const data = await getEcosystemData();
  const sourceIds = new Set(data.compatibilityEdges.filter((edge) => edgeIds.includes(edge.id)).flatMap((edge) => edge.sourceIds));
  return data.sources.filter((source) => sourceIds.has(source.id));
}

export const getExploreGraph = getEcosystemData;
export const getBuildCatalog = getEcosystemData;
