import { notFound, redirect } from "next/navigation";

import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { siteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { listSites } from "@/services/site.service";

type WorkspaceRouteParams = {
  workspaceSlug: string;
  slug?: string;
};

/**
 * Redirects legacy workspace-level CMS routes to the default site's dashboard section.
 */
export async function redirectToDefaultSiteSection(
  routeParams: WorkspaceRouteParams,
  userId: string,
  section: "/content" | "/media" | "/files" | "/pages",
): Promise<never> {
  const workspace = await resolveWorkspaceFromRoute(routeParams, userId);
  if (!workspace) notFound();

  const sites = await listSites(workspace.id);
  const defaultSite = sites.find((s) => s.isDefault) ?? sites[0];
  if (!defaultSite) {
    redirect(
      workspace.isChild && workspace.parentSlug
        ? `/${workspace.parentSlug}/${workspace.slug}/dashboard/sites`
        : `/${workspace.slug}/dashboard/sites`,
    );
  }

  const pathInput =
    workspace.isChild && workspace.parentSlug
      ? { parentSlug: workspace.parentSlug, childSlug: workspace.slug }
      : workspace.slug;

  redirect(siteDashboardPath(pathInput, defaultSite.id, section));
}
