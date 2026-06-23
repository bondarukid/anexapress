import { createClient } from "@/lib/server";
import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import { buildWorkspacePathKey } from "@/lib/workspace-family/paths";
import type { ResolveWorkspaceInput, ResolvedWorkspace } from "@/lib/workspace-family/types";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  timezone: string | null;
  parent_workspace_id: string | null;
  parent:
    | { id: string; slug: string }
    | { id: string; slug: string }[]
    | null;
};

const WORKSPACE_SELECT = `
  id,
  name,
  slug,
  logo_url,
  website_url,
  timezone,
  parent_workspace_id,
  parent:parent_workspace_id ( id, slug )
`;

async function mapWorkspaceRowForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceRow: WorkspaceRow,
  userId: string,
): Promise<ResolvedWorkspace | null> {
  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("roles ( slug )")
    .eq("workspace_id", workspaceRow.id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError || !membership) return null;

  const role = Array.isArray(membership.roles) ? membership.roles[0] : membership.roles;
  const parent = Array.isArray(workspaceRow.parent) ? workspaceRow.parent[0] : workspaceRow.parent;
  const parentSlug = parent?.slug ?? null;
  const isChild = workspaceRow.parent_workspace_id !== null;
  const pathKey =
    isChild && parentSlug
      ? buildWorkspacePathKey(parentSlug, workspaceRow.slug)
      : workspaceRow.slug;

  return {
    id: workspaceRow.id,
    name: workspaceRow.name,
    slug: workspaceRow.slug,
    logoUrl: workspaceRow.logo_url,
    websiteUrl: workspaceRow.website_url ?? null,
    timezone: workspaceRow.timezone ?? FALLBACK_TIMEZONE,
    roleSlug: role?.slug ?? "member",
    parentId: workspaceRow.parent_workspace_id,
    parentSlug,
    isChild,
    pathKey,
  };
}

async function resolveChildBySlugOnly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  childSlug: string,
  userId: string,
): Promise<ResolvedWorkspace | null> {
  const { data: workspaceRows, error } = await supabase
    .from("workspaces")
    .select(WORKSPACE_SELECT)
    .eq("slug", childSlug)
    .not("parent_workspace_id", "is", null);

  if (error || !workspaceRows?.length) return null;

  for (const row of workspaceRows as WorkspaceRow[]) {
    const resolved = await mapWorkspaceRowForUser(supabase, row, userId);
    if (resolved) return resolved;
  }

  return null;
}

/**
 * Resolve workspace from URL slugs and verify direct membership.
 *
 * When the URL uses a single segment (`/{slug}/dashboard`) that is not a root
 * workspace, falls back to a child workspace with that slug the user belongs to.
 */
export async function resolveWorkspaceForUser(
  input: ResolveWorkspaceInput,
): Promise<ResolvedWorkspace | null> {
  const supabase = await createClient();
  const childSlug = input.childSlug?.trim() || null;

  let workspaceQuery = supabase.from("workspaces").select(WORKSPACE_SELECT);

  if (childSlug) {
    workspaceQuery = workspaceQuery
      .eq("slug", childSlug)
      .not("parent_workspace_id", "is", null);
  } else {
    workspaceQuery = workspaceQuery
      .eq("slug", input.parentSlug)
      .is("parent_workspace_id", null);
  }

  const { data: workspaceRows, error: workspaceError } = await workspaceQuery;
  if (workspaceError) return null;

  if (workspaceRows?.length) {
    const workspaceRow = childSlug
      ? (workspaceRows as WorkspaceRow[]).find((row) => {
          const parent = Array.isArray(row.parent) ? row.parent[0] : row.parent;
          return parent?.slug === input.parentSlug;
        })
      : (workspaceRows[0] as WorkspaceRow);

    if (workspaceRow) {
      const resolved = await mapWorkspaceRowForUser(supabase, workspaceRow, input.userId);
      if (resolved) return resolved;
    }
  }

  if (!childSlug) {
    return resolveChildBySlugOnly(supabase, input.parentSlug, input.userId);
  }

  return null;
}

/**
 * Resolve a workspace by id when the user is an active member.
 */
export async function resolveWorkspaceByIdForUser(
  userId: string,
  workspaceId: string,
): Promise<ResolvedWorkspace | null> {
  const supabase = await createClient();
  const { data: workspaceRow, error } = await supabase
    .from("workspaces")
    .select(WORKSPACE_SELECT)
    .eq("id", workspaceId)
    .maybeSingle();

  if (error || !workspaceRow) return null;
  return mapWorkspaceRowForUser(supabase, workspaceRow as WorkspaceRow, userId);
}
