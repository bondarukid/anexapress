"use server";

import { PERM_MEMBERS_REMOVE, revalidateTeamPaths } from "@/lib/team/actions";
import { UpdateMemberRoleSchema } from "@/schemas/team-schema";
import { requireWorkspacePermission, updateTeamMemberRole } from "@/services/team";
import type { TeamActionResult } from "@/types/team";

export async function updateTeamMemberRoleAction(input: {
  workspaceId: string;
  membershipId: string;
  roleId: string;
  workspaceSlug?: string;
}): Promise<TeamActionResult> {
  const parsed = UpdateMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_REMOVE);
  if (!perm.success) return perm;

  const result = await updateTeamMemberRole(parsed.data);
  if (result.success) revalidateTeamPaths(input.workspaceSlug);
  return result;
}
