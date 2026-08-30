import { z } from "zod";
import type { Database, Json } from "@/lib/database.types";
import { componentTypes, type CompatibilityEdge, type EcosystemComponent, type EcosystemExternalRef, type ModelMetadata, type Port, type Source } from "@/lib/domain/types";

type Tables = Database["public"]["Tables"];
export type ComponentRow = Tables["components"]["Row"];
export type ModelMetadataRow = Tables["model_metadata"]["Row"];
export type PortRow = Tables["ports"]["Row"];
export type CompatibilityEdgeRow = Tables["compatibility_edges"]["Row"];
export type SourceRow = Tables["sources"]["Row"];

const stringArraySchema = z.array(z.string());
const componentTypeSchema = z.enum(componentTypes);
const directionSchema = z.enum(["input", "output", "bidirectional"]);
const cardinalitySchema = z.enum(["one", "many"]);
const compatibilityStatusSchema = z.enum([
  "verified_official", "verified_first_party", "verified_community", "tested_internal",
  "inferred", "unverified", "incompatible", "deprecated",
]);
const compatibilityLevelSchema = z.enum(["native", "compatible", "partial", "none"]);
const sourceTypeSchema = z.enum(["official_docs", "official_repo", "model_card", "announcement", "community", "internal_test"]);

function stringArray(value: Json): string[] {
  const result = stringArraySchema.safeParse(value);
  return result.success ? result.data : [];
}

function defined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

export function mapModelMetadata(row: ModelMetadataRow): ModelMetadata {
  return {
    parameterCount: defined(row.parameter_count),
    activeParameterCount: defined(row.active_parameter_count),
    architecture: defined(row.architecture),
    contextWindow: defined(row.context_window),
    maximumOutputTokens: defined(row.maximum_output_tokens),
    modalities: stringArray(row.modalities),
    visionSupport: defined(row.vision_support),
    audioSupport: defined(row.audio_support),
    toolCalling: defined(row.tool_calling),
    reasoning: defined(row.reasoning),
    codingSpecialization: defined(row.coding_specialization),
    quantization: defined(row.quantization),
    weightFormat: defined(row.weight_format),
    approximateFileSizeBytes: defined(row.approximate_file_size_bytes),
    minimumRamBytes: defined(row.minimum_ram_bytes),
    recommendedRamBytes: defined(row.recommended_ram_bytes),
    acceleratorNotes: defined(row.accelerator_notes),
    appleSiliconNotes: defined(row.apple_silicon_notes),
    license: defined(row.license),
    releaseDate: defined(row.release_date),
    deprecatedDate: defined(row.deprecated_date),
    assumptions: defined(row.assumptions),
  };
}

export function mapComponent(row: ComponentRow, modelMetadata?: ModelMetadataRow, sourceIds: string[] = [], externalRefs: EcosystemExternalRef[] = []): EcosystemComponent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    componentType: componentTypeSchema.parse(row.component_type),
    subtype: defined(row.subtype),
    parentComponentId: defined(row.parent_component_id),
    organizationId: defined(row.organization_id),
    description: row.description,
    status: z.enum(["published", "draft", "deprecated"]).parse(row.status),
    officialWebsiteUrl: defined(row.official_website_url),
    docsUrl: defined(row.docs_url),
    githubUrl: defined(row.github_url),
    huggingfaceUrl: defined(row.huggingface_url),
    pricingUrl: defined(row.pricing_url),
    openSource: defined(row.open_source),
    openWeights: defined(row.open_weights),
    localCapable: defined(row.local_capable),
    cloudCapable: defined(row.cloud_capable),
    cliAvailable: defined(row.cli_available),
    guiAvailable: defined(row.gui_available),
    visionCapable: defined(row.vision_capable),
    codingCapable: defined(row.coding_capable),
    toolCallingCapable: defined(row.tool_calling_capable),
    operatingSystems: stringArray(row.operating_systems),
    tags: stringArray(row.tags),
    lastVerifiedAt: defined(row.last_verified_at),
    sourceIds,
    externalRefs,
    modelMetadata: modelMetadata ? mapModelMetadata(modelMetadata) : undefined,
  };
}

export function mapPort(row: PortRow): Port {
  return {
    id: row.id,
    componentId: row.component_id,
    name: row.name,
    slug: row.slug,
    direction: directionSchema.parse(row.direction),
    protocolType: row.protocol_type,
    transportType: row.transport_type,
    dataType: row.data_type,
    cardinality: cardinalitySchema.parse(row.cardinality),
    required: row.required,
    description: row.description,
  };
}

export function mapCompatibilityEdge(row: CompatibilityEdgeRow, sourceIds: string[] = []): CompatibilityEdge {
  return {
    id: row.id,
    sourcePortId: row.source_port_id,
    targetPortId: row.target_port_id,
    status: compatibilityStatusSchema.parse(row.status),
    compatibilityLevel: compatibilityLevelSchema.parse(row.compatibility_level),
    confidence: row.confidence,
    notes: row.notes,
    limitations: defined(row.limitations),
    minimumVersion: defined(row.minimum_version),
    maximumVersion: defined(row.maximum_version),
    platformConstraints: stringArray(row.platform_constraints),
    configurationRequired: row.configuration_required,
    configurationNotes: defined(row.configuration_notes),
    lastVerifiedAt: defined(row.last_verified_at),
    deprecatedAt: defined(row.deprecated_at),
    sourceIds,
  };
}

export function mapSource(row: SourceRow): Source {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    sourceType: sourceTypeSchema.parse(row.source_type),
    publisher: row.publisher,
    publicationDate: defined(row.publication_date),
    retrievedAt: row.retrieved_at,
    notes: defined(row.notes),
  };
}
