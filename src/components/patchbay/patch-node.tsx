"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronRight, Info, Terminal } from "lucide-react";
import { memo } from "react";
import type { EcosystemComponent, Port } from "@/lib/domain/types";

export interface PatchNodeData extends Record<string, unknown> {
  component: EcosystemComponent;
  ports: Port[];
  validTargetIds: string[];
  activeSourcePortId?: string;
  onInspect: (component: EcosystemComponent) => void;
  childCount?: number;
  expanded?: boolean;
  onToggleHierarchy?: (componentId: string) => void;
}

export type PatchNodeType = Node<PatchNodeData, "patchNode">;

function portShape(port: Port) {
  if (port.protocolType.includes("mcp")) return "ring";
  if (port.dataType.includes("model")) return "square";
  if (port.dataType.includes("tool")) return "terminal";
  return "circle";
}

function PatchNodeComponent({ data, selected }: NodeProps<PatchNodeType>) {
  const { component, ports, activeSourcePortId, validTargetIds, onInspect, childCount = 0, expanded, onToggleHierarchy } = data;
  const inputs = ports.filter((port) => port.direction === "input" || port.direction === "bidirectional");
  const outputs = ports.filter((port) => port.direction === "output" || port.direction === "bidirectional");
  const maxRows = Math.max(inputs.length, outputs.length, 1);
  return (
    <article className={`patch-node ${selected ? "selected" : ""}`} aria-label={`${component.name}, ${component.componentType.replaceAll("_", " ")}`}>
      <div className="node-rack-screws"><i /><i /></div>
      <header className="node-header">
        <span className="monogram">{component.shortName.slice(0, 2).toUpperCase()}</span>
        <span className="node-title"><strong>{component.shortName}</strong><small>{component.componentType.replaceAll("_", " ")}</small></span>
        {childCount > 0 && <button className="node-info nodrag hierarchy-toggle" onClick={() => onToggleHierarchy?.(component.id)} aria-label={`${expanded ? "Collapse" : "Expand"} ${component.name} (${childCount} children)`}>{expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}<small>{childCount}</small></button>}
        <button className="node-info nodrag" onClick={() => onInspect(component)} aria-label={`Inspect ${component.name}`}><Info size={15} /></button>
      </header>
      <p className="node-description">{component.description}</p>
      <div className="node-badges">
        {component.localCapable && <span>LOCAL</span>}
        {component.cloudCapable && <span>CLOUD</span>}
        {component.openSource && <span>OPEN</span>}
      </div>
      <div className="port-bank" style={{ minHeight: maxRows * 38 }}>
        <div className="port-column input-column">
          {inputs.map((port) => {
            const active = Boolean(activeSourcePortId);
            const valid = validTargetIds.includes(port.id);
            return (
              <div key={port.id} className={`node-port input ${active ? (valid ? "valid-target" : "invalid-target") : ""}`} title={port.description}>
                <Handle type="target" position={Position.Left} id={port.id} className={`typed-handle ${portShape(port)}`} aria-label={`${component.name} ${port.name} input`} />
                <span className="port-label"><strong>{port.name}</strong><small>IN · {port.protocolType.replaceAll("_", " ")}</small></span>
              </div>
            );
          })}
        </div>
        <div className="port-column output-column">
          {outputs.map((port) => (
            <div key={port.id} className="node-port output" title={port.description}>
              <span className="port-label"><strong>{port.name}</strong><small>{port.protocolType.replaceAll("_", " ")} · OUT</small></span>
              <Handle type="source" position={Position.Right} id={port.id} className={`typed-handle ${portShape(port)}`} aria-label={`${component.name} ${port.name} output`} />
            </div>
          ))}
        </div>
      </div>
      {!ports.length && <div className="no-ports"><Terminal size={14} /> descriptive record</div>}
      <div className="node-rack-screws bottom"><i /><i /></div>
    </article>
  );
}

export const PatchNode = memo(PatchNodeComponent);
