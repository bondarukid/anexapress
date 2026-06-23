import type { TeamActiveMember } from "@/types/team";

type FamilyMemberRow = {
  membership_id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  is_child_workspace: boolean;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role_id: string;
  role_slug: string;
  role_name: string;
  is_workspace_owner: boolean;
  is_publicly_visible: boolean;
};

function displayName(first: string | null, last: string | null, email: string): string {
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || email;
}

/** Map RPC row to TeamActiveMember with workspace context. */
export function mapFamilyMemberRow(row: FamilyMemberRow): TeamActiveMember {
  return {
    membershipId: row.membership_id,
    userId: row.user_id,
    name: displayName(row.first_name, row.last_name, row.email),
    email: row.email,
    roleId: row.role_id,
    roleSlug: row.role_slug as TeamActiveMember["roleSlug"],
    roleLabel: row.role_name,
    isOwner: row.is_workspace_owner,
    avatarUrl: row.avatar_url,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    workspaceSlug: row.workspace_slug,
    isPubliclyVisible: row.is_publicly_visible,
  };
}

/** Filter members by workspace id (null = all). */
export function filterMembersByWorkspace(
  members: TeamActiveMember[],
  workspaceId: string | null,
): TeamActiveMember[] {
  if (!workspaceId) return members;
  return members.filter((m) => m.workspaceId === workspaceId);
}
