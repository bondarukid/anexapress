"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import {
  WorkspaceLogoFileSchema,
  WorkspaceLogoMutationSchema,
} from "@/schemas/workspace.schema";
import { removeWorkspaceLogo, uploadWorkspaceLogo } from "@/services/workspace";
import type { WorkspaceLogoResult } from "@/types/workspace";

/**
 * Upload or replace the workspace logo (owner-only).
 */
export async function uploadWorkspaceLogoAction(
  formData: FormData,
): Promise<WorkspaceLogoResult> {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const parsedMeta = WorkspaceLogoMutationSchema.safeParse({ workspaceId });
  if (!parsedMeta.success) {
    return {
      success: false,
      error: parsedMeta.error.issues[0]?.message ?? "Invalid workspace.",
    };
  }

  const parsedFile = WorkspaceLogoFileSchema.safeParse(formData.get("logoFile"));
  if (!parsedFile.success) {
    return {
      success: false,
      error: parsedFile.error.issues[0]?.message ?? "No file selected.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const result = await uploadWorkspaceLogo(user.id, parsedMeta.data.workspaceId, parsedFile.data);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}

/** Remove the workspace logo (owner-only). */
export async function removeWorkspaceLogoAction(input: {
  workspaceId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = WorkspaceLogoMutationSchema.safeParse(input);
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

  const result = await removeWorkspaceLogo(user.id, parsed.data.workspaceId);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
