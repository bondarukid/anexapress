"use server";

import { revalidatePath } from "next/cache";
import { WorkspaceTransferIdSchema } from "@/schemas/team-schema";
import { confirmWorkspaceTransferRecipient } from "@/services/workspace-transfer";
import type { TeamActionResult } from "@/types/team";

export async function confirmWorkspaceTransferAction(
  input: unknown,
): Promise<TeamActionResult> {
  const parsed = WorkspaceTransferIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid transfer." };
  }

  const result = await confirmWorkspaceTransferRecipient(parsed.data.transferId);
  if (result.success) {
    revalidatePath("/", "layout");
    if (parsed.data.workspaceSlug) {
      revalidatePath(`/${parsed.data.workspaceSlug}/dashboard/team`);
    }
  }
  return result;
}
