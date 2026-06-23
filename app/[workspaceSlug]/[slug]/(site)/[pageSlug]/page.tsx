import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BlockContentRenderer } from "@/components/cms/renderer/block-content-renderer";
import { getSiteBySlug } from "@/lib/cms/resolve-site";
import { getPublishedSitePage } from "@/services/site-page.service";

type SitePageRouteProps = {
  params: Promise<{ workspaceSlug: string; slug: string; pageSlug: string }>;
};

export async function generateMetadata({ params }: SitePageRouteProps): Promise<Metadata> {
  const { workspaceSlug, slug: siteSlug, pageSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) return { title: "Not found" };

  const page = await getPublishedSitePage(resolved.site.id, pageSlug);
  if (!page) return { title: "Not found" };

  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? resolved.site.seoDefaultDescription ?? undefined,
    openGraph: {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? undefined,
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : undefined,
    },
  };
}

export default async function SiteCustomPage({ params }: SitePageRouteProps) {
  const { workspaceSlug, slug: siteSlug, pageSlug } = await params;

  if (pageSlug === "blog") {
    redirect(`/${workspaceSlug}/${siteSlug}/blog`);
  }

  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) notFound();

  const page = await getPublishedSitePage(resolved.site.id, pageSlug);
  if (!page) notFound();

  if (page.type === "blog_index") {
    redirect(`/${workspaceSlug}/${siteSlug}/blog`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">{page.title}</h1>
      <BlockContentRenderer content={page.content} />
    </div>
  );
}
