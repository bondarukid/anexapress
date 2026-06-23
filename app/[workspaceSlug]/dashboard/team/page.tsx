import { Suspense } from "react";
import { notFound } from "next/navigation";

import { TeamManagement } from "@/components/dashboard/team/team-management";
import { TeamManagementSkeleton } from "@/components/dashboard/team/team-management-skeleton";
import { TeamPageShell } from "@/components/dashboard/team/team-page-shell";
import { canManageWorkspaceMembers } from "@/lib/team/permissions";
import { resolveWorkspaceFromRoute, workspacePathFromSummary } from "@/lib/dashboard/workspace-route";
import { teamSkeletonDescription } from "@/lib/team/skeleton";
import { getTeamMemberPermissions, getTeamPageData, getWorkspaceAccessPermissions } from "@/services/team";
import { getCurrentUser } from "@/services/user";
import { getPendingWorkspaceTransfer } from "@/services/workspace-transfer";
import type { WorkspaceSummary } from "@/types/workspace";

export const metadata = {
  title: "Team Settings",
  description: "Manage workspace team members and invitations.",
};

type TeamRouteParams = { workspaceSlug: string; childSlug?: string };

type TeamSettingsPageProps = {
  params: Promise<TeamRouteParams>;
};

type TeamManagementLoaderProps = {
  workspace: WorkspaceSummary;
  userId: string;
  canManageVisibility: boolean;
};

async function TeamManagementLoader({
  workspace,
  userId,
  canManageVisibility,
}: TeamManagementLoaderProps) {
  const [teamData, pendingTransfer] = await Promise.all([
    getTeamPageData(workspace.id, workspace.isChild ? false : true),
    getPendingWorkspaceTransfer(workspace.id),
  ]);
  if (!teamData) {
    notFound();
  }

  return (
    <TeamManagement
      initialData={teamData}
      workspace={workspace}
      userId={userId}
      canManageVisibility={canManageVisibility}
      initialPendingTransfer={pendingTransfer}
    />
  );
}

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) {
    notFound();
  }

  const permissions = await getTeamMemberPermissions(workspace.id);
  const workspaceAccess = await getWorkspaceAccessPermissions(workspace.id);
  const canManage = canManageWorkspaceMembers(permissions);

  return (
    <TeamPageShell>
      <Suspense
        fallback={
          <TeamManagementSkeleton
            showInviteButton={canManage}
            description={teamSkeletonDescription(canManage)}
          />
        }
      >
        <TeamManagementLoader
          workspace={workspace}
          userId={user.id}
          canManageVisibility={workspaceAccess.canManageVisibility}
        />
      </Suspense>
    </TeamPageShell>
  );
}
