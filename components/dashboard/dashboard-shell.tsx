"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { AppSiteSidebar } from "@/components/dashboard/sidebar/app-site-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { useResolvedSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { isSiteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import type { UserProfile } from "@/types/user";
import type { CSSProperties, ReactNode } from "react";

type DashboardShellProps = {
  user: UserProfile;
  children: ReactNode;
};

/**
 * Workspace dashboard chrome: sidebar + shared header.
 * Switches to site sidebar when pathname is under `/dashboard/sites/[siteId]/...`.
 */
export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const isSiteContext = isSiteDashboardPath(pathname);
  const siteDashboard = useResolvedSiteDashboard();
  const showSiteSidebar = isSiteContext && siteDashboard !== null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      {showSiteSidebar ? (
        <AppSiteSidebar variant="inset" user={user} />
      ) : (
        <AppSidebar variant="inset" user={user} />
      )}
      <SidebarInset>
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
