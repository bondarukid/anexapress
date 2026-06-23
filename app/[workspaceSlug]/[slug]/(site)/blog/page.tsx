import { notFound } from "next/navigation";

import { BlogIndexView } from "@/components/cms/public/blog-index-view";
import { getSiteBySlug } from "@/lib/cms/resolve-site";
import { listPublishedPostsForSite } from "@/services/post.service";
import { getPublishedSitePage } from "@/services/site-page.service";

type SiteBlogIndexProps = {
  params: Promise<{ workspaceSlug: string; slug: string }>;
};

export default async function SiteBlogIndexPage({ params }: SiteBlogIndexProps) {
  const { workspaceSlug, slug: siteSlug } = await params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) notFound();

  const blogPage = await getPublishedSitePage(resolved.site.id, "blog");
  const posts = await listPublishedPostsForSite(resolved.site.id);

  return (
    <BlogIndexView
      title={blogPage?.title ?? "Blog"}
      posts={posts}
      basePath={`/${workspaceSlug}/${siteSlug}`}
    />
  );
}
