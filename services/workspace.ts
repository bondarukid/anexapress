import { PERM_WORKSPACE_DELETE, PERM_WORKSPACE_UPDATE } from "@/lib/team/permissions";
import { createClient } from "@/lib/server";
import { provisionDefaultSite } from "@/services/site.service";
import { deriveWorkspaceDefaults } from "@/lib/ui/onboarding-feed-data";
import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import type { OnboardingGoalId } from "@/lib/onboarding/goals";
import { mapCreateWorkspaceRpcError } from "@/lib/workspace/map-create-workspace-rpc-error";
import { buildWorkspacePathKey } from "@/lib/workspace-family/paths";
import { hasEffectiveWorkspacePermission } from "@/lib/workspace-family/access";
import { resolveWorkspaceForUser } from "@/lib/workspace-family/resolve";
import {
  ACTIVE_WORKSPACE_SLUG_COOKIE,
  type CreateWorkspaceResult,
  type DeleteWorkspaceResult,
  type EnsurePersonalWorkspaceResult,
  type GetUserWorkspacesResult,
  type SaveWorkspaceOnboardingGoalsResult,
  type UpdateWorkspaceResult,
  type UpdateWorkspaceTimezoneResult,
  type UpdateWorkspaceWebsiteResult,
  type WorkspaceLogoResult,
  type WorkspaceSummary,
} from "@/types/workspace";

const WORKSPACE_LOGOS_BUCKET = "workspace-logos";

async function hasWorkspacePermission(workspaceId: string, permKey: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_workspace_permission", {
    ws_id: workspaceId,
    perm_key: permKey,
  });
  return data === true;
}

export type CreateWorkspaceWithOwnerParams = {
  userId: string;
  workspaceName: string;
  workspaceUrl: string;
  timezone?: string;
  profile: Record<string, string>;
  includeAlreadyHasWorkspaceInRpcErrors?: boolean;
};

export type PersonalWorkspaceProfileHint = {
  firstName?: string | null;
  lastName?: string | null;
};

export type UpdateWorkspaceSettingsParams = {
  workspaceName: string;
  workspaceUrl: string;
  timezone: string;
};

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url?: string | null;
  timezone?: string | null;
  parent_workspace_id?: string | null;
  parent?: { slug: string } | { slug: string }[] | null;
};

type WorkspaceMemberRow = {
  joined_at: string;
  roles: { slug: string } | { slug: string }[] | null;
  workspaces: WorkspaceRow | WorkspaceRow[] | null;
};

function mapWorkspaceRow(
  row: WorkspaceRow,
  roleSlug: string,
  parentSlug?: string | null,
): WorkspaceSummary {
  const isChild = Boolean(row.parent_workspace_id);
  const resolvedParentSlug = parentSlug ?? unwrapRelation(row.parent)?.slug ?? null;
  const pathKey =
    isChild && resolvedParentSlug
      ? buildWorkspacePathKey(resolvedParentSlug, row.slug)
      : row.slug;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url ?? null,
    timezone: row.timezone ?? FALLBACK_TIMEZONE,
    roleSlug,
    parentId: row.parent_workspace_id ?? null,
    parentSlug: resolvedParentSlug,
    isChild,
    pathKey,
  };
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapMemberRow(row: WorkspaceMemberRow): WorkspaceSummary | null {
  const workspace = unwrapRelation(row.workspaces);
  if (!workspace?.slug) return null;

  const role = unwrapRelation(row.roles);

  return mapWorkspaceRow(workspace, role?.slug ?? "member");
}

/**
 * Count active workspace memberships without nested workspace embeds.
 * Used as a safety net before auto-creating personal workspaces.
 */
export async function countActiveWorkspaceMemberships(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("[countActiveWorkspaceMemberships]", error.message);
    return 0;
  }

  return count ?? 0;
}

