"use client";

/**
 * Stick header used inside `SidebarInset` (dashboard shell).
 */

import { usePathname, useRouter } from "next/navigation";
import { LanguagesIcon } from "lucide-react";

import LanguageDropdown from "@/components/dashboard/dropdown-language";
import { NotificationButton } from "@/components/dashboard/notification-button";
import { useNotificationsContext } from "@/components/providers/notifications-provider";
import { useResolvedSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  isSiteDashboardPath,
  parseSiteDashboardPath,
  siteDashboardSectionTitle,
} from "@/lib/routing/site-dashboard-paths";
import {
  isDashboardHomePath,
  isSitesListPath,
  isTeamPath,
  settingsLeafFromPathname,
  workspacePath,
} from "@/lib/routing/workspace-paths";

function headingForPathname(pathname: string, siteName?: string): string {
  if (isSiteDashboardPath(pathname)) {
    const parsed = parseSiteDashboardPath(pathname);
    const section = parsed ? siteDashboardSectionTitle(parsed.section) : "Site";
    return siteName ? `${siteName} · ${section}` : section;
  }

  if (isDashboardHomePath(pathname)) return "Dashboard";
  if (isSitesListPath(pathname)) return "Sites";

  const leaf = settingsLeafFromPathname(pathname);
  if (leaf === "workspace") return "Workspace settings";

  if (pathname.includes("/dashboard/settings")) {
    return "Personal settings";
  }

  if (pathname.includes("/dashboard/mail")) {
    return "Notifications";
  }

  if (isTeamPath(pathname)) return "Members";

  return "Dashboard";
}

export type SiteHeaderProps = {
  title?: string;
};

export function SiteHeader({ title: titleOverride }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeWorkspace, workspaces } = useWorkspace();
  const siteDashboard = useResolvedSiteDashboard();
  const { unreadCount } = useNotificationsContext();
  const title =
    titleOverride ?? headingForPathname(pathname, siteDashboard?.activeSite.name);

  function handleNotificationsClick() {
    const slug = activeWorkspace?.slug ?? workspaces[0]?.slug;
    if (!slug) return;
    router.push(workspacePath(slug, "/mail"));
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{title}</h1>

        <div className="ml-auto flex items-center gap-1.5">
          <LanguageDropdown
            trigger={
              <Button variant="ghost" size="icon-lg">
                <LanguagesIcon />
              </Button>
            }
          />

          <NotificationButton
            hasNotifications={unreadCount > 0}
            onClick={handleNotificationsClick}
          />
        </div>
      </div>
    </header>
  );
}
