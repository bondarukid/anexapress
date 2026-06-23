import { createClient } from "@/lib/server";
import { getSiteOrigin } from "@/lib/auth/site-origin";
import { workspaceInviteUrl } from "@/lib/invites/invite-url";
import { formatMemberDisplayName, formatRoleLabel, nameFromEmail } from "@/lib/team/display";
import {
  PERM_MEMBERS_INVITE,
  PERM_MEMBERS_REMOVE,
  PERM_MEMBERS_VISIBILITY,
  PERM_CONTENT_CREATE,
  PERM_CONTENT_PUBLISH,
  PERM_WORKSPACE_DELETE,
  PERM_WORKSPACE_TRANSFER,
  PERM_WORKSPACE_UPDATE,
} from "@/lib/team/permissions";
import type { WorkspaceRoleSlug } from "@/types/workspace";
import type {
  MemberAccessContext,
  TeamActionResult,
  TeamActiveMember,
  WorkspaceAccessPermissions,
  TeamPageData,
  TeamPendingInvite,
  TeamRoleOption,
  UpdateMemberAccessResult,
} from "@/types/team";
import type { UpdateMemberAccessInput } from "@/schemas/member-access.schema";

type TeamMemberRpcRow = {
  membership_id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role_id: string;
  role_slug: string;
  role_name: string;
  is_workspace_owner: boolean;
  uses_custom_permissions?: boolean;
  is_publicly_visible?: boolean;
  workspace_id?: string;
  workspace_name?: string;
  workspace_slug?: string;
  is_child_workspace?: boolean;
};

type MemberAccessContextRpcMember = {
  membershipId: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  roleId: string;
  roleSlug: string;
  roleName: string;
  isOwner: boolean;
  usesCustomPermissions: boolean;
};

type MemberAccessContextRpcRole = {
  id: string;
  slug: string;
  name: string;
};

type MemberAccessContextRpcPermission = {
  key: string;
  description: string | null;
};

type MemberAccessContextRpcPayload = {
  member: MemberAccessContextRpcMember;
  assignableRoles: MemberAccessContextRpcRole[];
  permissions: MemberAccessContextRpcPermission[];
  rolePermissionKeys: Record<string, string[]>;
  effectivePermissionKeys: string[];
};

type RoleRow = {
  id: string;
  slug: string;
  name: string;
};

type PendingInviteRow = {
  id: string;
  email: string;
  role_id: string;
  join_code: string;
  expires_at: string;
  roles: RoleRow | RoleRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

async function loadMemberPermissions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
): Promise<{ canInvite: boolean; canRemove: boolean }> {
  const [inviteRes, removeRes] = await Promise.all([
    supabase.rpc("has_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_MEMBERS_INVITE,
    }),
    supabase.rpc("has_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_MEMBERS_REMOVE,
    }),
  ]);

  return {
    canInvite: inviteRes.data === true,
    canRemove: removeRes.data === true,
  };
}

export async function getTeamMemberPermissions(
  workspaceId: string,
): Promise<{ canInvite: boolean; canRemove: boolean }> {
  const supabase = await createClient();
  return loadMemberPermissions(supabase, workspaceId);
}

/**
 * PBAC flags for workspace settings UI (name/slug/logo, transfer).
 */
export async function getWorkspaceAccessPermissions(
  workspaceId: string,
): Promise<WorkspaceAccessPermissions> {
  const supabase = await createClient();

  const [updateRes, transferRes, deleteRes, visibilityRes, createRes, publishRes] =
    await Promise.all([
      supabase.rpc("has_workspace_permission", {
        ws_id: workspaceId,
        perm_key: PERM_WORKSPACE_UPDATE,
      }),
      supabase.rpc("has_workspace_permission", {
        ws_id: workspaceId,
        perm_key: PERM_WORKSPACE_TRANSFER,
      }),
      supabase.rpc("has_effective_workspace_permission", {
        ws_id: workspaceId,
        perm_key: PERM_WORKSPACE_DELETE,
      }),
      supabase.rpc("has_effective_workspace_permission", {
        ws_id: workspaceId,
        perm_key: PERM_MEMBERS_VISIBILITY,
      }),
      supabase.rpc("has_effective_workspace_permission", {
        ws_id: workspaceId,
        perm_key: PERM_CONTENT_CREATE,
      }),
      supabase.rpc("has_effective_workspace_permission", {
        ws_id: workspaceId,
        perm_key: PERM_CONTENT_PUBLISH,
      }),
    ]);

  return {
    canUpdate: updateRes.data === true,
    canTransfer: transferRes.data === true,
    canDelete: deleteRes.data === true,
    canManageVisibility: visibilityRes.data === true,
    canCreateContent: createRes.data === true,
    canPublishContent: publishRes.data === true,
  };
}