const WORKSPACE_MEMBER_SELECT = `
            joined_at,
            roles ( slug ),
            workspaces (
              id,
              name,
              slug,
              logo_url,
              website_url,
              timezone,
              parent_workspace_id,
              parent:parent_workspace_id ( slug )
            )
        `;

const WORKSPACE_MEMBER_SELECT_SIMPLE = `
            joined_at,
            roles ( slug ),
            workspaces (
              id,
              name,
              slug,
              logo_url,
              website_url,
              timezone,
              parent_workspace_id
            )
        `;

async function queryUserWorkspaces(
  userId: string,
  select: string,
): Promise<GetUserWorkspacesResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspace_members")
    .select(select)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("[getUserWorkspaces]", error.message);
    return { success: false, error: error.message };
  }

  const workspaces = (data ?? [])
    .map((row) => mapMemberRow(row as unknown as WorkspaceMemberRow))
    .filter((ws): ws is WorkspaceSummary => ws !== null);

  return { success: true, workspaces };
}

/**
 * Fetch all active workspaces for a user.
 * Relies on RLS: workspace_members SELECT allowed when user is a member.
 * Returns `{ success: false }` on query failure — never masks errors as an empty list.
 */
export async function getUserWorkspaces(userId: string): Promise<GetUserWorkspacesResult> {
  return queryUserWorkspaces(userId, WORKSPACE_MEMBER_SELECT);
}

/** Fallback loader without parent embed when the full query fails. */
async function getUserWorkspacesSimple(userId: string): Promise<GetUserWorkspacesResult> {
  return queryUserWorkspaces(userId, WORKSPACE_MEMBER_SELECT_SIMPLE);
}

/**
 * Loads workspace slug by id (for OAuth callbacks without session context on slug).
 */
export async function getWorkspaceById(workspaceId: string): Promise<{ id: string; slug: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, slug")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, slug: data.slug };
}

/**
 * Verify the user is an active member of a root workspace by slug.
 * For child workspaces use `resolveWorkspaceForUser`.
 */
export async function getWorkspaceBySlug(
  slug: string,
  userId: string,
): Promise<WorkspaceSummary | null> {
  return resolveWorkspaceForUser({ parentSlug: slug, userId });
}

export type ResolveWorkspacePathInput = {
  parentSlug: string;
  childSlug?: string | null;
  userId: string;
};

/** Resolve workspace from URL path segments (root or child). */
export async function resolveWorkspacePath(
  input: ResolveWorkspacePathInput,
): Promise<WorkspaceSummary | null> {
  return resolveWorkspaceForUser(input);
}

/**
 * Create a workspace with its owner role, membership, and optional profile update
 * via the `create_workspace_with_owner` RPC (atomic). Cache revalidation is the
 * caller's responsibility.
 */
export async function createWorkspaceWithOwner(
  params: CreateWorkspaceWithOwnerParams,
): Promise<CreateWorkspaceResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_workspace_with_owner", {
      p_name: params.workspaceName,
      p_slug: params.workspaceUrl,
      p_user_id: params.userId,
      p_profile: params.profile,
      p_timezone: params.timezone ?? FALLBACK_TIMEZONE,
    });

    if (error) {
      return mapCreateWorkspaceRpcError(error.message, {
        includeAlreadyHasWorkspace: params.includeAlreadyHasWorkspaceInRpcErrors,
      });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.id || !row?.slug) {
      return {
        success: false,
        error: "Workspace was created but response was invalid.",
      };
    }

    await provisionDefaultSite(row.id, params.userId);

    return {
      success: true,
      workspace: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        logoUrl: row.logo_url ?? null,
        websiteUrl: row.website_url ?? null,
        timezone: row.timezone ?? FALLBACK_TIMEZONE,
        roleSlug: "owner",
      },
    };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Check slug uniqueness within parent scope; optionally treat the current workspace slug as available. */
