"use server";

import { PERM_MEMBERS_INVITE, revalidateTeamPaths } from "@/lib/team/actions";
import { UpdatePendingInviteRoleSchema } from "@/schemas/team-schema";
import { requireWorkspacePermission, updatePendingInviteRole } from "@/services/team";
import type { TeamActionResult } from "@/types/team";

export async function updatePendingInviteRoleAction(input: {
  workspaceId: string;
  inviteId: string;
  roleId: string;
  workspaceSlug?: string;
}): Promise<TeamActionResult> {
  const parsed = UpdatePendingInviteRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_INVITE);
  if (!perm.success) return perm;

  const result = await updatePendingInviteRole(parsed.data);
  if (result.success) revalidateTeamPaths(input.workspaceSlug);
  return result;
}
