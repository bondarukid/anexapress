import type { TeamMemberPermissions, WorkspaceAccessPermissions } from "@/types/team";

export const PERM_MEMBERS_INVITE = "members.invite" as const;
export const PERM_MEMBERS_REMOVE = "members.remove" as const;
export const PERM_MEMBERS_VISIBILITY = "members.visibility" as const;
export const PERM_WORKSPACE_UPDATE = "workspace.update" as const;
export const PERM_WORKSPACE_TRANSFER = "workspace.transfer" as const;
export const PERM_WORKSPACE_DELETE = "workspace.delete" as const;
export const PERM_CONTENT_CREATE = "content.create" as const;
export const PERM_CONTENT_PUBLISH = "content.publish" as const;
export const PERM_CONTENT_TRANSLATE = "content.translate" as const;

/** Create and edit blog posts / CMS content. */
export function canCreateContent(permissions: WorkspaceAccessPermissions): boolean {
  return permissions.canCreateContent;
}

/** Publish blog posts to the public blog. */
export function canPublishContent(permissions: WorkspaceAccessPermissions): boolean {
  return permissions.canPublishContent;
}

/** Edit workspace name, slug, logo, and related general settings. */
export function canUpdateWorkspaceSettings(permissions: WorkspaceAccessPermissions): boolean {
  return permissions.canUpdate;
}

/** Initiate workspace ownership transfer. */
export function canInitiateWorkspaceTransfer(permissions: WorkspaceAccessPermissions): boolean {
  return permissions.canTransfer;
}

/** Full team management UI (invite, pending invites list). */
export function canManageWorkspaceMembers(permissions: TeamMemberPermissions): boolean {
  return permissions.canInvite && permissions.canRemove;
}

/** Role changes, remove member, and permissions dialog (matches server guard: members.remove). */
export function canManageMemberAccess(permissions: TeamMemberPermissions): boolean {
  return permissions.canRemove;
}

type MemberRoleTarget = {
  userId: string;
  isOwner: boolean;
};

/** Whether the current user may change another member's role (never self or workspace owner). */
export function canManageOtherMemberRole(
  canManageAccess: boolean,
  member: MemberRoleTarget,
  currentUserId: string,
): boolean {
  return canManageAccess && !member.isOwner && member.userId !== currentUserId;
}

/** Alias for removing another member from the workspace (same guard as role changes). */
export function canRemoveOtherMember(
  canManageAccess: boolean,
  member: MemberRoleTarget,
  currentUserId: string,
): boolean {
  return canManageOtherMemberRole(canManageAccess, member, currentUserId);
}

/** Whether the current user may leave this workspace (never the owner). */
export function canLeaveWorkspace(member: MemberRoleTarget, currentUserId: string): boolean {
  return member.userId === currentUserId && !member.isOwner;
}

/** Whether the workspace owner row should show the transfer ownership entry point. */
export function canTransferWorkspaceOwnership(
  member: MemberRoleTarget,
  currentUserId: string,
): boolean {
  return member.isOwner && member.userId === currentUserId;
}

/** Whether the current user may change another member's public visibility in a child workspace. */
export function canChangeMemberVisibility(
  canManageVisibility: boolean,
  member: MemberRoleTarget,
  currentUserId: string,
): boolean {
  return canManageVisibility && member.userId !== currentUserId;
}

/** Self-service visibility menu in child workspace member list. */
export function canOpenSelfVisibilityMenu(
  isChildWorkspace: boolean,
  member: MemberRoleTarget,
  currentUserId: string,
): boolean {
  return isChildWorkspace && member.userId === currentUserId;
}

/** Show the member actions menu when leave, manage/remove, transfer, or self-visibility is available. */
export function shouldShowActiveMemberMenu(
  member: MemberRoleTarget,
  currentUserId: string,
  canManageAccess: boolean,
  options?: { isChildWorkspace?: boolean; canManageVisibility?: boolean },
): boolean {
  const isChildWorkspace = options?.isChildWorkspace ?? false;
  const canManageVisibility = options?.canManageVisibility ?? false;

  return (
    canLeaveWorkspace(member, currentUserId) ||
    canRemoveOtherMember(canManageAccess, member, currentUserId) ||
    canTransferWorkspaceOwnership(member, currentUserId) ||
    canOpenSelfVisibilityMenu(isChildWorkspace, member, currentUserId) ||
    canChangeMemberVisibility(canManageVisibility, member, currentUserId)
  );
}