export async function isWorkspaceSlugAvailable(
  slug: string,
  excludeWorkspaceId?: string,
  parentWorkspaceId?: string | null,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("is_workspace_slug_available", {
    p_slug: slug,
    p_exclude_workspace_id: excludeWorkspaceId ?? null,
    p_parent_workspace_id: parentWorkspaceId ?? null,
  });

  if (error) {
    console.error("[isWorkspaceSlugAvailable]", error.message);
    return false;
  }

  return data === true;
}

/**
 * Resolve a unique slug by appending numeric suffixes when the base slug is taken.
 */
export async function generateAvailableSlug(
  baseSlug: string,
  parentWorkspaceId?: string | null,
): Promise<string> {
  const normalized = baseSlug.trim().toLowerCase();
  if (normalized.length < 3) {
    return generateAvailableSlug("my-workspace", parentWorkspaceId);
  }

  if (await isWorkspaceSlugAvailable(normalized, undefined, parentWorkspaceId)) {
    return normalized;
  }

  for (let i = 2; i <= 99; i += 1) {
    const suffix = `-${i}`;
    const maxBaseLen = 48 - suffix.length;
    const candidate = `${normalized.slice(0, maxBaseLen)}${suffix}`;
    if (await isWorkspaceSlugAvailable(candidate, undefined, parentWorkspaceId)) {
      return candidate;
    }
  }

  const fallbackSuffix = `-${Date.now().toString(36).slice(-4)}`;
  const maxBaseLen = 48 - fallbackSuffix.length;
  return `${normalized.slice(0, maxBaseLen)}${fallbackSuffix}`;
}

/**
 * Ensure the user has a personal workspace (auto-create on first self-signup).
 * No-op when memberships already exist.
 */
export async function ensurePersonalWorkspace(
  userId: string,
  profileHint: PersonalWorkspaceProfileHint,
): Promise<EnsurePersonalWorkspaceResult> {
  const membershipCount = await countActiveWorkspaceMemberships(userId);
  if (membershipCount > 0) {
    const existing = await getUserWorkspaces(userId);
    if (existing.success && existing.workspaces.length > 0) {
      return { success: true, workspace: existing.workspaces[0], created: false };
    }

    const fallback = await getUserWorkspacesSimple(userId);
    if (fallback.success && fallback.workspaces.length > 0) {
      return { success: true, workspace: fallback.workspaces[0], created: false };
    }

    return {
      success: false,
      error: "Could not load your workspaces. Please refresh the page.",
    };
  }

  const loaded = await getUserWorkspaces(userId);
  if (loaded.success && loaded.workspaces.length > 0) {
    return { success: true, workspace: loaded.workspaces[0], created: false };
  }

  if (!loaded.success) {
    return {
      success: false,
      error: "Could not verify your workspace membership. Please refresh the page.",
    };
  }

  const defaults = deriveWorkspaceDefaults(
    profileHint.firstName ?? "",
    profileHint.lastName ?? "",
  );

  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const slugBase =
      attempt === 0 ? defaults.workspaceUrl : `${defaults.workspaceUrl}-${attempt + 1}`;
    const slug = await generateAvailableSlug(slugBase);

    const result = await createWorkspaceWithOwner({
      userId,
      workspaceName: defaults.workspaceName,
      workspaceUrl: slug,
      profile: {},
    });

    if (result.success) {
      return { success: true, workspace: result.workspace, created: true };
    }

    if (result.code !== "slug_taken") {
      return { success: false, error: result.error };
    }
  }

  return {
    success: false,
    error: "Could not allocate a unique workspace URL. Please try again.",
  };
}

/**
 * Update workspace name and slug for an owner during onboarding configure.
 */
