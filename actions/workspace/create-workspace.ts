"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { normalizeCountryCode } from "@/lib/countries";
import { ENABLE_MULTI_WORKSPACE } from "@/lib/config/feature-flags";
import { WORKSPACE_OWNER_POSITION } from "@/lib/ui/onboarding-feed-data";
import { createWorkspaceWithOwner, countActiveWorkspaceMemberships, getUserWorkspaces } from "@/services/workspace";
import {
  CreateAdditionalWorkspaceSchema,
  CreateWorkspaceSchema,
  type CreateAdditionalWorkspaceInput,
  type CreateWorkspaceInput,
} from "@/schemas/workspace.schema";
import type { CreateWorkspaceResult } from "@/types/workspace";

/**
 * Creates a workspace, owner role, membership, and optional profile update atomically.
 * Called from onboarding onComplete — only allowed when user has zero active memberships.
 */
export async function createWorkspaceAction(
  input: CreateWorkspaceInput,
): Promise<CreateWorkspaceResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = CreateWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const membershipCount = await countActiveWorkspaceMemberships(user.id);
  if (membershipCount > 0) {
    return {
      success: false,
      error: "You already belong to a workspace.",
      code: "already_has_workspace",
    };
  }

  const existing = await getUserWorkspaces(user.id);
  if (existing.success && existing.workspaces.length > 0) {
    return {
      success: false,
      error: "You already belong to a workspace.",
      code: "already_has_workspace",
    };
  }

  const profilePayload: Record<string, string> = {
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    position: WORKSPACE_OWNER_POSITION,
  };
  const countryCode = normalizeCountryCode(parsed.data.country);
  if (countryCode) profilePayload.country = countryCode;
  if (parsed.data.gender) profilePayload.gender = parsed.data.gender;
  if (parsed.data.mobile) profilePayload.mobile = parsed.data.mobile;

  const result = await createWorkspaceWithOwner({
    userId: user.id,
    workspaceName: parsed.data.workspaceName,
    workspaceUrl: parsed.data.workspaceUrl,
    timezone: parsed.data.timezone,
    profile: profilePayload,
    includeAlreadyHasWorkspaceInRpcErrors: true,
  });

  if (result.success) revalidatePath("/", "layout");
  return result;
}

/**
 * Creates an owned workspace for users who already have memberships.
 * Does not update the user profile (empty p_profile).
 */
export async function createOwnedWorkspaceAction(
  input: CreateAdditionalWorkspaceInput,
): Promise<CreateWorkspaceResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = CreateAdditionalWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  if (!ENABLE_MULTI_WORKSPACE) {
    return {
      success: false,
      error: "Multiple workspaces are disabled on this deployment.",
    };
  }

  const result = await createWorkspaceWithOwner({
    userId: user.id,
    workspaceName: parsed.data.workspaceName,
    workspaceUrl: parsed.data.workspaceUrl,
    timezone: parsed.data.timezone,
    profile: {
      position: WORKSPACE_OWNER_POSITION,
    },
  });

  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function createAdditionalWorkspaceAction(
  input: CreateAdditionalWorkspaceInput,
): Promise<CreateWorkspaceResult> {
  return createOwnedWorkspaceAction(input);
}
