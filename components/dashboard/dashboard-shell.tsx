"use client";

import { usePathname } from "next/navigation";

import { EditorBlockSidebar } from "@/components/cms/editor/editor-block-sidebar";
import { EditorChromeProvider } from "@/components/cms/editor/editor-chrome-context";
import { EditorSiteHeader } from "@/components/cms/editor/editor-site-header";
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { AppSiteSidebar } from "@/components/dashboard/sidebar/app-site-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { useResolvedSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { isEditorPath } from "@/lib/routing/editor-paths";
import { isSiteDashboardPath } from "@/lib/routing/site-dashboard-paths";
import type { UserProfile } from "@/types/user";
import type { CSSProperties, ReactNode } from "react";

type DashboardShellProps = {
  user: UserProfile;
  children: ReactNode;
};

/**
 * Workspace dashboard chrome: sidebar + shared header.
 * Editor routes use block outline sidebar and editor header.
 */
export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const isEditor = isEditorPath(pathname);
  const isSiteContext = isSiteDashboardPath(pathname);
  const siteDashboard = useResolvedSiteDashboard();
  const showSiteSidebar = !isEditor && isSiteContext && siteDashboard !== null;

  return (
    <EditorChromeProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
      >
        {isEditor ? (
          <EditorBlockSidebar variant="inset" />
        ) : showSiteSidebar ? (
          <AppSiteSidebar variant="inset" user={user} />
        ) : (
          <AppSidebar variant="inset" user={user} />
        )}
        <SidebarInset className="min-h-svh">
          {isEditor ? <EditorSiteHeader /> : <SiteHeader />}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </EditorChromeProvider>
  );
}
