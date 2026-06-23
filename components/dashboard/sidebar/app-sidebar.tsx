"use client";

/**
 * Dashboard primary sidebar (`AppSidebar`).
 *
 * Workspace-level navigation: overview, sites list, members, workspace settings.
 * Site-specific editing lives in `AppSiteSidebar` under `/dashboard/sites/[siteId]/...`.
 */

import * as React from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Globe, LayoutDashboard, PanelsTopLeft, UsersIcon } from "lucide-react";

import { NavMain } from "@/components/dashboard/sidebar/nav-main";
import { NavUser } from "@/components/dashboard/sidebar/nav-user";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { TeamSwitcher } from "@/components/dashboard/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useDashboardSites } from "@/components/providers/dashboard-sites-provider";
import {
  isDashboardHomePath,
  isSaasSettingsPath,
  isSitesListPath,
  isTeamPath,
  workspacePathFromSummary,
} from "@/lib/routing/workspace-paths";
import { siteDashboardPath as buildSiteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import { UserProfile } from "@/types/user";

/** Lazily merges nav + SaaS accordion open-state derived from pathname */
function useNavMainBlocks(pathname: string) {
  const { activeWorkspace } = useWorkspace();
  const { sites: workspaceSites } = useDashboardSites();

  if (!activeWorkspace) {
    return [];
  }

  const appRoutesOpen = isSaasSettingsPath(pathname);
  const teamActive = isTeamPath(pathname);
  const dashboardActive = isDashboardHomePath(pathname);
  const sitesListActive = isSitesListPath(pathname);
  const sitesNavActive = sitesListActive || pathname.includes("/dashboard/sites/");
  const settingsBase = workspacePathFromSummary(activeWorkspace, "/settings");
  const teamUrl = workspacePathFromSummary(activeWorkspace, "/team");
  const dashboardUrl = workspacePathFromSummary(activeWorkspace, "");
  const sitesUrl = workspacePathFromSummary(activeWorkspace, "/sites");

  const workspacePathInput =
    activeWorkspace.isChild && activeWorkspace.parentSlug
      ? { parentSlug: activeWorkspace.parentSlug, childSlug: activeWorkspace.slug }
      : activeWorkspace.slug;

  const siteItems = useMemo(
    () => [
      ...workspaceSites.map((site) => ({
        title: site.name,
        url: buildSiteDashboardPath(workspacePathInput, site.id, "/overview"),
      })),
      ...(workspaceSites.length > 0
        ? [{ title: "View all sites", url: sitesUrl }]
        : [{ title: "Manage sites", url: sitesUrl }]),
    ],
    [sitesUrl, workspacePathInput, workspaceSites],
  );

  const appSettingsItems = useMemo(
    () => [{ title: "General", url: `${settingsBase}/workspace` }],
    [settingsBase],
  );

  return useMemo(
    () => [
      {
        title: "Dashboard",
        url: dashboardUrl,
        icon: <LayoutDashboard />,
        isActive: dashboardActive,
      },
      {
        title: "Sites",
        url: sitesUrl,
        icon: <Globe />,
        isActive: sitesNavActive,
        items: siteItems,
      },
      {
        title: "Members",
        url: teamUrl,
        icon: <UsersIcon />,
        isActive: teamActive,
      },
      {
        title: "Workspace settings",
        url: "#",
        icon: <PanelsTopLeft />,
        isActive: appRoutesOpen,
        items: appSettingsItems,
      },
    ],
    [
      appRoutesOpen,
      appSettingsItems,
      dashboardActive,
      dashboardUrl,
      siteItems,
      sitesNavActive,
      sitesListActive,
      sitesUrl,
      teamActive,
      teamUrl,
    ],
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserProfile;
}

export function AppSidebar({ user, className, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const navMain = useNavMainBlocks(pathname);

  return (
    <Sidebar collapsible="icon" className={className} {...props}>
      <SidebarHeader className="h-(--header-height) justify-center gap-0 px-2 py-0">
        <TeamSwitcher
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          user={user}
          onWorkspaceChange={setActiveWorkspace}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser initialUser={user} workspaceSlug={activeWorkspace?.slug} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