export async function updateWorkspaceSettings(
  userId: string,
  workspaceId: string,
  input: UpdateWorkspaceSettingsParams,
): Promise<UpdateWorkspaceResult> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canUpdate = await hasWorkspacePermission(workspaceId, PERM_WORKSPACE_UPDATE);
  if (!canUpdate) {
    return {
      success: false,
      error: "You do not have permission to update workspace settings.",
      code: "forbidden",
    };
  }

  const slugAvailable = await isWorkspaceSlugAvailable(
    input.workspaceUrl,
    workspaceId,
    membership.parentId ?? null,
  );
  if (!slugAvailable) {
    return {
      success: false,
      error: "This URL is already taken. Please choose another.",
      code: "slug_taken",
    };
  }

  const slugChanged = membership.slug !== input.workspaceUrl;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      name: input.workspaceName.trim(),
      slug: input.workspaceUrl.trim(),
      timezone: input.timezone,
    })
    .eq("id", workspaceId)
    .select("id, name, slug, logo_url, website_url, timezone")
    .single();

  if (error || !data) {
    console.error("[updateWorkspaceSettings]", error?.message);
    return { success: false, error: error?.message ?? "Failed to update workspace." };
  }

  return {
    success: true,
    workspace: mapWorkspaceRow(data, membership.roleSlug),
    slugChanged,
  };
}

/**
 * Update workspace default timezone (requires `workspace.update` permission).
 */
