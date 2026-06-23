import * as React from "react";

import { TeamMemberRow } from "@/components/dashboard/team/team-member-row";
import {
  canChangeMemberVisibility,
  canLeaveWorkspace,
  canManageOtherMemberRole,
  canOpenSelfVisibilityMenu,
  canRemoveOtherMember,
} from "@/lib/team/permissions";
import type { TeamMembersListProps } from "@/types/team";
import { Separator } from "@/components/ui/separator";

export function TeamMembersList({
  members,
  currentUserId,
  canManageAccess,
  canManageVisibility = false,
  isChildWorkspace = false,
  showWorkspaceColumn = false,
  disabled = false,
  onRequestRemoval,
  onManageAccess,
  onTransferOwnership,
}: TeamMembersListProps) {
  return (
    <div>
      {members.map((member, index) => {
        const target = { userId: member.userId, isOwner: member.isOwner };
        const isSelf = member.userId === currentUserId;
        const showLeave = canLeaveWorkspace(target, currentUserId);
        const showRemove = canRemoveOtherMember(canManageAccess, target, currentUserId);
        const showManage = canManageOtherMemberRole(canManageAccess, target, currentUserId);
        const showSelfVisibility = canOpenSelfVisibilityMenu(isChildWorkspace, target, currentUserId);
        const showOtherVisibility = canChangeMemberVisibility(
          canManageVisibility,
          target,
          currentUserId,
        );
        const canOpenMenu =
          showManage || showSelfVisibility || showOtherVisibility || showLeave || showRemove;

        return (
          <React.Fragment key={member.membershipId}>
            <TeamMemberRow
              variant="active"
              name={member.name}
              email={member.email}
              userId={member.userId}
              roleLabel={member.roleLabel}
              workspaceName={showWorkspaceColumn ? member.workspaceName : undefined}
              isOwner={member.isOwner}
              verified={member.isOwner}
              avatarUrl={member.avatarUrl}
              currentUserId={currentUserId}
              canManageAccess={canManageAccess}
              disabled={disabled}
              onRequestLeave={
                showLeave ? () => onRequestRemoval("leave", member) : undefined
              }
              onRequestRemove={
                showRemove ? () => onRequestRemoval("remove", member) : undefined
              }
              onManageAccess={
                canOpenMenu && onManageAccess
                  ? () => onManageAccess(member.membershipId)
                  : undefined
              }
              onTransferOwnership={
                isSelf && member.isOwner ? onTransferOwnership : undefined
              }
            />
            {index < members.length - 1 && <Separator className="my-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
