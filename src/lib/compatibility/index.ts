import type {
  CompatibilityEdge,
  CompatibilityStatus,
  EcosystemComponent,
  HardwareConstraints,
  PathResult,
  Port,
} from "@/lib/domain/types";
import { freshnessLabel } from "@/lib/updater/freshness";

export interface CompatibilityContext {
  ports: Port[];
  edges: CompatibilityEdge[];
  components?: EcosystemComponent[];
}

export interface CompatibilityDecision {
  allowed: boolean;
  status: CompatibilityStatus | "unknown";
  reason: string;
  edge?: CompatibilityEdge;
}

const acceptedStatuses = new Set<CompatibilityStatus>([
  "verified_official",
  "verified_first_party",
  "verified_community",
  "tested_internal",
  "inferred",
  "unverified",
]);

export function canConnect(source: Port, target: Port, context: CompatibilityContext): CompatibilityDecision {
  if (source.id === target.id) {
    return { allowed: false, status: "incompatible", reason: "A port cannot connect to itself." };
  }
  if (source.componentId === target.componentId) {
    return { allowed: false, status: "incompatible", reason: "Patch cables connect separate components." };
  }
  const sourceCanSend = source.direction === "output" || source.direction === "bidirectional";
  const targetCanReceive = target.direction === "input" || target.direction === "bidirectional";
  if (!sourceCanSend || !targetCanReceive) {
    return {
      allowed: false,
      status: "incompatible",
      reason: "Signal direction is invalid: connect an output to an input.",
    };
  }
  const edge = context.edges.find(
    (candidate) => candidate.sourcePortId === source.id && candidate.targetPortId === target.id,
  );
  if (edge) {
    return {
      allowed: acceptedStatuses.has(edge.status) && edge.compatibilityLevel !== "none",
      status: edge.status,
      reason: explainCompatibility(edge),
      edge,
    };
  }
  const protocolMatches = source.protocolType === target.protocolType;
  const dataMatches = source.dataType === target.dataType || target.dataType === "any";
  const sourceComponent = context.components?.find((item) => item.id === source.componentId);
  const targetComponent = context.components?.find((item) => item.id === target.componentId);
  const names = sourceComponent && targetComponent ? `${sourceComponent.shortName} → ${targetComponent.shortName}` : "These ports";

  if (protocolMatches && dataMatches) {
    return {
      allowed: false,
      status: "unverified",
      reason: `${names} speak the same protocol, but no evidence-backed compatibility record exists yet.`,
    };
  }
  if (source.dataType.includes("model") && target.dataType.includes("api")) {
    return {
      allowed: false,
      status: "incompatible",
      reason: `${names} cannot connect directly: model weights need a compatible runtime that exposes the API this component consumes.`,
    };
  }
  return {
    allowed: false,
    status: "incompatible",
    reason: `${names} use incompatible port types (${source.protocolType} → ${target.protocolType}).`,
  };
}

export function explainCompatibility(edge: CompatibilityEdge): string {
  if (edge.status === "incompatible") return edge.notes || "This connection is explicitly incompatible.";
  if (edge.status === "deprecated") return `This connection is deprecated. ${edge.notes}`.trim();
  const trust = edge.status.replaceAll("_", " ");
  const configuration = edge.configurationRequired ? " Configuration is required." : "";
  return `${trust}: ${edge.notes}${configuration}`;
}

export function findCompatibleTargets(source: Port, context: CompatibilityContext): Port[] {
  return context.ports.filter((target) => canConnect(source, target, context).allowed);
}

function componentAllowed(component: EcosystemComponent, constraints: HardwareConstraints): boolean {
  if (constraints.localOnly && !component.localCapable) return false;
  if (constraints.cloudOnly && !component.cloudCapable) return false;
  if (constraints.openSourceOnly && !component.openSource) return false;
  if (constraints.openWeightsOnly && component.componentType.includes("model") && !component.openWeights) return false;
  if (constraints.appleSilicon && component.operatingSystems.length > 0 && !component.operatingSystems.includes("macOS")) return false;
  if (constraints.codingRequired && !component.codingCapable) return false;
  if (constraints.visionRequired && !component.visionCapable) return false;
  if (constraints.cliRequired && !component.cliAvailable) return false;
  if (constraints.guiRequired && !component.guiAvailable) return false;
  if (constraints.toolCallingRequired && !component.toolCallingCapable) return false;
  if (constraints.cudaRequired && !component.tags.some((tag) => tag.toLowerCase().includes("cuda"))) return false;
  return constraints.avoidDeprecated === false || component.status !== "deprecated";
}

const statusWeight: Record<CompatibilityStatus, number> = {
  verified_official: 100,
  verified_first_party: 94,
  tested_internal: 82,
  verified_community: 76,
  inferred: 48,
  unverified: 30,
  incompatible: -1000,
  deprecated: -250,
};

export function routeTrustSummary(path: PathResult, edges: CompatibilityEdge[], components: EcosystemComponent[] = []) {
  const byId = new Map(edges.map((edge) => [edge.id, edge]));
  const pathEdges = path.edgeIds.map((id) => byId.get(id)).filter((edge): edge is CompatibilityEdge => Boolean(edge));
  const count = (status: CompatibilityStatus) => pathEdges.filter((edge) => edge.status === status).length;
  const order: CompatibilityStatus[] = ["unverified", "inferred", "verified_community", "tested_internal", "verified_first_party", "verified_official"];
  return {
    totalEdges: pathEdges.length, verifiedOfficial: count("verified_official"), verifiedFirstParty: count("verified_first_party"), testedInternal: count("tested_internal"), verifiedCommunity: count("verified_community"), inferred: count("inferred"), unverified: count("unverified"),
    staleEdges: pathEdges.filter((edge) => freshnessLabel(edge.lastVerifiedAt, "compatibility") === "Stale verification").length,
    deprecatedComponents: path.componentIds.filter((id) => components.find((component) => component.id === id)?.status === "deprecated").length,
    weakestTrust: order.find((status) => count(status) > 0),
  };
}

