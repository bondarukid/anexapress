"use server";

import { revalidatePath } from "next/cache";

import { assertCanUnlinkOAuth, type AuthIdentity } from "@/lib/auth/linked-accounts";
import { getSiteOrigin } from "@/lib/auth/site-origin";
import { createClient } from "@/lib/server";
import {
  EnableEmailLoginSchema,
  OAuthProviderSchema,
  type OAuthProvider,
} from "@/schemas/auth-schema";
import type { LinkedAccountActionResult, LinkOAuthResult } from "@/types/auth";

const settingsAccountPath = "/dashboard/settings/account";

/**
 * Starts the OAuth flow to link Google or GitHub to the currently signed-in user.
 * Returns a redirect URL — the client must navigate to it (window.location.href).
 */
export async function linkOAuthAccount(provider: OAuthProvider): Promise<LinkOAuthResult> {
  const parsedProvider = OAuthProviderSchema.safeParse(provider);
  if (!parsedProvider.success) {
    return { error: "Invalid OAuth provider." };
  }

  const origin = getSiteOrigin();
  if (!origin) {
    return { error: "Missing NEXT_PUBLIC_SITE_URL." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to link an account." };
  }

  const { data, error } = await supabase.auth.linkIdentity({
    provider: parsedProvider.data,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(settingsAccountPath)}`,
    },
  });

  if (error) return { error: error.message };
  if (data?.url) return { url: data.url };

  return { error: "Failed to generate linking URL." };
}

/**
 * Removes a linked OAuth identity from the current user.
 * Re-validates business rules server-side before calling Supabase.
 */
export async function unlinkOAuthAccount(
  provider: OAuthProvider,
): Promise<LinkedAccountActionResult> {
  const parsedProvider = OAuthProviderSchema.safeParse(provider);
  if (!parsedProvider.success) {
    return { success: false, error: "Invalid OAuth provider." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { data: identitiesData, error: identitiesError } = await supabase.auth.getUserIdentities();

  if (identitiesError) {
    return { success: false, error: identitiesError.message };
  }

  const identities = identitiesData?.identities ?? [];
  const authIdentities = identities as AuthIdentity[];

  const guardError = assertCanUnlinkOAuth(authIdentities, parsedProvider.data);
  if (guardError) {
    return { success: false, error: guardError };
  }

  const identity = identities.find((item) => item.provider === parsedProvider.data);
  if (!identity) {
    return { success: false, error: "Identity not found." };
  }

  const { error } = await supabase.auth.unlinkIdentity(identity);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Adds email+password login to an OAuth-only account (Supabase FAQ pattern).
 * Once set, the email card becomes read-only and OAuth accounts can be unlinked.
 */
export async function enableEmailLogin(password: string): Promise<LinkedAccountActionResult> {
  const parsed = EnableEmailLoginSchema.safeParse({ password });
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
    return { success: false, error: "You must be logged in." };
  }

  const { data: identitiesData } = await supabase.auth.getUserIdentities();
  const identities = (identitiesData?.identities ?? []) as AuthIdentity[];

  if (identities.some((identity) => identity.provider === "email")) {
    return { success: false, error: "Email login is already configured." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
