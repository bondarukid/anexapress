"use server";

import { isWorkspaceSlugAvailable } from "@/services/workspace";
import { CheckSlugSchema } from "@/schemas/workspace.schema";

/** Debounced slug availability check for onboarding step 3. */
export async function checkWorkspaceSlugAction(
  slug: string,
  excludeWorkspaceId?: string,
  parentWorkspaceId?: string | null,
): Promise<{ available: boolean; error?: string }> {
  const parsed = CheckSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    return {
      available: false,
      error: parsed.error.issues[0]?.message ?? "Invalid slug.",
    };
  }

  const available = await isWorkspaceSlugAvailable(
    parsed.data.slug,
    excludeWorkspaceId,
    parentWorkspaceId,
  );
  return { available };
}
