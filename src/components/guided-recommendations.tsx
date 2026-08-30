"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { serializeBuild } from "@/lib/build/serialization";
import {
  diagnoseRecommendations,
  hardwareProfileSchema,
  type RecommendationInput,
} from "@/lib/recommendation";
import type { EcosystemData } from "@/lib/domain/types";
import {
  loadHardwareProfiles,
  saveHardwareProfiles,
} from "@/lib/recommendation/profiles";

const defaultInput: RecommendationInput = {
  task: "coding",
  runPreference: "local",
  interface: "cli",
  priorities: ["privacy"],
  verifiedOnly: true,
  profile: hardwareProfileSchema.parse({
    name: "This device",
    operatingSystem: "macOS",
    architecture: "apple_silicon",
    memoryGb: 32,
    gpuType: "apple",
    appleChip: "M3",
  }),
};

const profileFields = new Set<keyof RecommendationInput["profile"]>([
  "name",
  "operatingSystem",
  "architecture",
  "memoryGb",
  "gpuType",
  "vramGb",
  "appleChip",
  "cudaAvailable",
  "cpuOnly",
]);

export function GuidedRecommendations({ data }: { data: EcosystemData }) {
  const [input, setInput] = useState<RecommendationInput>(defaultInput);
  const [profiles, setProfiles] = useState<(typeof input.profile)[]>([]);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<
    number | undefined
  >();
  const diagnostics = useMemo(
    () => diagnoseRecommendations(data, input),
    [data, input],
  );
  const { recommendations: results } = diagnostics;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setProfiles(loadHardwareProfiles(localStorage)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const update = (key: string, value: string | number | boolean) =>
    setInput((current) =>
      profileFields.has(key as keyof RecommendationInput["profile"])
        ? {
            ...current,
            profile: hardwareProfileSchema.parse({
              ...current.profile,
              [key]: value,
            }),
          }
        : ({ ...current, [key]: value } as RecommendationInput),
    );
  const setPriority = (priority: string, enabled: boolean) =>
    setInput((current) => ({
      ...current,
      priorities: enabled
        ? [...new Set([...current.priorities, priority])]
        : current.priorities.filter((item) => item !== priority),
    }));
  const persistProfiles = (next: typeof profiles) => {
    setProfiles(next);
    saveHardwareProfiles(localStorage, next);
  };
  const saveProfile = () => {
    const existingIndex =
      selectedProfileIndex ??
      profiles.findIndex((profile) => profile.name === input.profile.name);
    const next =
      existingIndex === -1 || existingIndex === undefined
        ? [...profiles, input.profile]
        : profiles.map((profile, index) =>
            index === existingIndex ? input.profile : profile,
          );
    persistProfiles(next);
    setSelectedProfileIndex(
      existingIndex === -1 || existingIndex === undefined
        ? next.length - 1
        : existingIndex,
    );
  };
  const deleteProfile = () => {
    if (selectedProfileIndex === undefined) return;
    persistProfiles(
      profiles.filter((_, index) => index !== selectedProfileIndex),
    );
    setSelectedProfileIndex(undefined);
  };
  const buildUrl = (ids: string[]) => {
    const nodes = ids.map((componentId, index) => ({
      instanceId: `recommend-${componentId}`,
      componentId,
      position: { x: 60 + index * 300, y: 160 },
    }));
    const by = new Map(
      nodes.map((node) => [node.componentId, node.instanceId]),
    );
    const connections = data.compatibilityEdges
      .filter((edge) => {
        const source = data.ports.find(
          (port) => port.id === edge.sourcePortId,
        )?.componentId;
        const target = data.ports.find(
          (port) => port.id === edge.targetPortId,
        )?.componentId;
        return source && target && by.has(source) && by.has(target);
      })
      .map((edge) => ({
        id: `recommend-${edge.id}`,
        sourceNodeId: by.get(
          data.ports.find((port) => port.id === edge.sourcePortId)!.componentId,
        )!,
        sourcePortId: edge.sourcePortId,
        targetNodeId: by.get(
          data.ports.find((port) => port.id === edge.targetPortId)!.componentId,
        )!,
        targetPortId: edge.targetPortId,
      }));
    return `/build?state=${encodeURIComponent(serializeBuild({ version: 1, name: "Guided recommendation", nodes, connections }))}`;
  };

  return (
    <main className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">Guided stack builder</span>
        <h1>Find a stack that fits your work and hardware.</h1>
        <p>
          Recommendations use the sourced compatibility graph and conservative
          hardware estimates—not popularity.
        </p>
      </header>
      <section className="recommend-grid">
        <form className="recommend-form">
          <label>
            Saved hardware profile
            <select
              aria-label="Saved hardware profile"
              value={selectedProfileIndex ?? ""}
              onChange={(event) => {
                const index = Number(event.target.value);
                const profile = profiles[index];
                if (profile) {
                  setSelectedProfileIndex(index);
                  setInput((current) => ({ ...current, profile }));
                }
              }}
            >
              <option value="">Choose saved profile</option>
              {profiles.map((profile, index) => (
                <option value={index} key={`${profile.name}-${index}`}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profile name
            <input
              value={input.profile.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={saveProfile}
            >
              Save this hardware profile
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={deleteProfile}
              disabled={selectedProfileIndex === undefined}
            >
              Delete saved hardware profile
            </button>
          </div>
          <label>
            Task
            <select
              value={input.task}
              onChange={(event) => update("task", event.target.value)}
            >
              <option value="coding">Coding / software development</option>
              <option value="assistant">General assistant</option>
              <option value="vision">Vision / image understanding</option>
              <option value="automation">Agent automation</option>
            </select>
          </label>
          <label>
            Where should it run?
            <select
              value={input.runPreference}
              onChange={(event) => update("runPreference", event.target.value)}
            >
              <option value="local">Fully local</option>
              <option value="prefer_local">Prefer local</option>
              <option value="hybrid">Hybrid is okay</option>
              <option value="cloud">Cloud is okay</option>
            </select>
          </label>
          <label>
            Interface
            <select
              value={input.interface}
              onChange={(event) => update("interface", event.target.value)}
            >
              <option value="cli">CLI</option>
              <option value="gui">GUI</option>
              <option value="ide">IDE</option>
              <option value="browser">Browser</option>
              <option value="any">No preference</option>
            </select>
          </label>
          <label>
            Operating system
            <select
              value={input.profile.operatingSystem}
              onChange={(event) =>
                update("operatingSystem", event.target.value)
              }
            >
              <option>macOS</option>
              <option>Windows</option>
              <option>Linux</option>
            </select>
          </label>
          <label>
            Architecture
            <select
              value={input.profile.architecture}
              onChange={(event) => update("architecture", event.target.value)}
            >
              <option value="apple_silicon">Apple Silicon</option>
              <option value="x64">x64</option>
              <option value="arm64">ARM64</option>
            </select>
          </label>
          <label>
            Total memory (GB)
            <input
              type="number"
              min="4"
              value={input.profile.memoryGb}
              onChange={(event) =>
                update("memoryGb", Number(event.target.value))
              }
            />
          </label>
          <label>
            GPU
            <select
              value={input.profile.gpuType}
              onChange={(event) => {
                const gpuType = event.target.value;
                setInput((current) => ({
                  ...current,
                  profile: hardwareProfileSchema.parse({
                    ...current.profile,
                    gpuType,
                    cudaAvailable: gpuType === "nvidia",
                    cpuOnly: gpuType === "none",
                  }),
                }));
              }}
            >
              <option value="apple">Apple unified memory</option>
              <option value="nvidia">NVIDIA</option>
              <option value="none">CPU only</option>
            </select>
          </label>
          {input.profile.gpuType === "nvidia" && (
            <>
              <label>
                VRAM (GB)
                <input
                  type="number"
                  value={input.profile.vramGb ?? 0}
                  onChange={(event) =>
                    update("vramGb", Number(event.target.value))
                  }
                />
              </label>
              <label>
                <input
                  aria-label="CUDA available"
                  type="checkbox"
                  checked={input.profile.cudaAvailable}
                  onChange={(event) =>
                    update("cudaAvailable", event.target.checked)
                  }
                />{" "}
                CUDA available
              </label>
              <label>
                <input
                  aria-label="Require CUDA-supported runtime"
                  type="checkbox"
                  checked={input.priorities.includes("cuda")}
                  onChange={(event) =>
                    setPriority("cuda", event.target.checked)
                  }
                />{" "}
                Require CUDA-supported runtime
              </label>
            </>
          )}
          <label>
            <input
              aria-label="Verified compatibility only"
              type="checkbox"
              checked={input.verifiedOnly}
              onChange={(event) => update("verifiedOnly", event.target.checked)}
            />{" "}
            Verified compatibility only
          </label>
        </form>
        <section className="recommend-results" aria-label="Recommendations">
          {results.map((result, index) => (
            <article
              className="route-result"
              data-testid="recommendation-card"
              key={result.path.edgeIds.join("-")}
            >
              <strong>
                {index === 0 ? "Best overall" : "Alternative"} ·{" "}
                {result.fit.level} fit
              </strong>
              <span data-testid="recommendation-chain">
                {result.path.componentIds
                  .map(
                    (id) =>
                      data.components.find((component) => component.id === id)
                        ?.shortName,
                  )
                  .join(" → ")}
              </span>
              <small>
                {result.privacy} · setup: {result.setup} · fit confidence:{" "}
                {result.fit.confidence}
              </small>
              {result.fit.practicalMemoryGb && (
                <small>
                  Estimated model memory ~{result.fit.estimatedModelGb} GB;
                  recommended practical memory {result.fit.practicalMemoryGb}{" "}
                  GB+
                </small>
              )}
              <small>{result.why.join(" ")}</small>
              <small>Tradeoff: {result.tradeoffs.join(" ")}</small>
              <Link
                className="button primary"
                href={buildUrl(result.path.componentIds)}
              >
                Open in Patchbay
              </Link>
            </article>
          ))}
          {!results.length && (
            <section
              className="empty-copy"
              data-testid="no-route"
              aria-label="No matching recommendation"
            >
              <p
                data-testid="no-route-reason"
                data-reason-codes={diagnostics.blockers
                  .map((blocker) => blocker.code)
                  .join(" ")}
              >
                {diagnostics.blockers
                  .map((blocker) => blocker.details)
                  .join(" ")}
              </p>
              <p>
                Relax one or more constraints to broaden the sourced routes
                considered.
              </p>
              <div className="form-actions">
                {diagnostics.relaxations.some(
                  (item) => item.code === "allow_lower_trust",
                ) && (
                  <button
                    type="button"
                    onClick={() => update("verifiedOnly", false)}
                  >
                    Allow lower-trust compatibility
                  </button>
                )}
                {diagnostics.relaxations.some(
                  (item) => item.code === "allow_cloud",
                ) && (
                  <button
                    type="button"
                    onClick={() => update("runPreference", "hybrid")}
                  >
                    Allow cloud-capable routes
                  </button>
                )}
                {diagnostics.relaxations.some(
                  (item) => item.code === "disable_strict_cuda",
                ) && (
                  <button
                    type="button"
                    onClick={() => setPriority("cuda", false)}
                  >
                    Remove strict CUDA requirement
                  </button>
                )}
              </div>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}
