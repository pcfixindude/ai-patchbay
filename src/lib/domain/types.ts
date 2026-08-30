export const componentTypes = [
  "organization",
  "creator",
  "model_family",
  "model",
  "model_variant",
  "runtime",
  "inference_provider",
  "gateway",
  "router",
  "agent",
  "coding_agent",
  "agent_framework",
  "sdk",
  "interface",
  "ide",
  "cli",
  "protocol",
  "tool",
  "data_source",
  "observability",
  "workflow_builder",
  "hosting_platform",
] as const;

export type ComponentType = (typeof componentTypes)[number];
export type PortDirection = "input" | "output" | "bidirectional";
export type CompatibilityStatus =
  | "verified_official"
  | "verified_first_party"
  | "verified_community"
  | "tested_internal"
  | "inferred"
  | "unverified"
  | "incompatible"
  | "deprecated";

export interface EcosystemComponent {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  componentType: ComponentType;
  subtype?: string;
  parentComponentId?: string;
  organizationId?: string;
  description: string;
  status: "published" | "draft" | "deprecated";
  officialWebsiteUrl?: string;
  docsUrl?: string;
  githubUrl?: string;
  huggingfaceUrl?: string;
  pricingUrl?: string;
  openSource?: boolean;
  openWeights?: boolean;
  localCapable?: boolean;
  cloudCapable?: boolean;
  cliAvailable?: boolean;
  guiAvailable?: boolean;
  visionCapable?: boolean;
  codingCapable?: boolean;
  toolCallingCapable?: boolean;
  operatingSystems: string[];
  tags: string[];
  lastVerifiedAt?: string;
  sourceIds?: string[];
  externalRefs?: EcosystemExternalRef[];
  modelMetadata?: ModelMetadata;
}

export interface EcosystemExternalRef {
  sourceSystem: "github" | "huggingface" | "openrouter" | "ollama";
  externalId: string;
  externalUrl: string;
  canonical: boolean;
}

export interface ModelMetadata {
  parameterCount?: number;
  activeParameterCount?: number;
  architecture?: string;
  contextWindow?: number;
  maximumOutputTokens?: number;
  modalities: string[];
  visionSupport?: boolean;
  audioSupport?: boolean;
  toolCalling?: boolean;
  reasoning?: boolean;
  codingSpecialization?: boolean;
  quantization?: string;
  weightFormat?: string;
  approximateFileSizeBytes?: number;
  minimumRamBytes?: number;
  recommendedRamBytes?: number;
  acceleratorNotes?: string;
  appleSiliconNotes?: string;
  license?: string;
  releaseDate?: string;
  deprecatedDate?: string;
  assumptions?: string;
}

export interface Port {
  id: string;
  componentId: string;
  name: string;
  slug: string;
  direction: PortDirection;
  protocolType: string;
  transportType: string;
  dataType: string;
  cardinality: "one" | "many";
  required: boolean;
  description: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  sourceType: "official_docs" | "official_repo" | "model_card" | "announcement" | "community" | "internal_test";
  publisher: string;
  publicationDate?: string;
  retrievedAt: string;
  notes?: string;
}

export interface CompatibilityEdge {
  id: string;
  sourcePortId: string;
  targetPortId: string;
  status: CompatibilityStatus;
  compatibilityLevel: "native" | "compatible" | "partial" | "none";
  confidence: number;
  notes: string;
  limitations?: string;
  minimumVersion?: string;
  maximumVersion?: string;
  platformConstraints: string[];
  configurationRequired: boolean;
  configurationNotes?: string;
  lastVerifiedAt?: string;
  deprecatedAt?: string;
  sourceIds: string[];
}

export interface HardwareConstraints {
  localOnly?: boolean;
  cloudOnly?: boolean;
  openSourceOnly?: boolean;
  openWeightsOnly?: boolean;
  appleSilicon?: boolean;
  codingRequired?: boolean;
  visionRequired?: boolean;
  cliRequired?: boolean;
  guiRequired?: boolean;
  toolCallingRequired?: boolean;
  cudaRequired?: boolean;
  verifiedOnly?: boolean;
  allowCommunityRoutes?: boolean;
  allowInferredUnverifiedRoutes?: boolean;
  avoidDeprecated?: boolean;
}

export interface PathResult {
  componentIds: string[];
  edgeIds: string[];
  score: number;
  warnings: string[];
  explanation?: string[];
  trustSummary?: RouteTrustSummary;
}

export interface RouteTrustSummary {
  totalEdges: number;
  verifiedOfficial: number;
  verifiedFirstParty: number;
  testedInternal: number;
  verifiedCommunity: number;
  inferred: number;
  unverified: number;
  staleEdges: number;
  deprecatedComponents: number;
  weakestTrust?: CompatibilityStatus;
}

export interface EcosystemData {
  components: EcosystemComponent[];
  ports: Port[];
  compatibilityEdges: CompatibilityEdge[];
  sources: Source[];
  dataSource: {
    mode: "supabase" | "bootstrap";
    label: string;
  };
}
