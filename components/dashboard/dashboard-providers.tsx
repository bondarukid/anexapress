"use client";

import type { ReactNode } from "react";

import { OnboardingGate } from "@/components/dashboard/onboarding/onboarding-gate";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import type { WorkspaceAccessPermissions } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";
import type { UserProfile } from "@/types/user";

export type DashboardProvidersProps = {
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
 * Shared workspace + notifications context for all dashboard routes
 * (workspace shell).
 */
export function DashboardProviders({
  user,
  workspaces,
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
    </WorkspaceProvider>
  );
}
