import type { WorkspaceRoleSlug } from "@/types/workspace";

export type TeamMemberPermissions = {
  canInvite: boolean;
  canRemove: boolean;
};

/** PBAC flags for the active workspace (via `has_workspace_permission` RPC). */
export type WorkspaceAccessPermissions = {
  canUpdate: boolean;
  canTransfer: boolean;
  canDelete: boolean;
  canManageVisibility: boolean;
  canCreateContent: boolean;
  canPublishContent: boolean;
};

export type TeamRoleOption = {
  id: string;
  slug: WorkspaceRoleSlug;
  label: string;
};

export type TeamActiveMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  roleId: string;
  roleSlug: WorkspaceRoleSlug;
  roleLabel: string;
  isOwner: boolean;
  avatarUrl: string | null;
  usesCustomPermissions?: boolean;
  workspaceId?: string;
  workspaceName?: string;
  workspaceSlug?: string;
  isPubliclyVisible?: boolean;
};

export type PermissionCatalogItem = {
  key: string;
  description: string | null;
};

export type PermissionSectionIcon = "users" | "building" | "database" | "settings";

export type PermissionSection = {
  category: string;
  icon: PermissionSectionIcon;
  permissions: Array<{ id: string; label: string }>;
};

export type MemberAccessContext = {
  member: {
    membershipId: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    roleId: string;
    roleSlug: WorkspaceRoleSlug;
    roleLabel: string;
    isOwner: boolean;
    usesCustomPermissions: boolean;
    isPubliclyVisible: boolean;
  };
  assignableRoles: TeamRoleOption[];
  permissions: PermissionCatalogItem[];
  rolePermissionKeys: Record<string, string[]>;
  effectivePermissionKeys: string[];
};

export type UpdateMemberAccessResult = {
  roleId: string;
  roleSlug: WorkspaceRoleSlug;
  roleLabel: string;
  usesCustomPermissions: boolean;
};

export type TeamPendingInvite = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleSlug: WorkspaceRoleSlug;
  roleLabel: string;
  /** Invitee already has a SaaS account (matched by email). */
  isRegistered: boolean;
  avatarUrl: string | null;
  joinCode: string;
  inviteUrl: string | null;
  expiresAt: string;
};

export type TeamFamilyWorkspaceOption = {
  id: string;
  name: string;
  slug: string;
  isChild: boolean;
};

export type TeamPageData = {
  workspaceId: string;
  workspaceName: string;
  members: TeamActiveMember[];
  pendingInvites: TeamPendingInvite[];
  assignableRoles: TeamRoleOption[];
  permissions: TeamMemberPermissions;
  isFamilyView?: boolean;
  familyWorkspaces?: TeamFamilyWorkspaceOption[];
};

export type MemberRemovalMode = "leave" | "remove";

export type TeamMembersListProps = {
  members: TeamActiveMember[];
  currentUserId: string;
  /** Remove member and open permissions dialog (members.remove). */
  canManageAccess: boolean;
  canManageVisibility?: boolean;
  isChildWorkspace?: boolean;
  showWorkspaceColumn?: boolean;
  disabled?: boolean;
  onRequestRemoval: (mode: MemberRemovalMode, member: TeamActiveMember) => void;
  onManageAccess?: (membershipId: string) => void;
  onTransferOwnership?: () => void;
};

export type TeamActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
