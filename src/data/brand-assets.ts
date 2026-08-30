export type BrandAsset = {
  slug: string;
  assetPath?: string;
  sourceUrl?: string;
  sourceType: "official_brand_kit" | "official_repository" | "safe_fallback";
  notes: string;
  verifiedAt: string;
};

// Assets are intentionally conservative: we only render a local file when it has been vetted and committed.
// Until then every component receives a neutral monogram fallback instead of hotlinking or redistributing a logo.
const brandedSources: Record<string, Omit<BrandAsset, "slug">> = {
  github: { assetPath: "/brand-assets/github.svg", sourceUrl: "https://github.githubassets.com/favicons/favicon.svg", sourceType: "official_brand_kit", notes: "Unmodified official GitHub favicon, retained with its source URL for audit.", verifiedAt: "2026-08-29" },
  "hugging-face": { assetPath: "/brand-assets/hugging-face.svg", sourceUrl: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg", sourceType: "official_brand_kit", notes: "Unmodified official Hugging Face logo asset, retained with its source URL for audit.", verifiedAt: "2026-08-29" },
  openai: { sourceUrl: "https://openai.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local OpenAI asset is added.", verifiedAt: "2026-08-29" },
  anthropic: { sourceUrl: "https://www.anthropic.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Anthropic asset is added.", verifiedAt: "2026-08-29" },
  google: { sourceUrl: "https://ai.google.dev/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Google asset is added.", verifiedAt: "2026-08-29" },
  "alibaba-qwen": { sourceUrl: "https://qwen.ai/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Qwen asset is added.", verifiedAt: "2026-08-29" },
  "nous-research": { sourceUrl: "https://nousresearch.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Nous Research asset is added.", verifiedAt: "2026-08-29" },
  meta: { sourceUrl: "https://ai.meta.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Meta asset is added.", verifiedAt: "2026-08-29" },
  deepseek: { sourceUrl: "https://www.deepseek.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local DeepSeek asset is added.", verifiedAt: "2026-08-29" },
  "mistral-ai": { sourceUrl: "https://mistral.ai/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Mistral asset is added.", verifiedAt: "2026-08-29" },
  "z-ai": { sourceUrl: "https://z.ai/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Z.ai asset is added.", verifiedAt: "2026-08-29" },
  xai: { sourceUrl: "https://x.ai/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local xAI asset is added.", verifiedAt: "2026-08-29" },
  microsoft: { sourceUrl: "https://www.microsoft.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Microsoft asset is added.", verifiedAt: "2026-08-29" },
  nvidia: { sourceUrl: "https://www.nvidia.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local NVIDIA asset is added.", verifiedAt: "2026-08-29" },
  cohere: { sourceUrl: "https://cohere.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local Cohere asset is added.", verifiedAt: "2026-08-29" },
  ibm: { sourceUrl: "https://www.ibm.com/", sourceType: "safe_fallback", notes: "Use neutral initials until an approved local IBM asset is added.", verifiedAt: "2026-08-29" },
};

const organizationBrandSlug: Record<string, string> = {
  "org-huggingface": "hugging-face",
};

export function getBrandAsset(slug: string): BrandAsset {
  return { slug, ...(brandedSources[slug] ?? { sourceType: "safe_fallback", notes: "Neutral initials fallback; no local brand asset has been approved.", verifiedAt: "2026-08-29" }) };
}

export function getComponentBrandAsset(component: { slug: string; organizationId?: string }): BrandAsset {
  return getBrandAsset(brandedSources[component.slug] ? component.slug : organizationBrandSlug[component.organizationId ?? ""] ?? component.slug);
}
