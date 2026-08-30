import { describe, expect, it } from "vitest";
import { auditCatalog, formatCatalogAudit } from "./audit";

describe("catalog audit", () => {
  it("reports coverage and distinguishes verified compatibility", () => {
    const report = auditCatalog({
      components: [
        { id: "one", slug: "example", component_type: "model_family", parent_component_id: null, official_website_url: "https://example.com", docs_url: null, logo_path: "/brands/example.svg" },
        { id: "two", slug: "github", component_type: "runtime", parent_component_id: "one", official_website_url: null, docs_url: null, logo_path: null, tags: ["CUDA", "CPU"] },
      ],
      edges: [{ status: "verified_official", source_port_id: "a", target_port_id: "b" }, { status: "inferred" }],
      externalRefs: [{ source_system: "github" }, { source_system: "github" }, { source_system: "huggingface" }],
      sourceCount: 3,
      componentEvidenceCount: 1, verifiedEdgeEvidenceCount: 1, requiredRuntimeCapabilities: { github: ["cuda", "cpu"] },
    });
    expect(report).toMatchObject({ componentCount: 2, verifiedEdgeCount: 1, lowerTrustEdgeCount: 1, componentsMissingEvidence: 1, componentsMissingOfficialLink: 1, componentsMissingLogo: 0, componentsWithLocalBrandAsset: 2, hierarchyChildren: 1, connectedEdges: 1, verifiedEdgesMissingEvidence: 0, requiredRuntimeCapabilityGaps: [], externalRefsBySystem: { github: 2, huggingface: 1 } });
    expect(formatCatalogAudit(report)).toContain("components: 2");
  });

  it("reports missing required runtime capability tags", () => {
    const report = auditCatalog({ components: [{ slug: "runtime", component_type: "runtime", parent_component_id: null, official_website_url: null, docs_url: null, logo_path: null, tags: ["CUDA"] }], edges: [], externalRefs: [], sourceCount: 0, componentEvidenceCount: 0, requiredRuntimeCapabilities: { runtime: ["cuda", "cpu"] } });
    expect(report.requiredRuntimeCapabilityGaps).toEqual(["runtime:cpu"]);
  });
});