/**
 * Guard for workspace-scoped mutations: verifies an active session and that the
 * current user holds the given permission via the `has_workspace_permission` RPC.
 */
export async function requireWorkspacePermission(
  workspaceId: string,
  permKey: string,
): Promise<TeamActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const { data: allowed, error } = await supabase.rpc("has_workspace_permission", {
    ws_id: workspaceId,
    perm_key: permKey,
  });

  if (error || allowed !== true) {
    return {
      success: false,
      error: "You do not have permission to perform this action.",
    };
  }

  return { success: true };
}

/**
 * Guard for read-only workspace-scoped data: active session + workspace membership.
 */
export async function requireWorkspaceMember(workspaceId: string): Promise<TeamActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const { data: isMember, error } = await supabase.rpc("is_workspace_member", {
    ws_id: workspaceId,
  });

  if (error || isMember !== true) {
    return {
      success: false,
      error: "You do not have access to this workspace.",
    };
  }

  return { success: true };
}

/** Remove an active member from a workspace. The workspace owner cannot be removed. */
export async function removeTeamMember(input: {
  workspaceId: string;
  membershipId: string;
}): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id, user_id, workspaces!inner(owner_id)")
      .eq("id", input.membershipId)
      .eq("workspace_id", input.workspaceId)
      .maybeSingle();

    if (!membership) {
      return { success: false, error: "Member not found." };
    }

    const workspace = Array.isArray(membership.workspaces)
      ? membership.workspaces[0]
      : membership.workspaces;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    if (membership.user_id === user.id) {
      return {
        success: false,
        error: "To leave this workspace, use Leave workspace instead of Remove.",
      };
    }

    if (workspace?.owner_id === membership.user_id) {
      return { success: false, error: "The workspace owner cannot be removed." };
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", input.membershipId)
      .eq("workspace_id", input.workspaceId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Leave a workspace voluntarily. Owners must transfer ownership first. */
export async function leaveWorkspace(input: { workspaceId: string }): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id, user_id, workspaces!inner(owner_id)")
      .eq("workspace_id", input.workspaceId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return { success: false, error: "You are not an active member of this workspace." };
    }

    const workspace = Array.isArray(membership.workspaces)
      ? membership.workspaces[0]
      : membership.workspaces;

    if (workspace?.owner_id === user.id) {
      return {
        success: false,
        error: "Workspace owners must transfer ownership before leaving.",
      };
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", membership.id)
      .eq("workspace_id", input.workspaceId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Change an active member's role. The owner role cannot be reassigned. */
export async function updateTeamMemberRole(input: {
  workspaceId: string;
  membershipId: string;
  roleId: string;
}): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id, user_id, workspaces!inner(owner_id)")
      .eq("id", input.membershipId)
      .eq("workspace_id", input.workspaceId)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return { success: false, error: "Member not found." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (membership.user_id === user.id) {
      return { success: false, error: "You cannot change your own role." };
    }

    const workspace = Array.isArray(membership.workspaces)
      ? membership.workspaces[0]
      : membership.workspaces;

    if (workspace?.owner_id === membership.user_id) {
      return { success: false, error: "The workspace owner role cannot be changed." };
    }

    const { data: role } = await supabase
      .from("roles")
      .select("id")
      .eq("id", input.roleId)
      .eq("workspace_id", input.workspaceId)
      .neq("slug", "owner")
      .maybeSingle();

    if (!role) {
      return { success: false, error: "Selected role is not available." };
    }

    const { error } = await supabase
      .from("workspace_members")
      .update({ role_id: input.roleId, uses_custom_permissions: false })
      .eq("id", input.membershipId)
      .eq("workspace_id", input.workspaceId);

    if (error) {
      return { success: false, error: error.message };
    }

    const { error: clearCustomError } = await supabase
      .from("workspace_member_permissions")
      .delete()
      .eq("membership_id", input.membershipId);

    if (clearCustomError) {
      return { success: false, error: clearCustomError.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Revoke a pending workspace invite. */
export async function revokeTeamInvite(input: {
  workspaceId: string;
  inviteId: string;
}): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("workspace_invites")
      .update({ status: "revoked" })
      .eq("id", input.inviteId)
      .eq("workspace_id", input.workspaceId)
      .eq("status", "pending");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Change the role assigned to a pending invite. The owner role is not assignable. */
export async function updatePendingInviteRole(input: {
  workspaceId: string;
  inviteId: string;
  roleId: string;
}): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();

    const { data: role } = await supabase
      .from("roles")
      .select("id")
      .eq("id", input.roleId)
      .eq("workspace_id", input.workspaceId)
      .neq("slug", "owner")
      .maybeSingle();

    if (!role) {
      return { success: false, error: "Selected role is not available." };
    }

    const { error } = await supabase
      .from("workspace_invites")
      .update({ role_id: input.roleId })
      .eq("id", input.inviteId)
      .eq("workspace_id", input.workspaceId)
      .eq("status", "pending");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

function mapRpcMember(row: TeamMemberRpcRow): TeamActiveMember {
  const roleSlug = row.role_slug as WorkspaceRoleSlug;
  const roleLabel = row.uses_custom_permissions
    ? "Custom"
    : formatRoleLabel(roleSlug, row.role_name);
  return {
    membershipId: row.membership_id,
    userId: row.user_id,
    email: row.email,
    name: formatMemberDisplayName(row.first_name, row.last_name, row.email),
    roleId: row.role_id,
    roleSlug,
    roleLabel,
    isOwner: row.is_workspace_owner,
    avatarUrl: row.avatar_url,
    usesCustomPermissions: row.uses_custom_permissions,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    workspaceSlug: row.workspace_slug,
    isPubliclyVisible: row.is_publicly_visible,
  };
}

function mapMemberAccessContext(payload: MemberAccessContextRpcPayload): MemberAccessContext {
  const roleSlug = payload.member.roleSlug as WorkspaceRoleSlug;
  const roleLabel = payload.member.usesCustomPermissions
    ? "Custom"
    : formatRoleLabel(roleSlug, payload.member.roleName);

  return {
    member: {
      membershipId: payload.member.membershipId,
      userId: payload.member.userId,
      email: payload.member.email,
      name: formatMemberDisplayName(
        payload.member.firstName,
        payload.member.lastName,
        payload.member.email,
      ),
      avatarUrl: payload.member.avatarUrl,
      roleId: payload.member.roleId,
      roleSlug,
      roleLabel,
      isOwner: payload.member.isOwner,
      usesCustomPermissions: payload.member.usesCustomPermissions,
      isPubliclyVisible: true,
    },
    assignableRoles: payload.assignableRoles.map((role) => ({
      id: role.id,
      slug: role.slug as WorkspaceRoleSlug,
      label: formatRoleLabel(role.slug, role.name),
    })),
    permissions: payload.permissions,
    rolePermissionKeys: payload.rolePermissionKeys,
    effectivePermissionKeys: payload.effectivePermissionKeys,
  };
}

/**
 * Loads member, assignable roles, permission catalog, and effective keys for the access dialog.
 */
export async function getMemberAccessContext(
  membershipId: string,
): Promise<TeamActionResult<MemberAccessContext>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_member_access_context", {
      p_membership_id: membershipId,
    });

    if (error) {
      if (error.message.includes("member_not_found")) {
        return { success: false, error: "Member not found." };
      }
      if (error.message.includes("forbidden")) {
        return { success: false, error: "You do not have permission to view member access." };
      }
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Member not found." };
    }

    return {
      success: true,
      data: mapMemberAccessContext(data as MemberAccessContextRpcPayload),
    };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/**
 * Updates a member's preset role or custom permission set.
 */
export async function updateMemberAccess(
  input: UpdateMemberAccessInput,
): Promise<TeamActionResult<UpdateMemberAccessResult>> {
  try {
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("id, user_id, role_id, workspaces!inner(owner_id)")
      .eq("id", input.membershipId)
      .eq("workspace_id", input.workspaceId)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return { success: false, error: "Member not found." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (membership.user_id === user.id) {
      return { success: false, error: "You cannot change your own role or access." };
    }

    const workspace = Array.isArray(membership.workspaces)
      ? membership.workspaces[0]
      : membership.workspaces;

    if (workspace?.owner_id === membership.user_id) {
      return { success: false, error: "The workspace owner access cannot be changed." };
    }

    const uniqueKeys = [...new Set(input.permissionKeys)];

    const { data: permissionRows, error: permissionError } = await supabase
      .from("permissions")
      .select("id, key")
      .in("key", uniqueKeys);

    if (permissionError) {
      return { success: false, error: permissionError.message };
    }

    const permissionIdsByKey = new Map(
      ((permissionRows ?? []) as Array<{ id: string; key: string }>).map((row) => [row.key, row.id]),
    );

    if (permissionIdsByKey.size !== uniqueKeys.length) {
      return { success: false, error: "One or more permissions are invalid." };
    }

    if (input.mode === "preset") {
      const roleId = input.roleId;
      if (!roleId) {
        return { success: false, error: "Role is required." };
      }

      const { data: role } = await supabase
        .from("roles")
        .select("id, slug, name")
        .eq("id", roleId)
        .eq("workspace_id", input.workspaceId)
        .neq("slug", "owner")
        .maybeSingle();

      if (!role) {
        return { success: false, error: "Selected role is not available." };
      }

      const { error: updateError } = await supabase
        .from("workspace_members")
        .update({ role_id: roleId, uses_custom_permissions: false })
        .eq("id", input.membershipId)
        .eq("workspace_id", input.workspaceId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      const { error: deleteError } = await supabase
        .from("workspace_member_permissions")
        .delete()
        .eq("membership_id", input.membershipId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      const roleSlug = role.slug as WorkspaceRoleSlug;
      return {
        success: true,
        data: {
          roleId: role.id,
          roleSlug,
          roleLabel: formatRoleLabel(roleSlug, role.name),
          usesCustomPermissions: false,
        },
      };
    }

    const { error: updateError } = await supabase
      .from("workspace_members")
      .update({ uses_custom_permissions: true })
      .eq("id", input.membershipId)
      .eq("workspace_id", input.workspaceId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    const { error: deleteError } = await supabase
      .from("workspace_member_permissions")
      .delete()
      .eq("membership_id", input.membershipId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    const insertRows = uniqueKeys.map((key) => ({
      membership_id: input.membershipId,
      permission_id: permissionIdsByKey.get(key) as string,
    }));

    if (insertRows.length > 0) {
      const { error: insertError } = await supabase
        .from("workspace_member_permissions")
        .insert(insertRows);

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    const { data: currentRole } = await supabase
      .from("roles")
      .select("id, slug, name")
      .eq("id", membership.role_id)
      .maybeSingle();

    const roleSlug = (currentRole?.slug ?? "member") as WorkspaceRoleSlug;

    return {
      success: true,
      data: {
        roleId: membership.role_id,
        roleSlug,
        roleLabel: "Custom",
        usesCustomPermissions: true,
      },
    };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

type InviteeProfileRow = {
  email: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

function mapPendingInvite(
  row: PendingInviteRow,
  profileByEmail: Map<string, InviteeProfileRow>,
  workspaceSlug: string,
): TeamPendingInvite | null {
  const role = unwrapRelation(row.roles);
  if (!role) return null;

  const roleSlug = role.slug as WorkspaceRoleSlug;
  const profile = profileByEmail.get(row.email.trim().toLowerCase());
  const origin = getSiteOrigin();
  const inviteUrl = origin ? workspaceInviteUrl(origin, workspaceSlug, row.join_code) : null;

  const inviteDetails = {
    joinCode: row.join_code,
    inviteUrl,
    expiresAt: row.expires_at,
  };

  if (profile) {
    return {
      id: row.id,
      email: row.email,
      name: formatMemberDisplayName(profile.first_name, profile.last_name, row.email),
      roleId: row.role_id,
      roleSlug,
      roleLabel: formatRoleLabel(roleSlug, role.name),
      isRegistered: true,
      avatarUrl: profile.avatar_url,
      ...inviteDetails,
    };
  }

  return {
    id: row.id,
    email: row.email,
    name: nameFromEmail(row.email),
    roleId: row.role_id,
    roleSlug,
    roleLabel: formatRoleLabel(roleSlug, role.name),
    isRegistered: false,
    avatarUrl: null,
    ...inviteDetails,
  };
}

async function loadInviteeProfilesByEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  emails: string[],
): Promise<Map<string, InviteeProfileRow>> {
  const map = new Map<string, InviteeProfileRow>();
  if (emails.length === 0) return map;

  const { data, error } = await supabase.rpc("lookup_saas_users_by_emails", {
    p_workspace_id: workspaceId,
    p_emails: emails,
  });

  if (error) {
    console.error("[loadInviteeProfilesByEmail]", error.message);
    return map;
  }

  for (const row of (data ?? []) as InviteeProfileRow[]) {
    map.set(row.email.toLowerCase(), row);
  }

  return map;
}

export async function getTeamPageData(
  workspaceId: string,
  useFamilyView = false,
): Promise<TeamPageData | null> {
  const supabase = await createClient();

  await supabase.rpc("ensure_workspace_system_roles", {
    p_workspace_id: workspaceId,
  });

  const permissions = await loadMemberPermissions(supabase, workspaceId);

  const { data: workspaceMeta, error: workspaceError } = await supabase
    .from("workspaces")
    .select("name, parent_workspace_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (workspaceError) {
    console.error("[getTeamPageData workspace]", workspaceError.message);
    return null;
  }

  const isRootParent = !workspaceMeta?.parent_workspace_id;
  const shouldUseFamily = useFamilyView && isRootParent;

  let memberRows: TeamMemberRpcRow[] | null = null;
  let membersError: { message: string } | null = null;
  let familyWorkspaces: TeamPageData["familyWorkspaces"];

  if (shouldUseFamily) {
    const [{ data: familyRows, error: familyError }, { data: childRows }] = await Promise.all([
      supabase.rpc("get_workspace_family_members", {
        p_scope_workspace_id: workspaceId,
        p_filter_workspace_id: null,
      }),
      supabase.rpc("get_child_workspaces", { p_parent_id: workspaceId }),
    ]);

    membersError = familyError;
    memberRows = (familyRows ?? []) as TeamMemberRpcRow[];

    familyWorkspaces = [
      {
        id: workspaceId,
        name: workspaceMeta?.name ?? "Workspace",
        slug: "",
        isChild: false,
      },
      ...((childRows ?? []) as Array<{ id: string; name: string; slug: string }>).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        isChild: true,
      })),
    ];

    const parentSlugRow = await supabase
      .from("workspaces")
      .select("slug")
      .eq("id", workspaceId)
      .maybeSingle();
    if (familyWorkspaces[0]) {
      familyWorkspaces[0].slug = parentSlugRow.data?.slug ?? "";
    }
  } else {
    const result = await supabase.rpc("get_workspace_team_members", {
      p_workspace_id: workspaceId,
    });
    membersError = result.error;
    memberRows = (result.data ?? []) as TeamMemberRpcRow[];
  }

  if (membersError) {
    console.error("[getTeamPageData members]", membersError.message);
    return null;
  }

  const members = (memberRows ?? []).map(mapRpcMember);

  const { data: roleRows, error: rolesError } = await supabase
    .from("roles")
    .select("id, slug, name")
    .eq("workspace_id", workspaceId)
    .neq("slug", "owner")
    .order("name");

  if (rolesError) {
    console.error("[getTeamPageData roles]", rolesError.message);
    return null;
  }

  const assignableRoles: TeamRoleOption[] = ((roleRows ?? []) as RoleRow[]).map((role) => ({
    id: role.id,
    slug: role.slug as WorkspaceRoleSlug,
    label: formatRoleLabel(role.slug, role.name),
  }));

  let pendingInvites: TeamPendingInvite[] = [];

  if (permissions.canInvite) {
    const { data: workspaceRow, error: workspaceError } = await supabase
      .from("workspaces")
      .select("slug")
      .eq("id", workspaceId)
      .maybeSingle();

    if (workspaceError) {
      console.error("[getTeamPageData workspace slug]", workspaceError.message);
    }

    const workspaceSlug = workspaceRow?.slug ?? "";

    const { data: inviteRows, error: invitesError } = await supabase
      .from("workspace_invites")
      .select(
        `
                id,
                email,
                role_id,
                join_code,
                expires_at,
                roles ( id, slug, name )
            `,
      )
      .eq("workspace_id", workspaceId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (invitesError) {
      console.error("[getTeamPageData invites]", invitesError.message);
    } else {
      const rows = (inviteRows ?? []) as PendingInviteRow[];
      const profileByEmail = await loadInviteeProfilesByEmail(
        supabase,
        workspaceId,
        rows.map((r) => r.email),
      );
      pendingInvites = rows
        .map((row) => mapPendingInvite(row, profileByEmail, workspaceSlug))
        .filter((invite): invite is TeamPendingInvite => invite !== null);
    }
  }

  return {
    workspaceId,
    workspaceName: workspaceMeta?.name ?? "Workspace",
    members,
    pendingInvites,
    assignableRoles,
    permissions,
    isFamilyView: shouldUseFamily,
    familyWorkspaces: shouldUseFamily ? familyWorkspaces : undefined,
  };
}

export type UpdateMemberVisibilityResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Update whether a member appears in the public team list (child workspaces only).
 */
export async function updateMemberVisibility(
  membershipId: string,
  isPubliclyVisible: boolean,
): Promise<UpdateMemberVisibilityResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_member_visibility", {
    p_membership_id: membershipId,
    p_visible: isPubliclyVisible,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
