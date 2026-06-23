"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { UpdateWorkspaceWebsiteSchema } from "@/schemas/workspace.schema";
import { updateWorkspaceWebsite } from "@/services/workspace";
import type { UpdateWorkspaceWebsiteResult } from "@/types/workspace";

/**
 * Updates the workspace public website URL from Branding settings.
 */
export async function updateWorkspaceWebsiteAction(
  input: unknown,
): Promise<UpdateWorkspaceWebsiteResult> {
  const parsed = UpdateWorkspaceWebsiteSchema.safeParse(input);
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

  const result = await updateWorkspaceWebsite(
    user.id,
    parsed.data.workspaceId,
    parsed.data.websiteUrl,
  );

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
