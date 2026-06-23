import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileImage, FileText, Globe, Plus, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ENABLE_MULTI_SITE } from "@/lib/config/feature-flags";
import { siteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { canCreateContent } from "@/lib/team/permissions";
import { listMediaFiles } from "@/services/media.service";
import { listPosts } from "@/services/post.service";
import { listSites } from "@/services/site.service";
import type { WorkspaceAccessPermissions } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";

type WorkspaceOverviewProps = {
  workspace: WorkspaceSummary;
  workspaceAccess: WorkspaceAccessPermissions;
};

/**
 * Workspace dashboard home — cross-site overview with links into site dashboards.
 */
export async function WorkspaceOverview({
  workspace,
  workspaceAccess,
}: WorkspaceOverviewProps) {
  const pathInput =
    workspace.isChild && workspace.parentSlug
      ? { parentSlug: workspace.parentSlug, childSlug: workspace.slug }
      : workspace.slug;

  const sites = await listSites(workspace.id);
  const [allPosts, recentMedia] = await Promise.all([
    listPosts(workspace.id),
    listMediaFiles(workspace.id, { limit: 6 }),
  ]);

  const postsBySite = new Map<string, number>();
  for (const post of allPosts) {
    if (post.siteId) {
      postsBySite.set(post.siteId, (postsBySite.get(post.siteId) ?? 0) + 1);
    }
  }

  const teamUrl = workspacePathFromSummary(workspace, "/team");
  const sitesUrl = workspacePathFromSummary(workspace, "/sites");
  const canCreate = canCreateContent(workspaceAccess) && ENABLE_MULTI_SITE;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-foreground text-2xl font-semibold tracking-tight">
          Welcome{workspace.name ? `, ${workspace.name}` : ""}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Overview of your sites, media, and blog content. Open a site from the sidebar or below
          to edit pages, layout, and posts.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="text-muted-foreground size-5" />
            <h2 className="text-lg font-medium">Sites</h2>
          </div>
          {canCreate ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={sitesUrl}>
                <Plus className="mr-2 size-4" />
                New site
              </Link>
            </Button>
          ) : null}
        </div>

        {sites.length === 0 ? (
          <div className="border-border rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">No sites yet. Create one to get started.</p>
            <Button className="mt-4" asChild>
              <Link href={sitesUrl}>Manage sites</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sites.map((site) => (
              <Link
                key={site.id}
                href={siteDashboardPath(pathInput, site.id, "/overview")}
                className="bg-card hover:bg-accent/30 flex flex-col gap-3 rounded-xl border p-5 transition-colors"
              >
                <div>
                  <p className="font-medium">{site.name}</p>
                  <p className="text-muted-foreground text-sm">/{site.slug}</p>
                </div>
                <div className="text-muted-foreground flex gap-4 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3.5" />
                    {postsBySite.get(site.id) ?? 0} posts
                  </span>
                  {site.isDefault ? (
                    <span className="bg-muted rounded px-1.5 py-0.5">Default</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileImage className="text-muted-foreground size-5" />
            <h2 className="text-lg font-medium">Recent media</h2>
          </div>
          {recentMedia.length === 0 ? (
            <p className="text-muted-foreground text-sm">No media uploaded yet.</p>
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

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="text-muted-foreground size-5" />
            <h2 className="text-lg font-medium">Workspace</h2>
          </div>
          <div className="grid gap-3">
            <Link
              href={teamUrl}
              className="bg-card hover:bg-accent/30 rounded-xl border p-4 transition-colors"
            >
              <p className="font-medium">Team</p>
              <p className="text-muted-foreground text-sm">Invite members and manage roles.</p>
            </Link>
            <Link
              href={workspacePathFromSummary(workspace, "/settings/workspace")}
              className="bg-card hover:bg-accent/30 rounded-xl border p-4 transition-colors"
            >
              <p className="font-medium">Workspace settings</p>
              <p className="text-muted-foreground text-sm">Name, branding, and general options.</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
