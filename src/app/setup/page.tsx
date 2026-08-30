import { SetupGuideView } from "@/components/setup-guide";
import { deserializeBuild } from "@/lib/build/serialization";
import { getBuildCatalog } from "@/lib/data/ecosystem-repository";
import { generateSetupGuide, setupPlatformSchema } from "@/lib/setup";

export const metadata = { title: "Setup guide · AI Patchbay" };

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ state?: string; platform?: string }> }) {
  const { state, platform: requestedPlatform } = await searchParams;
  if (!state) return <main className="page-shell"><h1>Setup guide</h1><p>Open Setup from a shared or recommended build.</p></main>;
  let build;
  try { build = deserializeBuild(state); } catch { return <main className="page-shell"><h1>Setup guide</h1><p>This build link is invalid.</p></main>; }
  const data = await getBuildCatalog();
  const parsedPlatform = setupPlatformSchema.safeParse(requestedPlatform);
  const platform = parsedPlatform.success && parsedPlatform.data !== "generic" ? parsedPlatform.data : "macOS";
  const guide = generateSetupGuide(build, data, platform);
  const components = build.nodes.map((node) => data.components.find((component) => component.id === node.componentId)?.shortName).filter(Boolean);
  return <main className="page-shell"><header className="page-hero"><span className="eyebrow">Evidence-backed setup</span><h1>Setup this stack</h1><p>{components.join(" → ")}</p></header><SetupGuideView guide={guide} buildState={state} sources={data.sources.map(({ id, title, url }) => ({ id, title, url }))} /></main>;
}
