import { notFound } from "next/navigation";

import { BlogIndexView } from "@/components/cms/public/blog-index-view";
import { BlockContentRenderer } from "@/components/cms/renderer/block-content-renderer";
import { getSiteHomePage, getSiteBySlug } from "@/lib/cms/resolve-site";
import { getPublishedSitePage } from "@/services/site-page.service";
import { listPublishedPostsForSite } from "@/services/post.service";

type SiteHomePageProps = {
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default async function SiteHomePage({ params }: SiteHomePageProps) {
  const { workspaceSlug, slug: siteSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) notFound();

  const homePage = await getSiteHomePage(resolved.site);
  if (!homePage) notFound();

  if (homePage.type === "blog_index") {
    const posts = await listPublishedPostsForSite(resolved.site.id);
    return (
      <BlogIndexView
        title={homePage.title}
        posts={posts}
        basePath={`/${workspaceSlug}/${siteSlug}`}
      />
    );
  }

  const published = await getPublishedSitePage(resolved.site.id, homePage.slug);
  if (!published) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">{published.title}</h1>
      <BlockContentRenderer content={published.content} />
    </div>
  );
}
