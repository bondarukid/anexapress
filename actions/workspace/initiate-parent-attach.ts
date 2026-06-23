"use server";

import { revalidatePath } from "next/cache";

import { AttachWorkspaceToParentSchema } from "@/schemas/workspace.schema";
import { initiateWorkspaceParentAttach } from "@/services/workspace-parent-attach";

export async function initiateParentAttachAction(input: unknown) {
  const parsed = AttachWorkspaceToParentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const result = await initiateWorkspaceParentAttach({
    sourceWorkspaceId: parsed.data.workspaceId,
    parentWorkspaceId: parsed.data.parentWorkspaceId,
    acceptorUserId: parsed.data.acceptorUserId,
  });

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
