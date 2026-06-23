"use client";

import type { ReactNode } from "react";

import { OnboardingGate } from "@/components/dashboard/onboarding/onboarding-gate";
import { DashboardSitesProvider } from "@/components/providers/dashboard-sites-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import type { SiteSummary } from "@/types/site";
import type { WorkspaceAccessPermissions } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";
import type { UserProfile } from "@/types/user";

export type DashboardProvidersProps = {
  user: UserProfile;
  workspaces: WorkspaceSummary[];
  sites?: SiteSummary[];
  activeSlug?: string | null;
  initialUnreadCount?: number;
  showOnboarding?: boolean;
  skipWorkspaceOnboarding?: boolean;
  configureWorkspace?: WorkspaceSummary | null;
  workspaceAccess?: WorkspaceAccessPermissions;
  children: ReactNode;
};

/**
 * Shared workspace + notifications context for all dashboard routes
 * (workspace shell).
 */
export function DashboardProviders({
  user,
  workspaces,
  sites = [],
  activeSlug,
  initialUnreadCount = 0,
  showOnboarding = false,
  skipWorkspaceOnboarding = false,
  configureWorkspace = null,
  workspaceAccess,
  children,
}: DashboardProvidersProps) {
  return (
    <WorkspaceProvider
      initialWorkspaces={workspaces}
      initialActiveSlug={activeSlug}
      initialWorkspaceAccess={workspaceAccess}
    >
      <DashboardSitesProvider sites={sites}>
        <NotificationsProvider
          userId={user.id}
          userEmail={user.email}
          initialUnreadCount={initialUnreadCount}
        >
          {children}
          {showOnboarding ? (
            <OnboardingGate
              user={user}
              skipWorkspaceStep={skipWorkspaceOnboarding}
              configureWorkspace={configureWorkspace}
            />
          ) : null}
        </NotificationsProvider>
      </DashboardSitesProvider>
    </WorkspaceProvider>
  );
}
