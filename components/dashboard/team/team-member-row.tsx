"use client";

import { UserIcon } from "lucide-react";

import { MemberActionsMenu } from "@/components/dashboard/team/member-actions-menu";
import { getInitials } from "@/lib/team/data";
import {
  canLeaveWorkspace,
  canManageOtherMemberRole,
  canRemoveOtherMember,
  canTransferWorkspaceOwnership,
  shouldShowActiveMemberMenu,
} from "@/lib/team/permissions";
import { BadgeCheckIcon } from "@/components/dashboard/team/badge-check-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type TeamMemberRowProps = {
  name: string;
  email: string;
  userId: string;
  roleLabel: string;
  workspaceName?: string;
  variant: "active" | "pending";
  isOwner?: boolean;
  verified?: boolean;
  isRegistered?: boolean;
  avatarUrl?: string | null;
  currentUserId: string;
  canManageAccess?: boolean;
  /** Pending invites: invite/revoke (requires members.invite). */
  canManage?: boolean;
  disabled?: boolean;
  onRequestLeave?: () => void;
  onRequestRemove?: () => void;
  onRevoke?: () => void;
  onViewInviteDetails?: () => void;
  onManageAccess?: () => void;
  onTransferOwnership?: () => void;
};

export function TeamMemberRow({
  name,
  email,
  userId,
  roleLabel,
  workspaceName,
  variant,
  isOwner = false,
  verified = false,
  isRegistered = true,
  avatarUrl = null,
  currentUserId,
  canManageAccess = false,
  canManage = false,
  disabled = false,
  onRequestLeave,
  onRequestRemove,
  onRevoke,
  onViewInviteDetails,
  onManageAccess,
  onTransferOwnership,
}: TeamMemberRowProps) {
  const member = { userId, isOwner };
  const isSelf = userId === currentUserId;
  const showActiveMenu =
    variant === "active" &&
    (Boolean(onManageAccess) ||
      shouldShowActiveMemberMenu(member, currentUserId, canManageAccess));
  const showPendingMenu = variant === "pending" && canManage;
  const showMenu = showActiveMenu || showPendingMenu;

  const showManageAccess =
    variant === "active" && canManageOtherMemberRole(canManageAccess, member, currentUserId);
  const showTransfer =
    variant === "active" && canTransferWorkspaceOwnership(member, currentUserId);
  const showLeave = variant === "active" && canLeaveWorkspace(member, currentUserId);
  const showRemove =
    variant === "active" && canRemoveOtherMember(canManageAccess, member, currentUserId);

  const removeLabel = showLeave ? "Leave workspace" : "Remove";
  const removeHandler = showLeave ? onRequestLeave : onRequestRemove;

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-3">
        <div className="relative w-fit">
          <Avatar className="size-9.5">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback
              className={cn("text-sm", variant === "pending" && !isRegistered && "bg-muted text-muted-foreground")}
            >
              {variant === "pending" && !isRegistered ? (
                <UserIcon className="size-4" aria-hidden />
              ) : (
                getInitials(name)
              )}
            </AvatarFallback>
          </Avatar>
          {verified && (
            <span className="absolute -top-1.5 -right-1.5">
              <span className="sr-only">Verified</span>
              <BadgeCheckIcon />
            </span>
          )}
        </div>
        <div className="flex flex-col items-start max-sm:max-w-30">
          <p className="text-sm font-medium">
            {name}
            {isSelf ? <span className="text-muted-foreground font-normal"> (you)</span> : null}
          </p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {workspaceName ? (
          <span className="text-muted-foreground hidden text-xs sm:inline">{workspaceName}</span>
        ) : null}
        <span className="text-muted-foreground text-sm">{roleLabel}</span>
        {showMenu ? (
          <MemberActionsMenu
            variant={variant}
            disabled={disabled}
            removeLabel={removeLabel}
            onManageAccess={onManageAccess}
            onTransferOwnership={showTransfer ? onTransferOwnership : undefined}
            onRemove={showLeave || showRemove ? removeHandler : undefined}
            onViewInviteDetails={variant === "pending" ? onViewInviteDetails : undefined}
            onRevoke={variant === "pending" ? onRevoke : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}
