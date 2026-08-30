import type { CompatibilityEdge, EcosystemComponent, Port } from "@/lib/domain/types";

export function childrenByParent(components: EcosystemComponent[]) {
  return components.reduce<Map<string, EcosystemComponent[]>>((map, component) => {
    if (!component.parentComponentId) return map;
    map.set(component.parentComponentId, [...(map.get(component.parentComponentId) ?? []), component]);
    return map;
  }, new Map());
}

export function defaultExploreRoots(components: EcosystemComponent[]) {
  const deferred = new Set(["tool", "sdk", "agent_framework", "model", "model_variant"]);
  return components.filter((component) => !component.parentComponentId && !deferred.has(component.componentType));
}

export function visibleHierarchyComponents(components: EcosystemComponent[], expanded: ReadonlySet<string>) {
  const byParent = childrenByParent(components);
  const visible = new Set(defaultExploreRoots(components).map((component) => component.id));
  const visit = (parentId: string) => {
    if (!expanded.has(parentId)) return;
    for (const child of byParent.get(parentId) ?? []) {
      visible.add(child.id);
      visit(child.id);
    }
  };
  for (const root of [...visible]) visit(root);
  return visible;
}

export function expandedWithAncestors(componentId: string, components: EcosystemComponent[], expanded: ReadonlySet<string>) {
  const byId = new Map(components.map((component) => [component.id, component]));
  const next = new Set(expanded);
  let current = byId.get(componentId);
  while (current?.parentComponentId) {
    next.add(current.parentComponentId);
    current = byId.get(current.parentComponentId);
  }
  return next;
}

export function visibleHierarchyEdges(edges: CompatibilityEdge[], ports: Port[], visibleComponentIds: ReadonlySet<string>) {
  const portComponent = new Map(ports.map((port) => [port.id, port.componentId]));
  return edges.filter((edge) => visibleComponentIds.has(portComponent.get(edge.sourcePortId) ?? "") && visibleComponentIds.has(portComponent.get(edge.targetPortId) ?? ""));
}
