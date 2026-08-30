import { z } from "zod";
import { getBrandAsset } from "@/data/brand-assets";

const componentSchema = z.object({ id: z.string().optional(), slug: z.string(), component_type: z.string(), parent_component_id: z.string().nullable().optional(), official_website_url: z.string().nullable(), docs_url: z.string().nullable(), logo_path: z.string().nullable(), tags: z.array(z.string()).optional().default([]) });
const edgeSchema = z.object({ id: z.string().optional(), status: z.string(), source_port_id: z.string().optional(), target_port_id: z.string().optional() });
const externalRefSchema = z.object({ source_system: z.string() });

export type CatalogAudit = {
  componentCount: number;
  componentsByType: Record<string, number>;
  edgeCount: number;
  verifiedEdgeCount: number;
  lowerTrustEdgeCount: number;
  externalRefsBySystem: Record<string, number>;
  sourceCount: number;
  componentsMissingEvidence: number;
  componentsMissingOfficialLink: number;
  componentsMissingLogo: number;
  componentsWithLocalBrandAsset: number;
  hierarchyChildren: number;
  connectedEdges: number;
  verifiedEdgesMissingEvidence: number;
  requiredRuntimeCapabilityGaps: string[];
};

function countBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const name = key(item);
    counts[name] = (counts[name] ?? 0) + 1;
    return counts;
  }, {});
}

export function auditCatalog(input: { components: unknown[]; edges: unknown[]; externalRefs: unknown[]; sourceCount: number; componentEvidenceCount: number; verifiedEdgeEvidenceCount?: number; requiredRuntimeCapabilities?: Record<string, string[]> }): CatalogAudit {
  const components = input.components.map((row) => componentSchema.parse(row));
  const edges = input.edges.map((row) => edgeSchema.parse(row));
  const externalRefs = input.externalRefs.map((row) => externalRefSchema.parse(row));
  const verifiedEdgeCount = edges.filter((edge) => edge.status === "verified_official" || edge.status === "verified_first_party" || edge.status === "verified_community" || edge.status === "tested_internal").length;
  const requiredRuntimeCapabilityGaps = Object.entries(input.requiredRuntimeCapabilities ?? {}).flatMap(([slug, requiredTags]) => {
    const component = components.find((candidate) => candidate.slug === slug);
    const tags = new Set(component?.tags.map((tag) => tag.toLowerCase()));
    return requiredTags.filter((tag) => !tags.has(tag.toLowerCase())).map((tag) => `${slug}:${tag}`);
  });

  return {
    componentCount: components.length,
    componentsByType: countBy(components, (component) => component.component_type),
    edgeCount: edges.length,
    verifiedEdgeCount,
    lowerTrustEdgeCount: edges.length - verifiedEdgeCount,
    externalRefsBySystem: countBy(externalRefs, (ref) => ref.source_system),
    sourceCount: input.sourceCount,
    // One component-source link is the conservative audit threshold; edge-only evidence is reported separately.
    componentsMissingEvidence: Math.max(0, components.length - input.componentEvidenceCount),
    componentsMissingOfficialLink: components.filter((component) => !component.official_website_url && !component.docs_url).length,
    componentsMissingLogo: components.filter((component) => !component.logo_path && !getBrandAsset(component.slug).assetPath).length,
    componentsWithLocalBrandAsset: components.filter((component) => Boolean(component.logo_path || getBrandAsset(component.slug).assetPath)).length,
    hierarchyChildren: components.filter((component) => Boolean(component.parent_component_id)).length,
    connectedEdges: edges.filter((edge) => Boolean(edge.source_port_id && edge.target_port_id)).length,
    verifiedEdgesMissingEvidence: Math.max(0, verifiedEdgeCount - (input.verifiedEdgeEvidenceCount ?? 0)),
    requiredRuntimeCapabilityGaps,
  };
}

export function formatCatalogAudit(audit: CatalogAudit) {
  return [
    "AI Patchbay catalog audit",
    `components: ${audit.componentCount}`,
    `by type: ${Object.entries(audit.componentsByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, count]) => `${type}=${count}`).join(", ")}`,
    `compatibility edges: ${audit.edgeCount} (${audit.verifiedEdgeCount} verified, ${audit.lowerTrustEdgeCount} lower-trust)`,
    `sources: ${audit.sourceCount}`,
    `external refs: ${Object.entries(audit.externalRefsBySystem).sort(([a], [b]) => a.localeCompare(b)).map(([system, count]) => `${system}=${count}`).join(", ") || "none"}`,
    `components missing component evidence: ${audit.componentsMissingEvidence}`,
    `components missing official link: ${audit.componentsMissingOfficialLink}`,
    `components missing local logo: ${audit.componentsMissingLogo}`,
    `components with local brand asset: ${audit.componentsWithLocalBrandAsset}`,
    `hierarchy child records: ${audit.hierarchyChildren}`,
    `fully connected compatibility edges: ${audit.connectedEdges}`,
    `verified edges missing evidence: ${audit.verifiedEdgesMissingEvidence}`,
    `required runtime capability gaps: ${audit.requiredRuntimeCapabilityGaps.join(", ") || "none"}`,
  ].join("\n");
}
