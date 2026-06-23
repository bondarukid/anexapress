"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { UpdateWorkspaceTimezoneSchema } from "@/schemas/workspace.schema";
import { updateWorkspaceTimezone } from "@/services/workspace";
import type { UpdateWorkspaceTimezoneResult } from "@/types/workspace";

/**
 * Updates the workspace default timezone from General settings.
 */
export async function updateWorkspaceTimezoneAction(
  input: unknown,
): Promise<UpdateWorkspaceTimezoneResult> {
  const parsed = UpdateWorkspaceTimezoneSchema.safeParse(input);
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

  const result = await updateWorkspaceTimezone(
    user.id,
    parsed.data.workspaceId,
    parsed.data.timezone,
  );

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
