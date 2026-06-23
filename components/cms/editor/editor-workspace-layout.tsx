import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { DashboardProviders } from "@/components/dashboard/dashboard-providers";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { shouldSkipWorkspaceStep } from "@/lib/onboarding/should-skip-workspace-step";
import { getWorkspaceAccessPermissions } from "@/services/team";
import { getCurrentUser } from "@/services/user";
import {
  ensurePersonalWorkspace,
  getUserWorkspaces,
  resolveWorkspacePath,
} from "@/services/workspace";
import { listSites } from "@/services/site.service";

type EditorWorkspaceLayoutProps = {
  parentSlug: string;
  childSlug?: string | null;
  children: ReactNode;
};

function failWorkspaceLoad(): never {
  throw new Error("Failed to load workspaces. Please refresh the page.");
}

/**
 * Minimal workspace providers for standalone CMS editor routes (no dashboard shell).
 */
export async function EditorWorkspaceLayout({
  parentSlug,
  childSlug = null,
  children,
}: EditorWorkspaceLayoutProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let workspaceResult = await getUserWorkspaces(user.id);
  if (!workspaceResult.success) {
    failWorkspaceLoad();
  }

  let workspaces = workspaceResult.workspaces;

  if (workspaces.length === 0) {
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

  const activeWorkspace = await resolveWorkspacePath({
    parentSlug,
    childSlug,
    userId: user.id,
  });

  if (!activeWorkspace) {
    notFound();
  }

  const [workspaceAccess, sites] = await Promise.all([
    getWorkspaceAccessPermissions(activeWorkspace.id),
    listSites(activeWorkspace.id),
  ]);

  const skipWorkspaceOnboarding = await shouldSkipWorkspaceStep(user.email);

  return (
    <DashboardProviders
      user={user}
      workspaces={workspaces}
      activeSlug={activeWorkspace.pathKey ?? activeWorkspace.slug}
      workspaceAccess={workspaceAccess}
      sites={sites}
      showOnboarding={false}
      skipWorkspaceOnboarding={skipWorkspaceOnboarding}
      configureWorkspace={null}
    >
      {children}
    </DashboardProviders>
  );
}
