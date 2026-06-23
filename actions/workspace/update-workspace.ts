"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { UpdateWorkspaceSettingsSchema } from "@/schemas/workspace.schema";
import { updateWorkspaceSettings } from "@/services/workspace";
import type { UpdateWorkspaceResult } from "@/types/workspace";

/**
 * Updates workspace name and slug during onboarding configure or settings flows.
 */
export async function updateWorkspaceSettingsAction(
  input: unknown,
): Promise<UpdateWorkspaceResult> {
  const parsed = UpdateWorkspaceSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const result = await updateWorkspaceSettings(user.id, parsed.data.workspaceId, {
    workspaceName: parsed.data.workspaceName,
    workspaceUrl: parsed.data.workspaceUrl,
    timezone: parsed.data.timezone,
  });

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
