// services/user.ts
import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/admin";
import { createClient } from "@/lib/server";
import type { DeleteAccountResponse, UpdateProfileTimezoneResult, UserProfile } from "@/types/user";
import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  position: string | null;
  country: string | null;
  gender: string | null;
  mobile: string | null;
  avatar_url: string | null;
  timezone: string;
  onboarding_completed_at: string | null;
};

function stringFromMetadata(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/** Minimal profile from Supabase Auth when `profiles` row is missing or unreadable. */
function profileFromAuthUser(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: stringFromMetadata(user.user_metadata?.first_name),
    lastName: stringFromMetadata(user.user_metadata?.last_name),
    company: null,
    position: null,
    country: null,
    gender: null,
    mobile: null,
    avatarUrl: null,
    timezone: FALLBACK_TIMEZONE,
    onboardingCompletedAt: null,
  };
}

function mapProfileRow(user: User, profile: ProfileRow): UserProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: profile.first_name,
    lastName: profile.last_name,
    company: profile.company,
    position: profile.position,
    country: profile.country,
    gender: profile.gender,
    mobile: profile.mobile,
    avatarUrl: profile.avatar_url,
    timezone: profile.timezone ?? FALLBACK_TIMEZONE,
    onboardingCompletedAt: profile.onboarding_completed_at,
  };
}

/**
 * Returns the signed-in user's profile for dashboard UI.
 * Falls back to auth metadata when the `profiles` row is missing so middleware
 * and layouts do not ping-pong between `/login` and tenant dashboard URLs.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error: dbError } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, company, position, country, gender, mobile, avatar_url, timezone, onboarding_completed_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (dbError) {
    console.error("[getCurrentUser]", dbError.message);
    return profileFromAuthUser(user);
  }

  if (!profile) {
    return profileFromAuthUser(user);
  }

  return mapProfileRow(user, profile as ProfileRow);
}

type EnsureUserProfileHint = {
  firstName?: string;
  lastName?: string;
};

/**
 * Ensures a `profiles` row exists for a newly registered user.
 * No-op when the row is already present.
 */
export async function ensureUserProfile(
  userId: string,
  hint?: EnsureUserProfileHint,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    return { error: readError.message };
  }

  if (existing) {
    return { error: null };
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    first_name: hint?.firstName ?? null,
    last_name: hint?.lastName ?? null,
  });

  return { error: insertError?.message ?? null };
}

/** Mark blocking onboarding as finished for the current user. */
export async function markOnboardingCompleted(userId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

function avatarStoragePaths(userId: string): string[] {
  return [
    `${userId}/avatar.png`,
    `${userId}/avatar.jpg`,
    `${userId}/avatar.jpeg`,
    `${userId}/avatar.webp`,
  ];
}

/** Update arbitrary `profiles` columns for a user. Columns are already snake_cased. */
export async function updateProfileColumns(
  userId: string,
  columns: Record<string, string | null | undefined>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(columns).eq("id", userId);
  return { error: error?.message ?? null };
}

/** Update the signed-in user's personal timezone preference. */
export async function updateProfileTimezone(
  userId: string,
  timezone: string,
): Promise<UpdateProfileTimezoneResult> {
  const { error } = await updateProfileColumns(userId, { timezone });

  if (error) {
    return { success: false, error };
  }

  return { success: true, timezone };
}

/** Replace the user's avatar: clean old files, upload, and store the public URL. */
export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<{ success: true; avatarUrl: string } | { success: false; error: string }> {
  const supabase = await createClient();

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${userId}/avatar.${fileExt}`;

  await supabase.storage.from("avatars").remove(avatarStoragePaths(userId));

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
    cacheControl: "0",
    upsert: true,
  });

  if (uploadError) return { success: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: finalUrl })
    .eq("id", userId);

  if (dbError) return { success: false, error: dbError.message };

  return { success: true, avatarUrl: finalUrl };
}

/** Remove the user's avatar files and clear the stored URL. */
export async function removeUserAvatar(userId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  await supabase.storage.from("avatars").remove(avatarStoragePaths(userId));
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
  return { error: error?.message ?? null };
}

/** Verify the current password, then set a new one via Supabase Auth. */
export async function changeUserPassword(input: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.currentPassword,
  });

  if (authError) {
    return { success: false, error: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

function mapDeleteAccountPrepError(error: { message?: string; details?: string }): string {
  const message = error.message ?? "";

  if (message.includes("unauthorized")) {
    return "Session expired or unauthorized.";
  }

  return `Database Error: ${message || "Failed to prepare account deletion."}`;
}

/**
 * Delete the current user's account: optional solo-workspace confirmation, avatar
 * cleanup, RPC-based data teardown, and auth user removal. Cache revalidation and
 * redirect are the caller's responsibility.
 */
export async function deleteUserAccount(options: {
  deleteSoloWorkspaces: boolean;
}): Promise<DeleteAccountResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired or user not found." };
    }

    const userId = user.id;
    const adminClient = await createAdminClient();

    if (!options.deleteSoloWorkspaces) {
      const { data: soloWorkspaces, error: soloError } = await adminClient.rpc(
        "get_solo_owned_workspaces",
        { p_user_id: userId },
      );

      if (soloError) {
        return { success: false, error: mapDeleteAccountPrepError(soloError) };
      }

      const mappedSoloWorkspaces = (soloWorkspaces ?? []).map(
        (row: { id: string; name: string; slug: string; logo_url: string | null }) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          logoUrl: row.logo_url,
        }),
      );

      if (mappedSoloWorkspaces.length > 0) {
        return {
          success: false,
          requiresSoloWorkspaceConfirmation: true,
          soloWorkspaces: mappedSoloWorkspaces,
        };
      }
    }

    await supabase.storage
      .from("avatars")
      .remove([
        `${userId}/avatar.png`,
        `${userId}/avatar.jpg`,
        `${userId}/avatar.jpeg`,
        `${userId}/avatar.webp`,
      ]);

    const { error: prepError } = await adminClient.rpc("prepare_user_account_deletion", {
      p_user_id: userId,
      p_delete_solo_workspaces: options.deleteSoloWorkspaces,
    });

    if (prepError) {
      return { success: false, error: mapDeleteAccountPrepError(prepError) };
    }

    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      return { success: false, error: `Auth Deletion Error: ${authError.message}` };
    }

    await supabase.auth.signOut();
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return { success: false, error: message };
  }
}
