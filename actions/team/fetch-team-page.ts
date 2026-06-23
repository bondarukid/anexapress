"use server";

import { getTeamPageData } from "@/services/team";
import type { TeamActionResult, TeamPageData } from "@/types/team";
import { WorkspaceIdSchema } from "@/schemas/team-schema";

export async function fetchTeamPageAction(
  workspaceId: string,
): Promise<TeamActionResult<TeamPageData>> {
  const parsed = WorkspaceIdSchema.safeParse({ workspaceId });
  if (!parsed.success) {
    return { success: false, error: "Invalid workspace." };
  }

  const data = await getTeamPageData(parsed.data.workspaceId);
  if (!data) {
    return { success: false, error: "Failed to load team data." };
  }

  return { success: true, data };
}
