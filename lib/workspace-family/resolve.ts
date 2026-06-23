import { createClient } from "@/lib/server";
import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import { buildWorkspacePathKey } from "@/lib/workspace-family/paths";
import type { ResolveWorkspaceInput, ResolvedWorkspace } from "@/lib/workspace-family/types";

/**
 * Resolve workspace from URL slugs and verify direct membership.
 */
export async function resolveWorkspaceForUser(
  input: ResolveWorkspaceInput,
): Promise<ResolvedWorkspace | null> {
  const supabase = await createClient();
  const childSlug = input.childSlug?.trim() || null;

  let workspaceQuery = supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      slug,
      logo_url,
      website_url,
      timezone,
      parent_workspace_id,
      parent:parent_workspace_id ( id, slug )
    `,
    );

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
  if (workspaceError || !workspaceRows?.length) return null;

  const workspaceRow = childSlug
    ? workspaceRows.find((row) => {
        const parent = Array.isArray(row.parent) ? row.parent[0] : row.parent;
        return parent?.slug === input.parentSlug;
      })
    : workspaceRows[0];

  if (!workspaceRow) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("roles ( slug )")
    .eq("workspace_id", workspaceRow.id)
    .eq("user_id", input.userId)
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
