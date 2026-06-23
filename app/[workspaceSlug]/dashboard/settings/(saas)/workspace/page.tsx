import { notFound, redirect } from "next/navigation";

import { WorkspaceGeneralSettings } from "@/components/dashboard/settings/workspace";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { getTeamPageData, getWorkspaceAccessPermissions } from "@/services/team";
import { getCurrentUser } from "@/services/user";
import { getPendingWorkspaceTransfer } from "@/services/workspace-transfer";

export const metadata = {
  title: "General Settings",
  description: "Manage workspace identity, branding, and security controls.",
};

type SettingsGeneralPageProps = {
  params: Promise<{ workspaceSlug: string; childSlug?: string }>;
};

export default async function SettingsGeneralPage({ params }: SettingsGeneralPageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) {
    notFound();
  }

  const [teamData, pendingTransfer, workspaceAccess] = await Promise.all([
    getTeamPageData(workspace.id),
    getPendingWorkspaceTransfer(workspace.id),
    getWorkspaceAccessPermissions(workspace.id),
  ]);

  if (!teamData) {
    notFound();
  }

  return (
    <WorkspaceGeneralSettings
      workspace={workspace}
      workspaceAccess={workspaceAccess}
      currentUserId={user.id}
      members={teamData.members}
      activeMemberCount={teamData.members.length}
      pendingTransfer={pendingTransfer}
    />
  );
}
