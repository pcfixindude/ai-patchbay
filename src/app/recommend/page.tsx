import { GuidedRecommendations } from "@/components/guided-recommendations";
import { getExploreGraph } from "@/lib/data/ecosystem-repository";
export const metadata={title:"Guided stack builder · AI Patchbay"};
export default async function RecommendPage(){return <GuidedRecommendations data={await getExploreGraph()}/>;}
