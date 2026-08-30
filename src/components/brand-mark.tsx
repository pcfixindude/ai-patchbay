import Image from "next/image";
import type { EcosystemComponent } from "@/lib/domain/types";
import { getComponentBrandAsset } from "@/data/brand-assets";

export function BrandMark({ component, size = "regular" }: { component: EcosystemComponent; size?: "regular" | "large" }) {
  const asset = getComponentBrandAsset(component);
  if (asset.assetPath) return <Image className={`brand-mark-image ${size}`} src={asset.assetPath} alt={`${component.name} logo`} width={40} height={40} />;
  return <span className={`monogram ${size === "large" ? "large" : ""}`} title={asset.notes} aria-label={`${component.name} initials`}>{component.shortName.slice(0, 2).toUpperCase()}</span>;
}