export function rankPaths(paths: PathResult[], edges: CompatibilityEdge[], components: EcosystemComponent[] = []): PathResult[] {
  const byId = new Map(edges.map((edge) => [edge.id, edge]));
  return paths
    .map((path) => {
      const pathEdges = path.edgeIds.map((id) => byId.get(id)).filter((edge): edge is CompatibilityEdge => Boolean(edge));
      const score = pathEdges.reduce((total, edge) => total + statusWeight[edge.status], 0) - pathEdges.length * 8;
      const warnings = pathEdges.flatMap((edge) =>
        edge.status === "inferred" || edge.status === "unverified" || edge.status === "deprecated"
          ? [`${edge.id} is ${edge.status.replaceAll("_", " ")}`]
          : [],
      );
      const verified = pathEdges.filter((edge) => edge.status === "verified_official" || edge.status === "verified_first_party" || edge.status === "tested_internal").length;
      const trustSummary = routeTrustSummary(path, edges, components);
      return { ...path, score: score - trustSummary.staleEdges * 5 - trustSummary.deprecatedComponents * 25, warnings, trustSummary, explanation: [`${pathEdges.length} hop${pathEdges.length === 1 ? "" : "s"}`, `${verified} strong-trust edge${verified === 1 ? "" : "s"}`, trustSummary.staleEdges ? `${trustSummary.staleEdges} stale verification${trustSummary.staleEdges === 1 ? "" : "s"}` : "no stale evidence", trustSummary.deprecatedComponents ? `${trustSummary.deprecatedComponents} deprecated component${trustSummary.deprecatedComponents === 1 ? "" : "s"}` : "no deprecated components", warnings.length ? `${warnings.length} lower-trust edge${warnings.length === 1 ? "" : "s"}` : "no lower-trust edges"] };
    })
    .sort((a, b) => b.score - a.score || a.edgeIds.length - b.edgeIds.length);
}

export function findPaths(
  startComponentId: string,
  goalComponentId: string,
  context: Required<CompatibilityContext>,
  constraints: HardwareConstraints = {},
  maxHops = 6,
): PathResult[] {
  const portsById = new Map(context.ports.map((port) => [port.id, port]));
  const componentsById = new Map(context.components.map((component) => [component.id, component]));
  const adjacency = new Map<string, Array<{ target: string; edge: CompatibilityEdge }>>();

  for (const edge of context.edges) {
    if (!acceptedStatuses.has(edge.status) || edge.compatibilityLevel === "none") continue;
    const strongTrust = ["verified_official", "verified_first_party", "tested_internal"] as const;
    if (constraints.verifiedOnly && !strongTrust.includes(edge.status as typeof strongTrust[number]) && !(constraints.allowCommunityRoutes && edge.status === "verified_community")) continue;
    if (constraints.allowCommunityRoutes === false && edge.status === "verified_community") continue;
    if (constraints.allowInferredUnverifiedRoutes === false && (edge.status === "inferred" || edge.status === "unverified")) continue;
    if (constraints.avoidDeprecated !== false && edge.status === "deprecated") continue;
    const source = portsById.get(edge.sourcePortId);
    const target = portsById.get(edge.targetPortId);
    const targetComponent = target && componentsById.get(target.componentId);
    if (!source || !target || !targetComponent || !componentAllowed(targetComponent, constraints)) continue;
    const existing = adjacency.get(source.componentId) ?? [];
    existing.push({ target: target.componentId, edge });
    adjacency.set(source.componentId, existing);
  }

  const startComponent = componentsById.get(startComponentId);
  if (!startComponent || !componentAllowed(startComponent, constraints)) return [];
  const results: PathResult[] = [];
  const queue: Array<{ componentIds: string[]; edgeIds: string[] }> = [{ componentIds: [startComponentId], edgeIds: [] }];
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    const last = current.componentIds.at(-1)!;
    if (last === goalComponentId) {
      results.push({ ...current, score: 0, warnings: [] });
      continue;
    }
    if (current.edgeIds.length >= maxHops) continue;
    for (const next of adjacency.get(last) ?? []) {
      if (current.componentIds.includes(next.target)) continue;
      queue.push({
        componentIds: [...current.componentIds, next.target],
        edgeIds: [...current.edgeIds, next.edge.id],
      });
    }
  }
  return rankPaths(results, context.edges, context.components);
}

export function validateBuild(
  connections: Array<{ sourcePortId: string; targetPortId: string }>,
  context: CompatibilityContext,
) {
  const ports = new Map(context.ports.map((port) => [port.id, port]));
  const decisions = connections.map(({ sourcePortId, targetPortId }) => {
    const source = ports.get(sourcePortId);
    const target = ports.get(targetPortId);
    if (!source || !target) return { allowed: false, status: "unknown" as const, reason: "A referenced port is missing." };
    return canConnect(source, target, context);
  });
  return {
    status: decisions.some((decision) => !decision.allowed)
      ? "incompatible"
      : decisions.some((decision) => decision.status === "unverified" || decision.status === "inferred")
        ? "contains_unverified_links"
        : connections.length === 0
          ? "incomplete"
          : "complete",
    decisions,
  } as const;
}
