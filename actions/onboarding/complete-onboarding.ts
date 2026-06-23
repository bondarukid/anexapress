"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { markOnboardingCompleted } from "@/services/user";
import type { NotificationActionResult } from "@/types/notification";

/** Marks blocking onboarding as complete for the signed-in user. */
export async function completeOnboardingAction(): Promise<NotificationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const { error } = await markOnboardingCompleted(user.id);
  if (error) {
    return { success: false, error };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
