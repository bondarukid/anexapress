"use server";

import { revalidatePath } from "next/cache";

import { normalizeCountryCode } from "@/lib/countries";
import { createClient } from "@/lib/server";
import { WORKSPACE_OWNER_POSITION } from "@/lib/ui/onboarding-feed-data";
import { ensureUserProfile, updateProfileColumns } from "@/services/user";
import { getUserWorkspaces } from "@/services/workspace";
import type { NotificationActionResult } from "@/types/notification";
import { CompleteProfileSchema, type CompleteProfileInput } from "@/schemas/user-schema";

export type { CompleteProfileInput } from "@/schemas/user-schema";

export async function completeProfileAction(
  input: CompleteProfileInput,
): Promise<NotificationActionResult> {
  const parsed = CompleteProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const profileEnsure = await ensureUserProfile(user.id, {
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
    });
    if (profileEnsure.error) {
      return { success: false, error: profileEnsure.error };
    }

    const payload: Record<string, string> = {
      first_name: parsed.data.firstName.trim(),
      last_name: parsed.data.lastName.trim(),
    };

    const countryCode = normalizeCountryCode(parsed.data.country);
    if (countryCode) payload.country = countryCode;
    if (parsed.data.gender?.trim()) payload.gender = parsed.data.gender.trim();
    if (parsed.data.mobile?.trim()) payload.mobile = parsed.data.mobile.trim();
    payload.timezone = parsed.data.timezone.trim();

    const workspacesResult = await getUserWorkspaces(user.id);
    const workspaces = workspacesResult.success ? workspacesResult.workspaces : [];
    if (workspaces.some((workspace) => workspace.roleSlug === "owner")) {
      payload.position = WORKSPACE_OWNER_POSITION;
    }

    const { error } = await updateProfileColumns(user.id, payload);

    if (error) {
      return { success: false, error };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}
