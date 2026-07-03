import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlockContentRenderer } from "@/components/cms/renderer/block-content-renderer";
import { PostPublicHeader } from "@/components/cms/public/post-public-header";
import { buildSiteCanonicalUrl } from "@/lib/cms/site-canonical";
import { resolveSeoMetaDescription, resolveSeoTitle } from "@/lib/cms/post-mappers";
import { getSiteBySlug } from "@/lib/cms/resolve-site";
import { getPublishedPostForSite } from "@/services/post.service";

type SiteBlogPostProps = {
  params: Promise<{ workspaceSlug: string; slug: string; postSlug: string }>;
};

export async function generateMetadata({ params }: SiteBlogPostProps): Promise<Metadata> {
  const { workspaceSlug, slug: siteSlug, postSlug } = await params;
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

  const seoMetaDescription = resolveSeoMetaDescription(post.description, {
    seoDescription: post.seoDescription,
    usePostDescriptionForSeo: post.usePostDescriptionForSeo,
  });
  const seoOgTitle = resolveSeoTitle(post.title, { seoTitle: post.seoTitle });

  return {
    title: seoOgTitle,
    description: seoMetaDescription ?? undefined,
    alternates: { canonical: post.seoCanonical ?? url },
    openGraph: {
      title: seoOgTitle,
      description: seoMetaDescription ?? undefined,
      url,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.ogImageUrl ? [{ url: post.ogImageUrl }] : undefined,
    },
  };
}

export default async function SiteBlogPostPage({ params }: SiteBlogPostProps) {
  const { workspaceSlug, slug: siteSlug, postSlug } = await params;
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
    description: resolveSeoMetaDescription(post.description, {
      seoDescription: post.seoDescription,
      usePostDescriptionForSeo: post.usePostDescriptionForSeo,
    }),
    image: post.ogImageUrl,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <PostPublicHeader
          title={post.title}
          description={post.description}
          authorName={post.authorName}
          authorAvatarUrl={post.authorAvatarUrl}
          publishedAt={post.publishedAt}
        />
        <BlockContentRenderer content={post.content} />
      </article>
    </div>
  );
}
