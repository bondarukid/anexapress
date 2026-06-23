"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapSignUpAuthError } from "@/lib/auth/map-signup-error";
import { getSiteOrigin } from "@/lib/auth/site-origin";
import { isWorkspaceInviteNextPath, resolveSafeNextPath } from "@/lib/auth/resolve-next-path";
import { shouldSkipPersonalWorkspaceCreation } from "@/lib/onboarding/should-skip-personal-workspace";
import { workspacePath } from "@/lib/routing/workspace-paths";
import { createClient } from "@/lib/server";
import { ensureUserProfile } from "@/services/user";
import { ensurePersonalWorkspace } from "@/services/workspace";
import {
  OAuthProviderSchema,
  PasswordResetEmailSchema,
  RecoveryPasswordSchema,
  SignInCredentialsSchema,
  SignUpCredentialsSchema,
  type OAuthProvider,
} from "@/schemas/auth-schema";
import type { AuthActionState, OAuthRedirectResult } from "@/types/auth";

export type { AuthActionState, OAuthRedirectResult } from "@/types/auth";

const dashboardPath = "/dashboard";

/** Registers a user via Supabase Auth. */
export async function signUp(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = SignUpCredentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    firstName: String(formData.get("firstname") ?? "").trim() || undefined,
    lastName: String(formData.get("lastname") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { email, password, firstName, lastName } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    return { error: mapSignUpAuthError(error.message) };
  }

  if (!data.session) {
    return {
      info: "Check your email to confirm your account, then sign in.",
    };
  }

  if (!data.user) {
    return { error: "Account was created but the session is invalid. Please sign in." };
  }

  revalidatePath(dashboardPath);

  const nextPath = resolveSafeNextPath(String(formData.get("next") ?? ""), dashboardPath);
  if (isWorkspaceInviteNextPath(nextPath)) {
    return { redirectTo: nextPath };
  }

  const profileResult = await ensureUserProfile(data.user.id, { firstName, lastName });
  if (profileResult.error) {
    console.error("[signUp] ensureUserProfile failed", {
      userId: data.user.id,
      email,
      error: profileResult.error,
    });
    return {
      error: "Your account was created, but profile setup failed. Please sign in and try again.",
    };
  }

  const skipPersonal = await shouldSkipPersonalWorkspaceCreation(email);
  if (!skipPersonal) {
    const ensured = await ensurePersonalWorkspace(data.user.id, { firstName, lastName });
    if (ensured.success) {
      return { redirectTo: workspacePath(ensured.workspace.slug) };
    }

    console.error("[signUp] ensurePersonalWorkspace failed", {
      userId: data.user.id,
      email,
      error: ensured.success ? null : ensured.error,
    });
    return {
      error:
        ensured.error ??
        "Your account was created, but workspace setup failed. Please sign in to try again.",
    };
  }

  return { redirectTo: nextPath };
}

/** Password login; Supabase persists session cookies via `@supabase/ssr` integration in `createClient`. */
export async function signIn(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  try {
    const parsed = SignInCredentialsSchema.safeParse({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(dashboardPath);

    const nextPath = resolveSafeNextPath(String(formData.get("next") ?? ""), dashboardPath);
    return { redirectTo: nextPath };
  } catch (error) {
    console.error("[signIn] unexpected error", error);
    return { error: "Could not reach the server. Refresh the page and try again." };
  }
}

/**
 * Starts Google or GitHub OAuth sign-in via SSR (`createClient` + PKCE cookies).
 * Client receives the provider URL and redirects with `window.location.href`.
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<OAuthRedirectResult> {
  const parsed = OAuthProviderSchema.safeParse(provider);
  if (!parsed.success) {
    return { error: "Invalid OAuth provider." };
  }

  const origin = getSiteOrigin();
  if (!origin) {
    return { error: "Missing NEXT_PUBLIC_SITE_URL." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsed.data,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(dashboardPath)}`,
      ...(parsed.data === "google"
        ? {
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          }
        : {}),
    },
  });

  if (error) return { error: error.message };
  if (data?.url) return { url: data.url };

  return { error: `Failed to start ${parsed.data} sign-in.` };
}

export async function signInWithGoogle(): Promise<OAuthRedirectResult> {
  return signInWithOAuth("google");
}

export async function signInWithGitHub(): Promise<OAuthRedirectResult> {
  return signInWithOAuth("github");
}

/** Sends Supabase recovery email; user completes reset via `/auth/callback` → `/login?mode=set-password`. */
export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const origin = getSiteOrigin();
  if (!origin) {
    return {
      error: "Missing NEXT_PUBLIC_SITE_URL (needed for reset email redirect).",
    };
  }

  const parsed = PasswordResetEmailSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    info: "If an account exists for this email, you will receive reset instructions shortly.",
  };
}

/** Runs while recovery session cookies exist (after `exchangeCodeForSession` in `/auth/callback`). */
export async function updatePasswordAfterRecovery(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = RecoveryPasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(dashboardPath);
  return { redirectTo: dashboardPath };
}

/** Clears Supabase cookies (handled by SSR client) and returns user to `/login`. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
