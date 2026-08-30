import { PatchbayCanvas } from "@/components/patchbay/patchbay-canvas";
import { getBuildCatalog } from "@/lib/data/ecosystem-repository";

export const metadata = { title: "Build a stack · AI Patchbay", description: "Wire a compatible AI stack using typed ports." };

export default async function BuildPage() {
  const data = await getBuildCatalog();
  return <PatchbayCanvas data={data} mode="build" />;
}