export async function updateWorkspaceTimezone(
  userId: string,
  workspaceId: string,
  timezone: string,
): Promise<UpdateWorkspaceTimezoneResult> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canUpdate = await hasWorkspacePermission(workspaceId, PERM_WORKSPACE_UPDATE);
  if (!canUpdate) {
    return {
      success: false,
      error: "You do not have permission to update workspace settings.",
      code: "forbidden",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .update({ timezone })
    .eq("id", workspaceId)
    .select("id, name, slug, logo_url, website_url, timezone")
    .single();

  if (error || !data) {
    console.error("[updateWorkspaceTimezone]", error?.message);
    return { success: false, error: error?.message ?? "Failed to update timezone." };
  }

  return {
    success: true,
    workspace: mapWorkspaceRow(data, membership.roleSlug),
  };
}

/**
 * Update workspace public website URL (requires `workspace.update` permission).
 */
export async function updateWorkspaceWebsite(
  userId: string,
  workspaceId: string,
  websiteUrl: string | null,
): Promise<UpdateWorkspaceWebsiteResult> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canUpdate = await hasWorkspacePermission(workspaceId, PERM_WORKSPACE_UPDATE);
  if (!canUpdate) {
    return {
      success: false,
      error: "You do not have permission to update workspace settings.",
      code: "forbidden",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .update({ website_url: websiteUrl })
    .eq("id", workspaceId)
    .select("id, name, slug, logo_url, website_url, timezone")
    .single();

  if (error || !data) {
    console.error("[updateWorkspaceWebsite]", error?.message);
    return { success: false, error: error?.message ?? "Failed to update website." };
  }

  return {
    success: true,
    workspace: mapWorkspaceRow(data, membership.roleSlug),
  };
}

/**
 * Persist onboarding goal selections on a workspace (owner-only).
 */
export async function saveWorkspaceOnboardingGoals(
  userId: string,
  workspaceId: string,
  goals: OnboardingGoalId[],
): Promise<SaveWorkspaceOnboardingGoalsResult> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canUpdate = await hasWorkspacePermission(workspaceId, PERM_WORKSPACE_UPDATE);
  if (!canUpdate) {
    return {
      success: false,
      error: "You do not have permission to update workspace settings.",
      code: "forbidden",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ onboarding_goals: goals })
    .eq("id", workspaceId);

  if (error) {
    console.error("[saveWorkspaceOnboardingGoals]", error.message);
    return { success: false, error: error.message ?? "Failed to save onboarding goals." };
  }

  return { success: true };
}

function workspaceLogoStoragePaths(workspaceId: string) {
  return [
    `${workspaceId}/logo.png`,
    `${workspaceId}/logo.jpg`,
    `${workspaceId}/logo.jpeg`,
    `${workspaceId}/logo.webp`,
  ];
}

/**
 * Replace a workspace logo in storage and persist the public URL on `workspaces.logo_url`.
 */
export async function uploadWorkspaceLogo(
  userId: string,
  workspaceId: string,
  file: File,
): Promise<WorkspaceLogoResult> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canUpdate = await hasWorkspacePermission(workspaceId, PERM_WORKSPACE_UPDATE);
  if (!canUpdate) {
    return {
      success: false,
      error: "You do not have permission to update the workspace logo.",
      code: "forbidden",
    };
  }

  const supabase = await createClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${workspaceId}/logo.${fileExt}`;

  await supabase.storage.from(WORKSPACE_LOGOS_BUCKET).remove(workspaceLogoStoragePaths(workspaceId));

  const { error: uploadError } = await supabase.storage
    .from(WORKSPACE_LOGOS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "0",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(WORKSPACE_LOGOS_BUCKET).getPublicUrl(filePath);

  const finalUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("workspaces")
    .update({ logo_url: finalUrl })
    .eq("id", workspaceId);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  return { success: true, logoUrl: finalUrl };
}

/** Remove workspace logo files and clear `workspaces.logo_url`. */
export async function removeWorkspaceLogo(
  userId: string,
  workspaceId: string,
): Promise<{ success: true } | { success: false; error: string; code?: "not_found" | "forbidden" }> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canUpdate = await hasWorkspacePermission(workspaceId, PERM_WORKSPACE_UPDATE);
  if (!canUpdate) {
    return {
      success: false,
      error: "You do not have permission to remove the workspace logo.",
      code: "forbidden",
    };
  }

  const supabase = await createClient();
  await supabase.storage.from(WORKSPACE_LOGOS_BUCKET).remove(workspaceLogoStoragePaths(workspaceId));

  const { error } = await supabase
    .from("workspaces")
    .update({ logo_url: null })
    .eq("id", workspaceId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Permanently delete a workspace when permitted and no other active members remain.
 */
export async function deleteWorkspace(
  userId: string,
  workspaceId: string,
): Promise<DeleteWorkspaceResult> {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) {
    return { success: false, error: "Workspace not found.", code: "not_found" };
  }

  const canDelete = await hasEffectiveWorkspacePermission(workspaceId, PERM_WORKSPACE_DELETE);
  if (!canDelete) {
    return {
      success: false,
      error: "You do not have permission to delete this workspace.",
      code: "forbidden",
    };
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  if (countError) {
    return { success: false, error: countError.message };
  }

  if ((count ?? 0) > 1) {
    return {
      success: false,
      error: "Transfer ownership or remove other members before deleting this workspace.",
      code: "has_members",
    };
  }

  await supabase.storage.from(WORKSPACE_LOGOS_BUCKET).remove(workspaceLogoStoragePaths(workspaceId));

  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

async function getWorkspaceMembership(
  userId: string,
  workspaceId: string,
): Promise<(WorkspaceSummary & { slug: string }) | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
            roles ( slug ),
            workspaces!inner (
              id,
              name,
              slug,
              logo_url,
              website_url,
              timezone,
              parent_workspace_id,
              parent:parent_workspace_id ( slug )
            )
        `,
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as WorkspaceMemberRow;
  const mapped = mapMemberRow(row);
  if (!mapped) return null;

  return mapped;
}

/**
 * Pick default workspace: cookie match first, otherwise earliest joined.
 */
export function resolveDefaultWorkspace(
  workspaces: WorkspaceSummary[],
  activeSlugFromCookie?: string | null,
): WorkspaceSummary | null {
  if (workspaces.length === 0) return null;

  if (activeSlugFromCookie) {
    const match = workspaces.find(
      (ws) => ws.pathKey === activeSlugFromCookie || ws.slug === activeSlugFromCookie,
    );
    if (match) return match;
  }

  return workspaces[0];
}

export { ACTIVE_WORKSPACE_SLUG_COOKIE };
