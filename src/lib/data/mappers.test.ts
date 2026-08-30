import { describe, expect, it } from "vitest";
import { mapCompatibilityEdge, mapComponent, mapModelMetadata, mapPort, mapSource, type CompatibilityEdgeRow, type ComponentRow, type ModelMetadataRow, type PortRow, type SourceRow } from "./mappers";

describe("Supabase ecosystem mappers", () => {
  it("maps database component and model fields into the domain without losing evidence", () => {
    const row = {
      id: "component-1", slug: "example-model", name: "Example Model", short_name: "Example",
      component_type: "model_variant", description: "A mapped model.", status: "published",
      operating_systems: ["Linux"], tags: ["coding", "local"], local_capable: true,
      last_verified_at: "2026-08-29T00:00:00+00:00",
    } as unknown as ComponentRow;
    const metadata = {
      component_id: "component-1", architecture: "transformer", context_window: 32768,
      modalities: ["text"], coding_specialization: true, weight_format: "GGUF",
      assumptions: "Size depends on quantization.",
    } as unknown as ModelMetadataRow;

    const component = mapComponent(row, metadata, ["source-1"]);

    expect(component).toMatchObject({
      id: "component-1", shortName: "Example", componentType: "model_variant",
      operatingSystems: ["Linux"], tags: ["coding", "local"], sourceIds: ["source-1"],
      modelMetadata: { architecture: "transformer", contextWindow: 32768, modalities: ["text"], weightFormat: "GGUF" },
    });
  });

  it("maps typed ports, compatibility trust, and source provenance", () => {
    const port = mapPort({
      id: "port-1", component_id: "component-1", name: "Model API", slug: "model-api",
      direction: "output", protocol_type: "openai_compatible_api", transport_type: "https",
      data_type: "model_api", cardinality: "many", required: false, description: "API output",
    } as unknown as PortRow);
    const edge = mapCompatibilityEdge({
      id: "edge-1", source_port_id: "port-1", target_port_id: "port-2",
      status: "verified_official", compatibility_level: "compatible", confidence: 0.94,
      notes: "Supported with configuration.", platform_constraints: ["Linux"], configuration_required: true,
    } as unknown as CompatibilityEdgeRow, ["source-1"]);
    const source = mapSource({
      id: "source-1", title: "Official docs", url: "https://example.com/docs",
      source_type: "official_docs", publisher: "Example", retrieved_at: "2026-08-29T00:00:00+00:00",
    } as unknown as SourceRow);

    expect(port).toMatchObject({ componentId: "component-1", direction: "output", protocolType: "openai_compatible_api" });
    expect(edge).toMatchObject({ sourcePortId: "port-1", targetPortId: "port-2", status: "verified_official", sourceIds: ["source-1"] });
    expect(source).toMatchObject({ sourceType: "official_docs", publisher: "Example" });
  });

  it("treats malformed optional JSON arrays as empty instead of leaking invalid shapes", () => {
    const metadata = mapModelMetadata({ modalities: { unexpected: true } } as unknown as ModelMetadataRow);
    expect(metadata.modalities).toEqual([]);
  });
});
