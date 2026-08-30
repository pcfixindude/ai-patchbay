import { ExternalLink, ShieldCheck, X } from "lucide-react";
import type { CompatibilityEdge, EcosystemData } from "@/lib/domain/types";

export function EdgeDetail({ edge, data, onClose }: { edge: CompatibilityEdge; data: EcosystemData; onClose: () => void }) {
  const sourcePort = data.ports.find((port) => port.id === edge.sourcePortId);
  const targetPort = data.ports.find((port) => port.id === edge.targetPortId);
  const sourceComponent = sourcePort ? data.components.find((component) => component.id === sourcePort.componentId) : undefined;
  const targetComponent = targetPort ? data.components.find((component) => component.id === targetPort.componentId) : undefined;
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  return (
    <aside className="detail-panel" aria-label="Cable details">
      <div className="detail-topline"><span className="eyebrow">Cable inspector</span><button className="icon-button" onClick={onClose} aria-label="Close cable details"><X size={17} /></button></div>
      <h2 className="cable-title">{sourceComponent?.shortName} <span>→</span> {targetComponent?.shortName}</h2>
      <div className="signal-route">
        <div><small>OUTPUT</small><strong>{sourcePort?.name}</strong><span>{sourcePort?.protocolType.replaceAll("_", " ")}</span></div>
        <div className="cable-line" />
        <div><small>INPUT</small><strong>{targetPort?.name}</strong><span>{targetPort?.protocolType.replaceAll("_", " ")}</span></div>
      </div>
      <section className="detail-section">
        <div className="section-heading"><span>Status</span><ShieldCheck size={15} /></div>
        <div className={`trust-card ${edge.status.includes("unverified") ? "warning" : "verified"}`}>
          <strong>{edge.status.replaceAll("_", " ")}</strong>
          <span>{Math.round(edge.confidence * 100)}% confidence · {edge.compatibilityLevel}</span>
        </div>
        <p className="detail-description small">{edge.notes}</p>
        {edge.configurationNotes && <div className="config-note"><strong>Configuration</strong><p>{edge.configurationNotes}</p></div>}
        {edge.limitations && <div className="config-note"><strong>Limitations</strong><p>{edge.limitations}</p></div>}
      </section>
      <section className="detail-section">
        <div className="section-heading"><span>Supporting evidence</span></div>
        <div className="evidence-list">
          {edge.sourceIds.map((id) => sourceById.get(id)).filter(Boolean).map((source) => source && (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{source.title}<ExternalLink size={12} /></span><small>{source.publisher} · retrieved {source.retrievedAt}</small></a>
          ))}
        </div>
      </section>
    </aside>
  );
}
