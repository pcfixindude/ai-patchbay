import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ComponentDetail } from "@/components/component-detail";
import { getComponentBySlug } from "@/lib/data/ecosystem-repository";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { component } = await getComponentBySlug(slug);
  if (!component) return {};
  return {
    title: `${component.name} · AI Patchbay`, description: component.description,
    openGraph: { title: `${component.name} · AI Patchbay`, description: component.description, images: [] },
    twitter: { card: "summary", title: `${component.name} · AI Patchbay`, description: component.description, images: [] },
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { component, data } = await getComponentBySlug(slug);
  if (!component) notFound();
  return <main className="canonical-page"><Link href="/explore" className="back-link"><ArrowLeft size={15} /> Back to explorer</Link><ComponentDetail component={component} data={data} /></main>;
}
