"use server";

import { PERM_MEMBERS_INVITE, revalidateTeamPaths } from "@/lib/team/actions";
import { CreateJoinLinkSchema } from "@/schemas/invite-schema";
import { createJoinLink } from "@/services/invite";
import { requireWorkspacePermission } from "@/services/team";
import type { InviteActionResult, InviteCreatedPayload } from "@/types/invite";

export async function createJoinLinkAction(input: {
  workspaceId: string;
  roleId: string;
  workspaceSlug?: string;
  expiresInDays?: number;
}): Promise<InviteActionResult<InviteCreatedPayload>> {
  const parsed = CreateJoinLinkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_INVITE);
  if (!perm.success) return perm;

  const result = await createJoinLink(parsed.data);
  if (result.success) revalidateTeamPaths(parsed.data.workspaceSlug);
  return result;
}
