"use server";

import { revalidateTeamPaths } from "@/lib/team/actions";
import { WorkspaceTransferIdSchema } from "@/schemas/team-schema";
import { cancelWorkspaceTransfer } from "@/services/workspace-transfer";
import type { TeamActionResult } from "@/types/team";

export async function cancelWorkspaceTransferAction(
  input: unknown,
): Promise<TeamActionResult> {
  const parsed = WorkspaceTransferIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid transfer." };
  }

  const result = await cancelWorkspaceTransfer(parsed.data.transferId);
  if (result.success) {
    revalidateTeamPaths(parsed.data.workspaceSlug);
  }
  return result;
}
