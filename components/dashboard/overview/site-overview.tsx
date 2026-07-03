import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  FileImage,
  FileStack,
  FileText,
  LayoutTemplate,
  Settings,
} from "lucide-react";

import { NewPostButton } from "@/components/cms/create-post-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildSiteBasePath } from "@/lib/cms/site-paths";
import { getSiteOrigin } from "@/lib/auth/site-origin";
import { siteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { canCreateContent } from "@/lib/team/permissions";
import { listMediaFiles } from "@/services/media.service";
import { listPosts } from "@/services/post.service";
import { listSitePages } from "@/services/site-page.service";
import type { Site } from "@/types/site";
import type { WorkspaceAccessPermissions } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";

type SiteOverviewProps = {
  workspace: WorkspaceSummary;
  site: Site;
  workspaceAccess: WorkspaceAccessPermissions;
};

function buildPublicSitePath(workspace: WorkspaceSummary, siteSlug: string): string {
  const workspaceSegment =
    workspace.isChild && workspace.parentSlug
      ? `${workspace.parentSlug}/${workspace.slug}`
      : workspace.slug;
  return buildSiteBasePath(workspaceSegment, siteSlug);
}

/**
 * Site dashboard home — summary, live link, and quick actions for one site.
 */
export async function SiteOverview({ workspace, site, workspaceAccess }: SiteOverviewProps) {
  const pathInput =
    workspace.isChild && workspace.parentSlug
      ? { parentSlug: workspace.parentSlug, childSlug: workspace.slug }
      : workspace.slug;

  const siteBase = siteDashboardPath(pathInput, site.id, "");
  const [pages, posts, recentMedia] = await Promise.all([
    listSitePages(site.id),
    listPosts(workspace.id, site.id),
    listMediaFiles(workspace.id, { siteId: site.id, limit: 5 }),
  ]);

  const publishedPages = pages.filter((p) => p.status === "published").length;
  const draftPages = pages.filter((p) => p.status === "draft").length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const canCreate = canCreateContent(workspaceAccess);

  const publicPath = buildPublicSitePath(workspace, site.slug);
  const liveUrl = site.primaryDomain
    ? `${process.env.NODE_ENV === "development" ? "http" : "https"}://${site.primaryDomain}`
    : `${getSiteOrigin()}${publicPath}`;

  const quickLinks = [
    {
      title: "Pages",
      description: `${pages.length} total · ${publishedPages} published`,
      href: `${siteBase}/pages`,
      icon: FileStack,
    },
    {
      title: "Layout",
      description: "Header, footer, and navigation",
      href: `${siteBase}/layout`,
      icon: LayoutTemplate,
    },
    {
      title: "Blog posts",
      description: `${posts.length} posts · ${publishedPosts} published`,
      href: `${siteBase}/content`,
      icon: FileText,
    },
    {
      title: "Settings",
      description: "Home page, domains, SEO",
      href: `${siteBase}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-foreground text-2xl font-semibold tracking-tight">
              {site.name}
            </h1>
            {site.isDefault ? <Badge variant="secondary">Default</Badge> : null}
          </div>
          <p className="text-muted-foreground text-sm">
            /{site.slug}
            {draftPages > 0 ? ` · ${draftPages} draft page${draftPages === 1 ? "" : "s"}` : null}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={liveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 size-4" />
            View live site
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="bg-card hover:bg-accent/30 rounded-xl border p-4 transition-colors"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="text-muted-foreground size-4" />
                <p className="font-medium">{item.title}</p>
              </div>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-5" />
              <h2 className="text-lg font-medium">Recent posts</h2>
            </div>
            {canCreate ? (
              <NewPostButton
                variant="outline"
                size="sm"
                workspace={workspace}
                siteId={site.id}
                sites={[
                  {
                    id: site.id,
                    name: site.name,
                    slug: site.slug,
                    isDefault: site.isDefault,
                    updatedAt: site.updatedAt,
                  },
                ]}
              />
            ) : null}
          </div>
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No blog posts for this site yet.</p>
          ) : (
            <ul className="space-y-2">
              {posts.slice(0, 5).map((post) => (
                <li
                  key={post.id}
                  className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="truncate font-medium">{post.title}</span>
                  <span className="text-muted-foreground shrink-0 text-xs capitalize">
                    {post.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {posts.length > 0 ? (
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href={`${siteBase}/content`}>View all posts</Link>
            </Button>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileImage className="text-muted-foreground size-5" />
              <h2 className="text-lg font-medium">Recent media</h2>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`${siteBase}/files`}>Open file manager</Link>
            </Button>
          </div>
          {recentMedia.length === 0 ? (
            <p className="text-muted-foreground text-sm">No media uploaded for this site yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentMedia.map((item) => (
                <li
                  key={item.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="truncate">{item.filename}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Pages</h2>
        {pages.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pages yet.</p>
        ) : (
          <ul className="space-y-2">
            {pages.slice(0, 6).map((page) => (
              <li
                key={page.id}
                className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="truncate">{page.title}</span>
                <span className="text-muted-foreground shrink-0 text-xs capitalize">
                  {page.status}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href={`${siteBase}/pages`}>Manage pages</Link>
        </Button>
      </section>
    </div>
  );
}
