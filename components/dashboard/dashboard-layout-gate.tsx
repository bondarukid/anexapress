"use client";

import type { ReactNode } from "react";

import { DashboardProviders } from "@/components/dashboard/dashboard-providers";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { WorkspaceAccessPermissions } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";
import type { UserProfile } from "@/types/user";

type DashboardLayoutGateProps = {
  user: UserProfile;
  workspaces: WorkspaceSummary[];
  activeSlug?: string | null;
  initialUnreadCount?: number;
  showOnboarding?: boolean;
  skipWorkspaceOnboarding?: boolean;
  configureWorkspace?: WorkspaceSummary | null;
  workspaceAccess?: WorkspaceAccessPermissions;
  children: ReactNode;
};

/**
 * Wraps all dashboard routes in shared providers and workspace shell.
 */
export function DashboardLayoutGate({
  user,
  workspaces,
  activeSlug,
  initialUnreadCount,
  showOnboarding,
  skipWorkspaceOnboarding,
  configureWorkspace,
  workspaceAccess,
  children,
}: DashboardLayoutGateProps) {
  return (
    <DashboardProviders
      user={user}
      workspaces={workspaces}
      activeSlug={activeSlug}
      initialUnreadCount={initialUnreadCount}
      showOnboarding={showOnboarding}
      skipWorkspaceOnboarding={skipWorkspaceOnboarding}
      configureWorkspace={configureWorkspace}
      workspaceAccess={workspaceAccess}
    >
      <DashboardShell user={user}>{children}</DashboardShell>
    </DashboardProviders>
  );
}
