"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  type Connection,
  type Edge,
  type FinalConnectionState,
  type Node,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Check, LayoutGrid, RotateCcw, Save, Search, Share2, Trash2, TriangleAlert, Undo2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComponentDetail } from "@/components/component-detail";
import { EdgeDetail } from "@/components/edge-detail";
import { canConnect, findCompatibleTargets, validateBuild, type CompatibilityDecision } from "@/lib/compatibility";
import { deserializeBuild, serializeBuild } from "@/lib/build/serialization";
import type { CompatibilityEdge, EcosystemComponent, EcosystemData } from "@/lib/domain/types";
import type { SavedBuild } from "@/lib/domain/schemas";
import { PatchNode, type PatchNodeData } from "./patch-node";
import { BrandMark } from "@/components/brand-mark";
import { RoutePlanner } from "@/components/route-planner";
import { childrenByParent, defaultExploreRoots, expandedWithAncestors, visibleHierarchyComponents, visibleHierarchyEdges } from "@/lib/explore/hierarchy";

const nodeTypes = { patchNode: PatchNode };

type PatchEdgeData = { compatibilityEdgeId?: string } & Record<string, unknown>;
type PatchEdge = Edge<PatchEdgeData>;

const demoComponentSlugs = ["qwen3-coder-gguf", "ollama", "hermes-agent", "model-context-protocol", "github-tool"];

function layoutPosition(index: number) {
  return { x: 40 + (index % 4) * 350, y: 70 + Math.floor(index / 4) * 320 };
}

function toFlowNode(data: EcosystemData, component: EcosystemComponent, instanceId: string, position: { x: number; y: number }, hierarchy: Pick<PatchNodeData, "childCount" | "expanded" | "onToggleHierarchy"> = {}): Node<PatchNodeData> {
  return {
    id: instanceId,
    type: "patchNode",
    position,
    data: { component, ports: data.ports.filter((port) => port.componentId === component.id), validTargetIds: [], onInspect: () => undefined, ...hierarchy },
  };
}

function toFlowEdge(data: EcosystemData, edge: CompatibilityEdge, nodeByComponent: Map<string, string>): PatchEdge | undefined {
  const sourcePort = data.ports.find((port) => port.id === edge.sourcePortId);
  const targetPort = data.ports.find((port) => port.id === edge.targetPortId);
  const source = sourcePort && nodeByComponent.get(sourcePort.componentId);
  const target = targetPort && nodeByComponent.get(targetPort.componentId);
  if (!source || !target) return undefined;
  return {
    id: `connection-${edge.id}`,
    source,
    target,
    sourceHandle: edge.sourcePortId,
    targetHandle: edge.targetPortId,
    type: "smoothstep",
    animated: edge.status === "unverified" || edge.status === "inferred",
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    className: edge.status.includes("verified") ? "verified-cable" : "unverified-cable",
    data: { compatibilityEdgeId: edge.id },
  };
}

function createDemoState(data: EcosystemData) {
  const componentBySlug = new Map(data.components.map((component) => [component.slug, component]));
  const portById = new Map(data.ports.map((port) => [port.id, port]));
  const demoNodes = demoComponentSlugs.flatMap((slug, index) => {
    const component = componentBySlug.get(slug);
    return component ? [toFlowNode(data, component, `demo-${slug}`, { x: 30 + index * 340, y: 150 })] : [];
  });
  const nodeMap = new Map(demoNodes.map((node) => [node.data.component.id, node.id]));
  const demoComponentIds = new Set(demoNodes.map((node) => node.data.component.id));
  const demoEdges = data.compatibilityEdges.flatMap((record) => {
    const sourcePort = portById.get(record.sourcePortId);
    const targetPort = portById.get(record.targetPortId);
    if (!sourcePort || !targetPort || !demoComponentIds.has(sourcePort.componentId) || !demoComponentIds.has(targetPort.componentId)) return [];
    const flowEdge = toFlowEdge(data, record, nodeMap);
    return flowEdge ? [flowEdge] : [];
  });
  return { demoNodes, demoEdges };
}

