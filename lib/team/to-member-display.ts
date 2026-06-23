import type { MemberDisplayItem } from "@/types/member-display";
import type { TeamActiveMember } from "@/types/team";

/**
 * Maps a workspace team member to a generic display item for grid/list views.
 */
export function toMemberDisplayItem(member: TeamActiveMember): MemberDisplayItem {
  return {
    id: member.membershipId,
    name: member.name,
    subtitle: member.email,
    avatarUrl: member.avatarUrl,
    verified: member.isOwner,
    badges: [{ id: `role-${member.roleId}`, label: member.roleLabel }],
  };
}
