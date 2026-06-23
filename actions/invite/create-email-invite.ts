"use server";

import { PERM_MEMBERS_INVITE, revalidateTeamPaths } from "@/lib/team/actions";
import { CreateEmailInviteSchema } from "@/schemas/invite-schema";
import { createEmailInvite } from "@/services/invite";
import { requireWorkspacePermission } from "@/services/team";
import type { InviteActionResult, InviteCreatedPayload } from "@/types/invite";

export async function createEmailInviteAction(input: {
  workspaceId: string;
  email: string;
  roleId: string;
  workspaceSlug?: string;
}): Promise<InviteActionResult<InviteCreatedPayload>> {
  const parsed = CreateEmailInviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const perm = await requireWorkspacePermission(parsed.data.workspaceId, PERM_MEMBERS_INVITE);
  if (!perm.success) return perm;

  const result = await createEmailInvite(parsed.data);
  if (result.success) revalidateTeamPaths(parsed.data.workspaceSlug);
  return result;
}
