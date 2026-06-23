"use server";

import { PERM_MEMBERS_REMOVE, revalidateTeamPaths } from "@/lib/team/actions";
import { RemoveMemberSchema } from "@/schemas/team-schema";
import { removeTeamMember, requireWorkspacePermission } from "@/services/team";
import type { TeamActionResult } from "@/types/team";

export async function removeTeamMemberAction(input: {
  workspaceId: string;
  membershipId: string;
  workspaceSlug?: string;
}): Promise<TeamActionResult> {
  const parsed = RemoveMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid member." };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_REMOVE);
  if (!perm.success) return perm;

  const result = await removeTeamMember(parsed.data);
  if (result.success) revalidateTeamPaths(input.workspaceSlug);
  return result;
}
