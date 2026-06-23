"use server";

import { revalidatePath } from "next/cache";

import { normalizeOnboardingGoals } from "@/lib/onboarding/goals";
import { createClient } from "@/lib/server";
import { SaveWorkspaceOnboardingGoalsSchema } from "@/schemas/onboarding.schema";
import { saveWorkspaceOnboardingGoals } from "@/services/workspace";
import type { SaveWorkspaceOnboardingGoalsResult } from "@/types/workspace";

/** Persists step-2 onboarding goals onto the active workspace. */
export async function saveWorkspaceOnboardingGoalsAction(
  input: unknown,
): Promise<SaveWorkspaceOnboardingGoalsResult> {
  const parsed = SaveWorkspaceOnboardingGoalsSchema.safeParse(input);
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

  const goals = normalizeOnboardingGoals(parsed.data.goals);
  if (goals.length === 0) {
    return { success: false, error: "Select at least one goal." };
  }

  const result = await saveWorkspaceOnboardingGoals(user.id, parsed.data.workspaceId, goals);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
