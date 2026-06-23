"use server";

import { PERM_MEMBERS_INVITE, revalidateTeamPaths } from "@/lib/team/actions";
import { RevokeInviteSchema } from "@/schemas/team-schema";
import { requireWorkspacePermission, revokeTeamInvite } from "@/services/team";
import type { TeamActionResult } from "@/types/team";

export async function revokeTeamInviteAction(input: {
  workspaceId: string;
  inviteId: string;
  workspaceSlug?: string;
}): Promise<TeamActionResult> {
  const parsed = RevokeInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid invitation." };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_INVITE);
  if (!perm.success) return perm;

  const result = await revokeTeamInvite(parsed.data);
  if (result.success) revalidateTeamPaths(input.workspaceSlug);
  return result;
}
