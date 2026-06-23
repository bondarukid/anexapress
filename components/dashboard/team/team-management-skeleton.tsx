import { TeamManagementHeaderSkeleton } from "@/components/dashboard/team/team-management-header-skeleton";
import { TeamMembersListSkeleton } from "@/components/dashboard/team/team-members-list-skeleton";
import { TEAM_MEMBERS_SKELETON_ROW_COUNT } from "@/lib/team/constants";

type TeamManagementSkeletonProps = {
  showInviteButton?: boolean;
  description?: string;
  memberCount?: number;
};

export function TeamManagementSkeleton({
  showInviteButton = false,
  description,
  memberCount = TEAM_MEMBERS_SKELETON_ROW_COUNT,
}: TeamManagementSkeletonProps) {
  return (
    <>
      <TeamManagementHeaderSkeleton showInviteButton={showInviteButton} description={description} />
      <TeamMembersListSkeleton count={memberCount} />
    </>
  );
}
