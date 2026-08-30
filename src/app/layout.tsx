import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "AI Patchbay · Wire compatible AI stacks",
  description: "Explore how AI models, runtimes, agents, protocols, and tools fit together — then wire a compatible stack yourself.",
  openGraph: {
    title: "AI Patchbay · Wire compatible AI stacks",
    description: "A visual, evidence-backed compatibility map for the AI ecosystem.",
    type: "website",
    images: [{ url: "/og.png", width: 1729, height: 910, alt: "AI Patchbay — See what connects. Build what works." }],
  },
  twitter: { card: "summary_large_image", title: "AI Patchbay", description: "See what connects. Build what works.", images: ["/og.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('patchbay-theme');if(t)document.documentElement.dataset.theme=t}catch{}` }} /></head>
      <body><SiteHeader />{children}</body>
    </html>
  );
}
