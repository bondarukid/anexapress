"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { DeleteWorkspaceSchema } from "@/schemas/workspace.schema";
import { deleteWorkspace } from "@/services/workspace";
import type { DeleteWorkspaceResult } from "@/types/workspace";

/**
 * Permanently delete a solo-owned workspace (owner-only).
 */
export async function deleteWorkspaceAction(input: {
  workspaceId: string;
  workspaceSlug?: string;
}): Promise<DeleteWorkspaceResult> {
  const parsed = DeleteWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid workspace.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const result = await deleteWorkspace(user.id, parsed.data.workspaceId);

  if (result.success) {
    revalidatePath("/", "layout");
    if (parsed.data.workspaceSlug) {
      revalidatePath(`/${parsed.data.workspaceSlug}`, "layout");
    }
  }

  return result;
}
