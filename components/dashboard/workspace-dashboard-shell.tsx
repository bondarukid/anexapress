import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

import { DashboardLayoutGate } from "@/components/dashboard/dashboard-layout-gate";
import { resolveDashboardEntryRedirect } from "@/lib/routing/resolve-dashboard-entry-redirect";
import { workspacePath } from "@/lib/routing/workspace-paths";
import { shouldSkipPersonalWorkspaceCreation } from "@/lib/onboarding/should-skip-personal-workspace";
import { shouldSkipWorkspaceStep } from "@/lib/onboarding/should-skip-workspace-step";
import { getUnreadNotificationCount } from "@/services/notifications";
import { getWorkspaceAccessPermissions } from "@/services/team";
import { getCurrentUser } from "@/services/user";
import {
  ensurePersonalWorkspace,
  getUserWorkspaces,
  resolveWorkspacePath,
  resolveDefaultWorkspace,
} from "@/services/workspace";
import { DASHBOARD_ENTRY_PATH } from "@/lib/routing/workspace-paths";
import { ACTIVE_WORKSPACE_SLUG_COOKIE } from "@/types/workspace";

type WorkspaceDashboardShellProps = {
  parentSlug: string;
  childSlug?: string | null;
  children: ReactNode;
};

function failWorkspaceLoad(): never {
  throw new Error("Failed to load workspaces. Please refresh the page.");
}

/**
 * Shared tenant dashboard shell for root and child workspace routes.
 */
export async function WorkspaceDashboardShell({
  parentSlug,
  childSlug,
  children,
}: WorkspaceDashboardShellProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let workspaceResult = await getUserWorkspaces(user.id);
  if (!workspaceResult.success) {
    failWorkspaceLoad();
  }

  let workspaces = workspaceResult.workspaces;

  if (workspaces.length === 0) {
    const skipPersonal = await shouldSkipPersonalWorkspaceCreation(user.email);
    if (skipPersonal) {
      const target = await resolveDashboardEntryRedirect({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        pathname: DASHBOARD_ENTRY_PATH,
      });
      const tenantHome = workspacePath({
        parentSlug,
        childSlug,
      });
      if (target && target !== tenantHome) {
        redirect(target);
      }
      if (!target) {
        redirect("/login");
      }
      workspaceResult = await getUserWorkspaces(user.id);
      if (!workspaceResult.success) {
        failWorkspaceLoad();
      }
      workspaces = workspaceResult.workspaces;
      if (workspaces.length === 0) {
        redirect("/login");
      }
    } else {
      const ensured = await ensurePersonalWorkspace(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
      });

      if (!ensured.success) {
        failWorkspaceLoad();
      }

      workspaceResult = await getUserWorkspaces(user.id);
      if (!workspaceResult.success) {
        failWorkspaceLoad();
      }
      workspaces = workspaceResult.workspaces;
    }
  }

  const activeWorkspace = await resolveWorkspacePath({
    parentSlug,
    childSlug,
    userId: user.id,
  });

  if (!activeWorkspace) {
    notFound();
  }

  const cookieStore = await cookies();
  const cookieSlug = cookieStore.get(ACTIVE_WORKSPACE_SLUG_COOKIE)?.value;
  const defaultWorkspace = resolveDefaultWorkspace(workspaces, cookieSlug);
  const skipWorkspaceOnboarding = await shouldSkipWorkspaceStep(user.email);
  const showOnboarding = !user.onboardingCompletedAt;

  const [unreadCount, workspaceAccess] = await Promise.all([
    getUnreadNotificationCount(user.id, user.email),
    getWorkspaceAccessPermissions(activeWorkspace.id),
  ]);

  return (
    <DashboardLayoutGate
      user={user}
      workspaces={workspaces}
      activeSlug={activeWorkspace.pathKey ?? activeWorkspace.slug}
      workspaceAccess={workspaceAccess}
      initialUnreadCount={unreadCount}
      showOnboarding={showOnboarding}
      skipWorkspaceOnboarding={skipWorkspaceOnboarding}
      configureWorkspace={skipWorkspaceOnboarding ? null : activeWorkspace}
    >
      {children}
    </DashboardLayoutGate>
  );
}
