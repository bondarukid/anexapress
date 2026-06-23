"use server";

import { revalidatePath } from "next/cache";

import { WorkspaceParentAttachIdSchema } from "@/schemas/workspace.schema";
import { cancelWorkspaceParentAttach } from "@/services/workspace-parent-attach";

export async function cancelParentAttachAction(input: unknown) {
  const parsed = WorkspaceParentAttachIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid attach request." };
  }

  const result = await cancelWorkspaceParentAttach(parsed.data.transferId);
  if (result.success) {
    revalidatePath("/", "layout");
    if (parsed.data.parentSlug) {
      revalidatePath(`/${parsed.data.parentSlug}/dashboard/settings/workspace`);
    }
  }

  return result;
}
