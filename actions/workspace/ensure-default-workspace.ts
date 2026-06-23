"use server";

import { revalidatePath } from "next/cache";

import { shouldSkipPersonalWorkspaceCreation } from "@/lib/onboarding/should-skip-personal-workspace";
import { ensureUserProfile, getCurrentUser } from "@/services/user";
import { ensurePersonalWorkspace } from "@/services/workspace";
import type { EnsurePersonalWorkspaceResult } from "@/types/workspace";

const SESSION_EXPIRED_ERROR = "Session expired. Please sign in again.";

/**
 * Ensures the signed-in user has a personal workspace unless they are on an invite path.
 * Used by dashboard layouts and auth callback fallback.
 */
export async function ensureDefaultWorkspaceAction(): Promise<EnsurePersonalWorkspaceResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: SESSION_EXPIRED_ERROR };
  }

  const skip = await shouldSkipPersonalWorkspaceCreation(user.email);
  if (skip) {
    const { getUserWorkspaces } = await import("@/services/workspace");
    const workspacesResult = await getUserWorkspaces(user.id);
    if (!workspacesResult.success) {
      return {
        success: false,
        error: "Could not load your workspaces. Please refresh the page.",
      };
    }
    if (workspacesResult.workspaces.length === 0) {
      return {
        success: false,
        error: "No workspace yet. Complete your invite to continue.",
      };
    }
    return { success: true, workspace: workspacesResult.workspaces[0], created: false };
  }

  const profileResult = await ensureUserProfile(user.id, {
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
  });
  if (profileResult.error) {
    console.error("[ensureDefaultWorkspaceAction] ensureUserProfile failed", {
      userId: user.id,
      email: user.email,
      error: profileResult.error,
    });
    return {
      success: false,
      error: "Your profile could not be initialized. Please try again.",
    };
  }

  const result = await ensurePersonalWorkspace(user.id, {
    firstName: user.firstName,
    lastName: user.lastName,
  });

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
