"use server";

import { revalidatePath } from "next/cache";

import { WorkspaceParentAttachIdSchema } from "@/schemas/workspace.schema";
import { finalizeWorkspaceParentAttach } from "@/services/workspace-parent-attach";

export async function finalizeParentAttachAction(input: unknown) {
  const parsed = WorkspaceParentAttachIdSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid attach request." };
  }

  const result = await finalizeWorkspaceParentAttach(parsed.data.transferId);
  if (result.success) {
    revalidatePath("/", "layout");
    if (parsed.data.parentSlug) {
      revalidatePath(`/${parsed.data.parentSlug}/dashboard/settings/workspace`);
    }
  }

  return result;
}
