"use server";

import { revalidateTeamPaths } from "@/lib/team/actions";
import { InitiateWorkspaceTransferSchema } from "@/schemas/team-schema";
import { initiateWorkspaceTransfer } from "@/services/workspace-transfer";
import type { TeamActionResult } from "@/types/team";

export async function initiateWorkspaceTransferAction(
  input: unknown,
): Promise<TeamActionResult<{ transferId: string }>> {
  const parsed = InitiateWorkspaceTransferSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  const result = await initiateWorkspaceTransfer(parsed.data);
  if (result.success) {
    revalidateTeamPaths(parsed.data.workspaceSlug);
  }
  return result;
}
