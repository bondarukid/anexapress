import { TeamManagementSkeleton } from "@/components/dashboard/team/team-management-skeleton";
import { TeamPageShell } from "@/components/dashboard/team/team-page-shell";
import { resolveTeamSkeletonShowInviteButton, teamSkeletonDescription } from "@/lib/team/skeleton";

export default async function TeamSettingsLoading() {
  const showInviteButton = await resolveTeamSkeletonShowInviteButton();

  return (
    <TeamPageShell>
      <TeamManagementSkeleton
        showInviteButton={showInviteButton}
        description={teamSkeletonDescription(showInviteButton)}
      />
    </TeamPageShell>
  );
}
