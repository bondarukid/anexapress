"use server";

import { revalidateTeamPaths } from "@/lib/team/actions";
import { LeaveWorkspaceSchema } from "@/schemas/team-schema";
import { leaveWorkspace } from "@/services/team";
import type { TeamActionResult } from "@/types/team";

/** Voluntarily leave a workspace (no members.remove permission required). */
export async function leaveWorkspaceAction(input: {
  workspaceId: string;
  workspaceSlug?: string;
}): Promise<TeamActionResult> {
  const parsed = LeaveWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid workspace." };
  }

  const result = await leaveWorkspace(parsed.data);
  if (result.success) {
    revalidateTeamPaths(input.workspaceSlug);
  }
  return result;
}
