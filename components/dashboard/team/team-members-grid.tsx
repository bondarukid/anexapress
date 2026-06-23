"use client";

import { MembersGrid } from "@/components/members";
import { MemberActionsMenu } from "@/components/dashboard/team/member-actions-menu";
import { toMemberDisplayItem } from "@/lib/team/to-member-display";
import {
  canLeaveWorkspace,
  canManageOtherMemberRole,
  canRemoveOtherMember,
  canTransferWorkspaceOwnership,
  shouldShowActiveMemberMenu,
} from "@/lib/team/permissions";
import type { TeamMembersListProps } from "@/types/team";

export function TeamMembersGrid({
  members,
  currentUserId,
  canManageAccess,
  canManageVisibility = false,
  isChildWorkspace = false,
  disabled = false,
  onRequestRemoval,
  onManageAccess,
  onTransferOwnership,
}: TeamMembersListProps) {
  const memberById = new Map(members.map((member) => [member.membershipId, member]));

  return (
    <MembersGrid
      items={members.map(toMemberDisplayItem)}
      renderCardMenu={(item) => {
        const member = memberById.get(item.id);
        if (!member) return null;

        const target = { userId: member.userId, isOwner: member.isOwner };
        if (
          !shouldShowActiveMemberMenu(target, currentUserId, canManageAccess, {
            isChildWorkspace,
            canManageVisibility,
          })
        ) {
          return null;
        }

        const showLeave = canLeaveWorkspace(target, currentUserId);
        const showRemove = canRemoveOtherMember(canManageAccess, target, currentUserId);

        return (
          <MemberActionsMenu
            disabled={disabled}
            removeLabel={showLeave ? "Leave workspace" : "Remove"}
            onManageAccess={
              onManageAccess ? () => onManageAccess(member.membershipId) : undefined
            }
            onTransferOwnership={
              canTransferWorkspaceOwnership(target, currentUserId)
                ? onTransferOwnership
                : undefined
            }
            onRemove={
              showLeave
                ? () => onRequestRemoval("leave", member)
                : showRemove
                  ? () => onRequestRemoval("remove", member)
                  : undefined
            }
          />
        );
      }}
    />
  );
}
