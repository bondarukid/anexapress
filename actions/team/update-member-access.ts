"use server";

import { PERM_MEMBERS_REMOVE, revalidateTeamPaths } from "@/lib/team/actions";
import { updateMemberAccessSchema } from "@/schemas/member-access.schema";
import { requireWorkspacePermission, updateMemberAccess } from "@/services/team";
import type { TeamActionResult, UpdateMemberAccessResult } from "@/types/team";

export async function updateMemberAccessAction(
  input: unknown,
): Promise<TeamActionResult<UpdateMemberAccessResult>> {
  const parsed = updateMemberAccessSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_REMOVE);
  if (!perm.success) return perm;

  const result = await updateMemberAccess(parsed.data);
  if (result.success) {
    revalidateTeamPaths(parsed.data.workspaceSlug);
  }
  return result;
}
