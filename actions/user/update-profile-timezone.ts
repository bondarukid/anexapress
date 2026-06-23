"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { UpdateProfileTimezoneSchema } from "@/schemas/user-schema";
import { updateProfileTimezone } from "@/services/user";
import type { UpdateProfileTimezoneResult } from "@/types/user";

/**
 * Updates the signed-in user's personal timezone from Account settings.
 */
export async function updateProfileTimezoneAction(
  input: unknown,
): Promise<UpdateProfileTimezoneResult> {
  const parsed = UpdateProfileTimezoneSchema.safeParse(input);
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

  const result = await updateProfileTimezone(user.id, parsed.data.timezone);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
