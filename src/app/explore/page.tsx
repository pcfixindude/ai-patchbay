import { PatchbayCanvas } from "@/components/patchbay/patchbay-canvas";
import { getExploreGraph } from "@/lib/data/ecosystem-repository";

export const metadata = { title: "Explore ecosystem · AI Patchbay", description: "Explore sourced AI component compatibility." };

export default async function ExplorePage() {
  const data = await getExploreGraph();
  return <PatchbayCanvas data={data} mode="explore" />;
}
