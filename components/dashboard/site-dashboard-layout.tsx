import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { SiteDashboardProvider } from "@/components/providers/site-dashboard-provider";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { siteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { getSiteById } from "@/services/site.service";
import { getCurrentUser } from "@/services/user";

type SiteDashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
};

/**
 * Wraps all `/dashboard/sites/[siteId]/*` routes with site context.
 */
export async function SiteDashboardLayout({ children, params }: SiteDashboardLayoutProps) {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) notFound();

  const site = await getSiteById(workspace.id, routeParams.siteId);
  if (!site) notFound();

  const siteDashboardBase = workspacePathFromSummary(workspace, `/sites/${site.id}`);

  return (
    <SiteDashboardProvider
      activeSite={{
        id: site.id,
        name: site.name,
        slug: site.slug,
        isDefault: site.isDefault,
        updatedAt: site.updatedAt,
      }}
      siteDashboardBase={siteDashboardBase}
    >
      {children}
    </SiteDashboardProvider>
  );
}

/** Redirect bare `/sites/[siteId]` to site overview. */
export async function SiteDashboardIndexRedirect({
  params,
}: {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
}): Promise<never> {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) notFound();

  redirect(
    siteDashboardPath(
      workspace.isChild && workspace.parentSlug
        ? { parentSlug: workspace.parentSlug, childSlug: workspace.slug }
        : workspace.slug,
      routeParams.siteId,
      "/overview",
    ),
  );
}
