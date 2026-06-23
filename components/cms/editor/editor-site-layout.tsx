import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { SiteDashboardProvider } from "@/components/providers/site-dashboard-provider";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { getSiteById } from "@/services/site.service";
import { getCurrentUser } from "@/services/user";

type EditorSiteLayoutProps = {
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
  children: ReactNode;
};

/**
 * Site context for standalone editor routes under `/editor/site/[siteId]/...`.
 */
export async function EditorSiteLayout({ params, children }: EditorSiteLayoutProps) {
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
