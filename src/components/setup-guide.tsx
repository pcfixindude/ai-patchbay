"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { SetupGuide, SetupPlatform } from "@/lib/setup";

type Source = { id: string; title: string; url: string };

const platforms: Exclude<SetupPlatform, "generic">[] = ["macOS", "Linux", "Windows"];

export function SetupGuideView({ guide, sources, buildState }: { guide: SetupGuide; sources: Source[]; buildState: string }) {
  const storageKey = useMemo(() => `ai-patchbay-setup-progress:v1:${buildState}:${guide.platform}`, [buildState, guide.platform]);
  const [, setRevision] = useState(0);
  const [copied, setCopied] = useState<string>();
  const completedJson = useSyncExternalStore(() => () => undefined, () => localStorage.getItem(storageKey) ?? "[]", () => "[]");
  let completed: string[] = [];
  try { const parsed = JSON.parse(completedJson); completed = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []; } catch { /* ignore corrupted local progress */ }

  function updateProgress(next: string[]) {
    localStorage.setItem(storageKey, JSON.stringify(next));
    setRevision((revision) => revision + 1);
  }

  async function copy(command: string, stepId: string) {
    try { await navigator.clipboard.writeText(command); } catch { /* The visible command remains available where clipboard permission is unavailable. */ }
    setCopied(stepId);
    window.setTimeout(() => setCopied((current) => current === stepId ? undefined : current), 1600);
  }

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const completedSet = new Set(completed);
  return <>
    <section className="setup-summary" aria-label="Setup guide summary">
      <p><strong>Platform:</strong> {guide.platform} · <strong>Coverage:</strong> {guide.coverage} ({guide.coveredConnections}/{guide.totalConnections} connections) · <strong>Confidence:</strong> {guide.confidence} ({guide.confidenceScore}) · <strong>Freshness:</strong> {guide.freshness}</p>
      <label>Platform <select aria-label="Setup platform" value={guide.platform} onChange={(event) => {
        const url = new URL(window.location.href);
        url.searchParams.set("platform", event.target.value);
        window.location.assign(url.toString());
      }}>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
      <p>{completedSet.size}/{guide.steps.length} steps complete</p>
      <button type="button" onClick={() => updateProgress([])} disabled={!completedSet.size}>Reset setup progress</button>
    </section>
    <section aria-label="Setup steps">
      {guide.steps.map((step, index) => {
        const source = sourceById.get(step.sourceId);
        const isComplete = completedSet.has(step.id);
        return <article key={step.id} data-testid="setup-step">
          <h2>{index + 1}. {step.title}</h2>
          <p><strong>{step.kind === "connection" ? "Connection" : "Component"}:</strong> {step.edgeId ?? step.componentId}</p>
          <p>{step.resolvedDescription ?? step.description}</p>
          {step.command && <div>
            <pre><code>{step.command.resolvedCommand ?? step.command.command}</code></pre>
            <button type="button" onClick={() => copy(step.command?.resolvedCommand ?? step.command?.command ?? "", step.id)}>{copied === step.id ? "Copied" : "Copy command"}</button>
            {step.command.expectedResult && <p><strong>Expected result:</strong> {step.command.expectedResult}</p>}
          </div>}
          <p><strong>Validate:</strong> {step.validation ?? "Review the cited source before continuing."}</p>
          {source && <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>}
          <p>Last verified: {step.lastVerifiedAt}</p>
          <label><input type="checkbox" checked={isComplete} onChange={() => updateProgress(isComplete ? completed.filter((id) => id !== step.id) : [...completed, step.id])} /> Mark step complete</label>
        </article>;
      })}
      {guide.coverage !== "full" && <p role="status">Setup coverage is {guide.coverage}. Missing instructions: {guide.missing.join(", ") || "none"}. Available verified instructions remain shown above.</p>}
      {guide.requiredVariables.length > 0 && <aside><h2>Required placeholders</h2><ul>{guide.requiredVariables.map((variable) => <li key={variable.name}><code>{`{{${variable.name}}}`}</code> — {variable.description}{variable.secret ? " (secret; do not store it here)" : ""}</li>)}</ul></aside>}
    </section>
  </>;
}
