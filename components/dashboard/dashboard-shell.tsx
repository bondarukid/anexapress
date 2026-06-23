import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserProfile } from "@/types/user";

type DashboardShellProps = {
  user: UserProfile;
  children: ReactNode;
};

/**
 * Workspace dashboard chrome: sidebar + shared header.
 * Expects `DashboardProviders` above in the tree.
 */
export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