function createHierarchyState(data: EcosystemData, expanded: ReadonlySet<string>, onToggleHierarchy: (componentId: string) => void) {
  const visibleIds = visibleHierarchyComponents(data.components, expanded);
  const childMap = childrenByParent(data.components);
  const nodes = data.components.filter((component) => visibleIds.has(component.id)).map((component, index) => toFlowNode(data, component, `explore-${component.id}`, layoutPosition(index), { childCount: childMap.get(component.id)?.length ?? 0, expanded: expanded.has(component.id), onToggleHierarchy }));
  const nodeByComponent = new Map(nodes.map((node) => [node.data.component.id, node.id]));
  const edges = visibleHierarchyEdges(data.compatibilityEdges, data.ports, visibleIds).flatMap((edge) => {
    const flow = toFlowEdge(data, edge, nodeByComponent);
    return flow ? [flow] : [];
  });
  return { nodes, edges };
}

export function PatchbayCanvas({ data, mode = "build" }: { data: EcosystemData; mode?: "build" | "explore" }) {
  return <ReactFlowProvider><PatchbayInner data={data} mode={mode} /></ReactFlowProvider>;
}

function PatchbayInner({ data, mode }: { data: EcosystemData; mode: "build" | "explore" }) {
  const componentById = useMemo(() => new Map(data.components.map((component) => [component.id, component])), [data.components]);
  const portById = useMemo(() => new Map(data.ports.map((port) => [port.id, port])), [data.ports]);
  const context = useMemo(() => ({ ports: data.ports, edges: data.compatibilityEdges, components: data.components }), [data]);
  const buildableIds = useMemo(() => new Set(data.ports.map((port) => port.componentId)), [data.ports]);
  const initial = useMemo(() => ({ demoNodes: [], demoEdges: [] }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PatchNodeData>>(initial.demoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<PatchEdge>(initial.demoEdges);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [capability, setCapability] = useState<string>("all");
  const [expandedHierarchy, setExpandedHierarchy] = useState<Set<string>>(() => new Set());
  const [selectedComponent, setSelectedComponent] = useState<EcosystemComponent>();
  const [selectedCompatibility, setSelectedCompatibility] = useState<CompatibilityEdge>();
  const [message, setMessage] = useState<{ kind: "success" | "warning"; text: string }>();
  const [activeSourcePortId, setActiveSourcePortId] = useState<string>();
  const [history, setHistory] = useState<Array<{ nodes: Node<PatchNodeData>[]; edges: PatchEdge[] }>>([]);
  const instanceRef = useRef<ReactFlowInstance<Node<PatchNodeData>, PatchEdge> | null>(null);
  const lastDecisionRef = useRef<string | undefined>(undefined);

  const inspectComponent = useCallback((component: EcosystemComponent) => {
    setSelectedCompatibility(undefined);
    setSelectedComponent(component);
  }, []);
  const toggleHierarchy = useCallback((componentId: string) => setExpandedHierarchy((current) => {
    const next = new Set(current);
    if (next.has(componentId)) next.delete(componentId); else next.add(componentId);
    return next;
  }), []);

  useEffect(() => {
    if (mode !== "explore") return;
    const hierarchy = createHierarchyState(data, expandedHierarchy, toggleHierarchy);
    setNodes(hierarchy.nodes);
    setEdges(hierarchy.edges);
  }, [data, expandedHierarchy, mode, setEdges, setNodes, toggleHierarchy]);

  const validTargetIds = useMemo(() => {
    const source = activeSourcePortId ? portById.get(activeSourcePortId) : undefined;
    return source ? findCompatibleTargets(source, context).map((port) => port.id) : [];
  }, [activeSourcePortId, context, portById]);

  const renderedNodes = useMemo(() => nodes.map((node) => ({
    ...node,
    data: { ...node.data, activeSourcePortId, validTargetIds, onInspect: inspectComponent, onToggleHierarchy: mode === "explore" ? toggleHierarchy : undefined },
  })), [nodes, activeSourcePortId, validTargetIds, inspectComponent, mode, toggleHierarchy]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return data.components.filter((component) => {
      const text = [component.name, component.shortName, component.description, component.componentType, ...component.tags, ...component.operatingSystems].join(" ").toLowerCase();
      const hasCapability = capability === "all"
        || capability === "local" && component.localCapable
        || capability === "cloud" && component.cloudCapable
        || capability === "open_weights" && component.openWeights
        || capability === "coding" && component.codingCapable
        || capability === "vision" && component.visionCapable
        || capability === "tool_calling" && component.toolCallingCapable
        || capability === "cli" && component.cliAvailable
        || capability === "gui" && component.guiAvailable
        || capability === "cuda" && component.tags.some((tag) => tag.toLowerCase().includes("cuda"))
        || capability === "apple_silicon" && (component.operatingSystems.includes("macOS") || component.tags.some((tag) => tag.toLowerCase().includes("apple silicon")));
      return (mode === "explore" || buildableIds.has(component.id)) && hasCapability && (category === "all" || component.componentType === category) && terms.every((term) => text.includes(term));
    });
  }, [buildableIds, capability, category, data.components, mode, query]);
  // The explorer starts as a tree, not a 129-record catalogue dump. Search and
  // filters intentionally continue to inspect the complete evidenced catalog.
  const catalogResults = useMemo(() => mode === "explore" && !query && category === "all" && capability === "all"
    ? defaultExploreRoots(data.components)
    : results, [capability, category, data.components, mode, query, results]);

  const status = useMemo(() => validateBuild(edges.map((edge) => ({ sourcePortId: edge.sourceHandle ?? "", targetPortId: edge.targetHandle ?? "" })), context), [context, edges]);

  const snapshot = useCallback(() => setHistory((items) => [...items.slice(-19), { nodes, edges }]), [nodes, edges]);

  const addComponent = useCallback((component: EcosystemComponent) => {
    if (mode === "explore") {
      setExpandedHierarchy((current) => expandedWithAncestors(component.id, data.components, current));
      setSelectedComponent(component);
      setTimeout(() => instanceRef.current?.fitView({ padding: 0.2, duration: 350 }), 50);
      return;
    }
    snapshot();
    const instanceId = `${component.id}-${crypto.randomUUID().slice(0, 6)}`;
    setNodes((current) => [...current, toFlowNode(data, component, instanceId, layoutPosition(current.length))]);
    setMessage({ kind: "success", text: `${component.shortName} added to the bay.` });
  }, [data, mode, setNodes, snapshot]);

  const loadDemo = useCallback(() => {
    snapshot();
    const { demoNodes, demoEdges } = createDemoState(data);
    setNodes(demoNodes);
    setEdges(demoEdges);
    setTimeout(() => instanceRef.current?.fitView({ padding: 0.2, duration: 450 }), 50);
    setMessage({ kind: "success", text: "Loaded a sourced Qwen → Ollama → Hermes Agent example." });
  }, [data, setEdges, setNodes, snapshot]);

  useEffect(() => {
    if (mode === "explore") return;
    const encoded = new URL(window.location.href).searchParams.get("state");
    if (!encoded) return;
    const timer = window.setTimeout(() => {
      try {
        restoreBuild(deserializeBuild(encoded));
        setMessage({ kind: "success", text: "Shared build restored." });
      } catch (error) {
        setMessage({ kind: "warning", text: error instanceof Error ? error.message : "Unable to restore this build." });
      }
    }, 0);
    return () => window.clearTimeout(timer);
    // Initial hydration only; the callbacks intentionally use initial empty state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function restoreBuild(build: SavedBuild) {
    const restoredNodes = build.nodes.flatMap((saved) => {
      const component = componentById.get(saved.componentId);
      return component ? [toFlowNode(data, component, saved.instanceId, saved.position)] : [];
    });
    const byInstance = new Map(restoredNodes.map((node) => [node.id, node]));
    const restoredEdges: PatchEdge[] = build.connections.flatMap((connection) => {
      if (!byInstance.has(connection.sourceNodeId) || !byInstance.has(connection.targetNodeId)) return [];
      const compatibility = data.compatibilityEdges.find((candidate) => candidate.sourcePortId === connection.sourcePortId && candidate.targetPortId === connection.targetPortId);
      return [{
        id: connection.id,
        source: connection.sourceNodeId,
        target: connection.targetNodeId,
        sourceHandle: connection.sourcePortId,
        targetHandle: connection.targetPortId,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        className: compatibility?.status.includes("verified") ? "verified-cable" : "unverified-cable",
        data: { compatibilityEdgeId: compatibility?.id },
      }];
    });
    setNodes(restoredNodes);
    setEdges(restoredEdges);
    setTimeout(() => instanceRef.current?.fitView({ padding: 0.2 }), 50);
  }

  function currentBuild(): SavedBuild {
    return {
      version: 1,
      name: "AI Patchbay build",
      nodes: nodes.map((node) => ({ instanceId: node.id, componentId: node.data.component.id, position: node.position })),
      connections: edges.flatMap((edge) => edge.sourceHandle && edge.targetHandle ? [{ id: edge.id, sourceNodeId: edge.source, sourcePortId: edge.sourceHandle, targetNodeId: edge.target, targetPortId: edge.targetHandle }] : []),
    };
  }

  function saveBuild() {
    localStorage.setItem("ai-patchbay-build", serializeBuild(currentBuild()));
    setMessage({ kind: "success", text: "Build saved on this device." });
  }

  function restoreLocal() {
    const value = localStorage.getItem("ai-patchbay-build");
    if (!value) return setMessage({ kind: "warning", text: "No saved build was found on this device." });
    try { restoreBuild(deserializeBuild(value)); setMessage({ kind: "success", text: "Saved build restored." }); }
    catch (error) { setMessage({ kind: "warning", text: error instanceof Error ? error.message : "Saved build is invalid." }); }
  }

  async function shareBuild() {
    const url = new URL(window.location.origin + "/build");
    url.searchParams.set("state", serializeBuild(currentBuild()));
    await navigator.clipboard.writeText(url.toString());
    setMessage({ kind: "success", text: "Validated share link copied to clipboard." });
  }

  function openSetupGuide() {
    window.location.assign(`/setup?state=${encodeURIComponent(serializeBuild(currentBuild()))}`);
  }

  const connectionDecision = useCallback((connection: { sourceHandle?: string | null; targetHandle?: string | null }): CompatibilityDecision => {
    const source = connection.sourceHandle ? portById.get(connection.sourceHandle) : undefined;
    const target = connection.targetHandle ? portById.get(connection.targetHandle) : undefined;
    if (!source || !target) return { allowed: false, status: "unknown", reason: "Choose a named output and input port." };
    return canConnect(source, target, context);
  }, [context, portById]);

  const isValidConnection = useCallback((connection: Connection | Edge) => {
    const decision = connectionDecision(connection);
    lastDecisionRef.current = decision.reason;
    return decision.allowed;
  }, [connectionDecision]);

  const onConnect = useCallback((connection: Connection) => {
    const decision = connectionDecision(connection);
    if (!decision.allowed) return;
    snapshot();
    const edge: PatchEdge = {
      ...connection,
      id: `user-${crypto.randomUUID()}`,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      className: decision.status.includes("verified") ? "verified-cable" : "unverified-cable",
      animated: decision.status === "unverified" || decision.status === "inferred",
      data: { compatibilityEdgeId: decision.edge?.id },
    };
    setEdges((current) => addEdge(edge, current));
    setMessage({ kind: decision.status.includes("verified") ? "success" : "warning", text: decision.reason });
  }, [connectionDecision, setEdges, snapshot]);

  function onConnectEnd(_: MouseEvent | TouchEvent, state: FinalConnectionState) {
    if (state.toHandle && state.isValid === false) {
      setMessage({ kind: "warning", text: lastDecisionRef.current ?? "Those ports are not compatible." });
    }
    setActiveSourcePortId(undefined);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setHistory((items) => items.slice(0, -1));
  }

  function autoLayout() {
    snapshot();
    setNodes((current) => current.map((node, index) => ({ ...node, position: layoutPosition(index) })));
    setTimeout(() => instanceRef.current?.fitView({ padding: 0.25, duration: 350 }), 40);
  }

  return (
    <div className="patchbay-shell">
      <aside className="catalog-panel">
        <div className="catalog-heading"><span className="eyebrow">{mode === "explore" ? "Explore the ecosystem" : "Component library"}</span><span className="count">{catalogResults.length}</span></div>
        <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models, agents, protocols…" aria-label="Search component library" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</label>
        <div className="filter-chips" aria-label="Component type filter">
          {["all", "model_variant", "runtime", "gateway", "agent", "coding_agent", "protocol", "tool"].map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item === "all" ? "All" : item.replaceAll("_", " ")}</button>)}
        </div>
        <div className="filter-chips compact" aria-label="Capability filter">
          {["all", "local", "cloud", "open_weights", "coding", "vision", "tool_calling", "cli", "gui", "apple_silicon", "cuda"].map((item) => <button key={item} onClick={() => setCapability(item)} className={capability === item ? "active" : ""}>{item === "all" ? "Any capability" : item.replaceAll("_", " ")}</button>)}
        </div>
        {mode === "explore" && <RoutePlanner data={data} />}
        <div className="catalog-results">
          {catalogResults.map((component) => (
            <button key={component.id} className="catalog-card" onClick={() => addComponent(component)} aria-label={`${mode === "explore" ? "Reveal" : "Add"} ${component.name}`}>
              <BrandMark component={component} />
              <span><strong>{component.shortName}</strong><small>{component.componentType.replaceAll("_", " ")} · {data.ports.filter((port) => port.componentId === component.id).length} ports</small></span>
              <span className="add-mark">+</span>
            </button>
          ))}
          {!catalogResults.length && <p className="empty-copy">No matching records. Try a broader name or clear a filter.</p>}
        </div>
        {mode === "build" && <button className="button secondary full" onClick={loadDemo}><LayoutGrid size={15} /> Load example chain</button>}
      </aside>

      <main className="canvas-region">
        <div className="canvas-toolbar">
          <div className={`build-status ${status.status}`}><span className="status-light" />{status.status.replaceAll("_", " ")}</div>
          <div className="toolbar-actions">
            <button onClick={undo} disabled={!history.length} title="Undo"><Undo2 size={16} /></button>
            <button onClick={autoLayout} title="Auto-arrange"><LayoutGrid size={16} /></button>
            <button onClick={restoreLocal} title="Restore saved build"><RotateCcw size={16} /></button>
            <button onClick={saveBuild} title="Save locally"><Save size={16} /></button>
            <button onClick={shareBuild} title="Copy share link"><Share2 size={16} /></button>
            <button onClick={openSetupGuide} title="Setup this stack">Setup</button>
            <button onClick={() => { snapshot(); setNodes([]); setEdges([]); }} title="Clear canvas"><Trash2 size={16} /></button>
          </div>
        </div>
        {message && <div className={`canvas-message ${message.kind}`} role="status">{message.kind === "success" ? <Check size={16} /> : <TriangleAlert size={16} />}<span>{message.text}</span><button onClick={() => setMessage(undefined)} aria-label="Dismiss message"><X size={14} /></button></div>}
        {!nodes.length && mode === "build" && <div className="empty-canvas"><div className="empty-jack"><i /><i /><i /></div><span className="eyebrow">Signal chain empty</span><h2>Start patching your stack</h2><p>Add a model, runtime, or agent from the library. Compatible ports will light up when you pull a cable.</p><button className="button primary" onClick={loadDemo}>Load a sourced example</button></div>}
        <ReactFlow<Node<PatchNodeData>, PatchEdge>
          nodes={renderedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={(instance) => (instanceRef.current = instance)}
          onConnect={onConnect}
          onConnectStart={(_, params) => params.handleType === "source" && setActiveSourcePortId(params.handleId ?? undefined)}
          onConnectEnd={onConnectEnd}
          isValidConnection={isValidConnection}
          onNodeDoubleClick={(_, node) => inspectComponent(node.data.component)}
          onEdgeClick={(_, edge) => {
            const record = edge.data?.compatibilityEdgeId ? data.compatibilityEdges.find((item) => item.id === edge.data?.compatibilityEdgeId) : undefined;
            if (record) { setSelectedComponent(undefined); setSelectedCompatibility(record); }
          }}
          onEdgesDelete={() => snapshot()}
          fitView
          minZoom={0.25}
          maxZoom={1.7}
          defaultEdgeOptions={{ type: "smoothstep" }}
          deleteKeyCode={["Backspace", "Delete"]}
          proOptions={{ hideAttribution: false }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.1} color="var(--canvas-dot)" />
          <MiniMap nodeColor="var(--accent)" maskColor="var(--minimap-mask)" pannable zoomable />
          <Controls showInteractive={false} />
        </ReactFlow>
      </main>
      {selectedComponent && <ComponentDetail component={selectedComponent} data={data} onClose={() => setSelectedComponent(undefined)} />}
      {selectedCompatibility && <EdgeDetail edge={selectedCompatibility} data={data} onClose={() => setSelectedCompatibility(undefined)} />}
    </div>
  );
}
