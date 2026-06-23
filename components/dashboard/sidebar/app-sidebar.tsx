"use client";

/**
 * Dashboard primary sidebar (`AppSidebar`).
 *
 * **SaaS / tenant screens** (`workspace`) are reachable from sidebar
 * under the collapsible **Workspace settings** root (not linked from the footer profile menu).
 * `DashboardSettingsShell` renders underline tabs inside the SaaS subtree as well.
 *
 * Personal settings stay reachable via **NavUser** (footer) under `/{slug}/dashboard/settings/...`.
 */

import * as React from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

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
import { isSaasSettingsPath, isTeamPath, workspacePath } from "@/lib/routing/workspace-paths";
import { ENABLE_MULTI_SITE } from "@/lib/config/feature-flags";
import { FileText, PanelsTopLeft, UsersIcon } from "lucide-react";
import { UserProfile } from "@/types/user";

/** Lazily merges demo nav + SaaS accordion open-state derived from pathname */
function useNavMainBlocks(pathname: string, workspaceSlug: string) {
  const appRoutesOpen = isSaasSettingsPath(pathname);
  const teamActive = isTeamPath(pathname);
  const contentActive = pathname.includes("/dashboard/content");
  const sitesActive = pathname.includes("/dashboard/sites");
  const mediaActive = pathname.includes("/dashboard/media");
  const settingsBase = workspacePath(workspaceSlug, "/settings");
  const teamUrl = workspacePath(workspaceSlug, "/team");
  const contentUrl = workspacePath(workspaceSlug, "/content");
  const sitesUrl = workspacePath(workspaceSlug, "/sites");

  const appSettingsItems = useMemo(
    () => [{ title: "General", url: `${settingsBase}/workspace` }],
    [settingsBase],
  );

  return useMemo(
    () => [
      {
        title: "Content",
        url: contentUrl,
        icon: <FileText />,
        isActive: contentActive || sitesActive || mediaActive,
        items: [
          { title: ENABLE_MULTI_SITE ? "Sites" : "Site", url: sitesUrl },
          { title: "Blog posts", url: contentUrl },
          { title: "Media", url: workspacePath(workspaceSlug, "/media") },
        ],
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
    [appRoutesOpen, appSettingsItems, contentActive, contentUrl, mediaActive, sitesActive, sitesUrl, teamActive, teamUrl],
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserProfile;
}

export function AppSidebar({ user, className, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const workspaceSlug = activeWorkspace?.slug ?? workspaces[0]?.slug ?? "";
  const navMain = useNavMainBlocks(pathname, workspaceSlug);

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
