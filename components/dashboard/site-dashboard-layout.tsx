import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { SiteDashboardProvider } from "@/components/providers/site-dashboard-provider";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { siteDashboardPath, parseSiteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { getSiteAccessibleToUser, getSiteById } from "@/services/site.service";
import { getCurrentUser } from "@/services/user";

type SiteDashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; siteId: string; slug?: string }>;
};

function workspacePathInputFromResolved(
  workspace: NonNullable<Awaited<ReturnType<typeof resolveWorkspaceFromRoute>>>,
) {
  return workspace.isChild && workspace.parentSlug
    ? { parentSlug: workspace.parentSlug, childSlug: workspace.slug }
    : workspace.slug;
}

function siteSectionSuffixFromPathname(pathname: string, siteId: string): string {
  const parsed = parseSiteDashboardPath(pathname);
  if (!parsed || parsed.siteId !== siteId) return "/overview";
  if (parsed.section === "unknown") return "/overview";
  if (parsed.section === "overview") return "/overview";
  if (parsed.section === "files") return "/files";
  return parsed.restPath || `/${parsed.section}`;
}

/**
 * Wraps all `/dashboard/sites/[siteId]/*` routes with site context.
 */
export async function SiteDashboardLayout({ children, params }: SiteDashboardLayoutProps) {
  const routeParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) notFound();

  let site = await getSiteById(workspace.id, routeParams.siteId);

  if (!site) {
    const accessible = await getSiteAccessibleToUser(user.id, routeParams.siteId);
    if (accessible) {
      const headerStore = await headers();
      const pathname = headerStore.get("x-pathname") ?? "";
      const sectionSuffix = siteSectionSuffixFromPathname(pathname, routeParams.siteId);
      redirect(
        siteDashboardPath(
          workspacePathInputFromResolved(accessible.workspace),
          accessible.site.id,
          sectionSuffix,
        ),
      );
    }
    notFound();
  }

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
    siteDashboardPath(workspacePathInputFromResolved(workspace), routeParams.siteId, "/overview"),
  );
}
