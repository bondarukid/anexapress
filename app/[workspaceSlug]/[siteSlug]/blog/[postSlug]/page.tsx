import type { Metadata } from "next";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import { BlockContentRenderer } from "@/components/cms/renderer/block-content-renderer";
import { buildSiteCanonicalUrl } from "@/lib/cms/site-canonical";
import { getSiteBySlug } from "@/lib/cms/resolve-site";
import { getPublishedPostForSite } from "@/services/post.service";

type SiteBlogPostProps = {
  params: Promise<{ workspaceSlug: string; siteSlug: string; postSlug: string }>;
};

export async function generateMetadata({ params }: SiteBlogPostProps): Promise<Metadata> {
  const { workspaceSlug, siteSlug, postSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) return { title: "Not found" };

  const post = await getPublishedPostForSite(resolved.site.id, postSlug);
  if (!post) return { title: "Not found" };

  const url = await buildSiteCanonicalUrl({
    workspaceSlug,
    siteSlug,
    primaryDomain: resolved.site.primaryDomain,
    path: `/blog/${postSlug}`,
  });

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? undefined,
    alternates: { canonical: post.seoCanonical ?? url },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? undefined,
      url,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.ogImageUrl ? [{ url: post.ogImageUrl }] : undefined,
    },
  };
}

export default async function SiteBlogPostPage({ params }: SiteBlogPostProps) {
  const { workspaceSlug, siteSlug, postSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) notFound();

  const post = await getPublishedPostForSite(resolved.site.id, postSlug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    description: post.seoDescription,
    image: post.ogImageUrl,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          {post.publishedAt ? (
            <time className="text-muted-foreground mt-3 block text-sm">
              {format(new Date(post.publishedAt), "MMMM d, yyyy")}
            </time>
          ) : null}
        </header>
        <BlockContentRenderer content={post.content} />
      </article>
    </div>
  );
}
