import Link from "next/link";
import { ExternalLink, ShieldCheck, X } from "lucide-react";
import type { EcosystemComponent, EcosystemData } from "@/lib/domain/types";
import { freshnessLabel } from "@/lib/updater/freshness";
import { BrandMark } from "@/components/brand-mark";

export function ComponentDetail({ component, data, onClose }: { component: EcosystemComponent; data: EcosystemData; onClose?: () => void }) {
  const componentPorts = data.ports.filter((port) => port.componentId === component.id);
  const portIds = new Set(componentPorts.map((port) => port.id));
  const relatedEdges = data.compatibilityEdges.filter((edge) => portIds.has(edge.sourcePortId) || portIds.has(edge.targetPortId));
  const sourceIds = new Set([...(component.sourceIds ?? []), ...relatedEdges.flatMap((edge) => edge.sourceIds)]);
  const parent = component.parentComponentId ? data.components.find((item) => item.id === component.parentComponentId) : undefined;
  const organization = component.organizationId ? data.components.find((item) => item.id === component.organizationId) : undefined;
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const portById = new Map(data.ports.map((port) => [port.id, port]));
  const componentById = new Map(data.components.map((item) => [item.id, item]));
  const links = [
    ["Official site", component.officialWebsiteUrl],
    ["Documentation", component.docsUrl],
    ["GitHub", component.githubUrl],
    ["Hugging Face", component.huggingfaceUrl],
    ["Pricing", component.pricingUrl],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <aside className="detail-panel" aria-label={`${component.name} details`}>
      <div className="detail-topline">
        <span className="eyebrow">{component.componentType.replaceAll("_", " ")}</span>
        {onClose && <button className="icon-button" onClick={onClose} aria-label="Close details"><X size={17} /></button>}
      </div>
      <div className="detail-identity">
        <BrandMark component={component} size="large" />
        <div>
          <h2>{component.name}</h2>
          {(organization ?? parent) && <p className="muted">{organization ? `by ${organization.name}` : `part of ${parent?.name}`}</p>}
        </div>
      </div>

      {(parent || component.operatingSystems.length > 0 || component.tags.length > 0) && <section className="detail-section">
        <div className="section-heading"><span>Catalog record</span></div>
        <div className="resource-list">
          {parent && <span>Family <strong>{parent.name}</strong></span>}
          {component.operatingSystems.length > 0 && <span>Platforms <strong>{component.operatingSystems.join(", ")}</strong></span>}
          {component.tags.length > 0 && <span>Tags <strong>{component.tags.join(", ")}</strong></span>}
        </div>
      </section>}
      <p className="detail-description">{component.description}</p>
      <p className="muted">{component.lastVerifiedAt ? `Record verified ${new Date(component.lastVerifiedAt).toLocaleDateString()} · ${freshnessLabel(component.lastVerifiedAt)}` : "Unverified"}</p>
      <div className="badge-row">
        {component.localCapable && <span className="badge">Local</span>}
        {component.cloudCapable && <span className="badge">Cloud</span>}
        {component.openSource && <span className="badge">Open source</span>}
        {component.openWeights && <span className="badge">Open weights</span>}
        {component.codingCapable && <span className="badge">Coding</span>}
        {component.toolCallingCapable && <span className="badge">Tool calling</span>}
      </div>

      {component.modelMetadata && <section className="detail-section">
        <div className="section-heading"><span>Model metadata</span></div>
        <div className="resource-list">
          {component.modelMetadata.architecture && <span>Architecture <strong>{component.modelMetadata.architecture}</strong></span>}
          {component.modelMetadata.parameterCount && <span>Parameters <strong>{formatCount(component.modelMetadata.parameterCount)}</strong></span>}
          {component.modelMetadata.activeParameterCount && <span>Active parameters <strong>{formatCount(component.modelMetadata.activeParameterCount)}</strong></span>}
          {component.modelMetadata.weightFormat && <span>Weight format <strong>{component.modelMetadata.weightFormat}</strong></span>}
          {component.modelMetadata.contextWindow && <span>Context window <strong>{component.modelMetadata.contextWindow.toLocaleString()} tokens</strong></span>}
          {component.modelMetadata.modalities.length > 0 && <span>Modalities <strong>{component.modelMetadata.modalities.join(", ")}</strong></span>}
          {component.modelMetadata.reasoning !== undefined && <span>Reasoning <strong>{component.modelMetadata.reasoning ? "Yes" : "No"}</strong></span>}
          {component.modelMetadata.toolCalling !== undefined && <span>Tool calling <strong>{component.modelMetadata.toolCalling ? "Yes" : "No"}</strong></span>}
          {component.modelMetadata.license && <span>License <strong>{component.modelMetadata.license}</strong></span>}
        </div>
        {component.modelMetadata.assumptions && <div className="config-note"><strong>Recorded assumptions</strong><p>{component.modelMetadata.assumptions}</p></div>}
      </section>}

      {!!component.externalRefs?.length && <section className="detail-section">
        <div className="section-heading"><span>External mappings</span><span className="count">{component.externalRefs.length}</span></div>
        <div className="resource-list">
          {component.externalRefs.map((ref) => <a key={`${ref.sourceSystem}-${ref.externalId}`} href={ref.externalUrl} target="_blank" rel="noreferrer"><span>{ref.sourceSystem} <strong>{ref.externalId}</strong></span><ExternalLink size={13} /></a>)}
        </div>
      </section>}

      <section className="detail-section">
        <div className="section-heading"><span>Ports</span><span className="count">{componentPorts.length}</span></div>
        <div className="port-list compact">
          {componentPorts.map((port) => (
            <div key={port.id} className="port-record">
              <span className={`port-glyph ${port.protocolType.includes("mcp") ? "ring" : port.dataType.includes("model") ? "square" : "circle"}`} />
              <span><strong>{port.name}</strong><small>{port.direction} · {port.protocolType.replaceAll("_", " ")}</small></span>
            </div>
          ))}
          {!componentPorts.length && <p className="empty-copy">This record is descriptive and has no patchable ports.</p>}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading"><span>Compatibility</span><span className="count">{relatedEdges.length}</span></div>
        <div className="resource-list">
          {relatedEdges.map((edge) => {
            const sourcePort = portById.get(edge.sourcePortId);
            const targetPort = portById.get(edge.targetPortId);
            const upstream = sourcePort && componentById.get(sourcePort.componentId);
            const downstream = targetPort && componentById.get(targetPort.componentId);
            return <span key={edge.id}><span>{upstream?.shortName ?? "Unknown"} <strong>{sourcePort?.name ?? "output"}</strong> → <strong>{targetPort?.name ?? "input"}</strong> {downstream?.shortName ?? "Unknown"}</span><strong>{edge.status.replaceAll("_", " ")}{edge.lastVerifiedAt ? ` · ${new Date(edge.lastVerifiedAt).toLocaleDateString()}` : ""}</strong></span>;
          })}
          {!relatedEdges.length && <p className="empty-copy">No upstream or downstream compatibility records are published yet.</p>}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading"><span>Official resources</span></div>
        <div className="resource-list">
          {links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}<ExternalLink size={13} /></a>)}
          {!links.length && <p className="empty-copy">No official resource is recorded yet.</p>}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading"><span>Evidence</span><ShieldCheck size={15} /></div>
        <div className="evidence-list">
          {[...sourceIds].map((sourceId) => {
            const source = sourceById.get(sourceId);
            return source ? <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{source.title}</span><small>{source.publisher} · retrieved {source.retrievedAt}</small></a> : null;
          })}
          {!sourceIds.size && <p className="empty-copy">No compatibility evidence is attached to this record yet.</p>}
        </div>
      </section>
      {onClose && <Link className="button secondary full" href={`/component/${component.slug}`}>Open canonical page</Link>}
    </aside>
  );
}

function formatCount(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  return value.toLocaleString();
}
