import { createClient } from "@/lib/server";
import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import { hasEffectiveWorkspacePermission } from "@/lib/workspace-family/access";
import {
  filterMembersByWorkspace,
  mapFamilyMemberRow,
} from "@/lib/workspace-family/members";
import { buildWorkspacePathKey } from "@/lib/workspace-family/paths";
import { resolveWorkspaceForUser } from "@/lib/workspace-family/resolve";
import { getWorkspaceScope } from "@/lib/workspace-family/scope";
import type {
  ResolveWorkspaceInput,
  ResolvedWorkspace,
  WorkspaceFamilyNode,
  WorkspaceScope,
} from "@/lib/workspace-family/types";
import type { TeamActiveMember } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";

export type CreateChildWorkspaceParams = {
  parentId: string;
  name: string;
  slug: string;
  timezone?: string;
};

export type CreateChildWorkspaceResult =
  | { success: true; workspace: WorkspaceSummary }
  | { success: false; error: string; code?: "slug_taken" | "forbidden" | "parent_must_be_root" };

export type AttachWorkspaceToParentResult =
  | { success: true; transferId: string }
  | {
      success: false;
      error: string;
      code?:
        | "forbidden"
        | "source_must_be_root"
        | "must_have_another_root_workspace"
        | "parent_must_be_root"
        | "cannot_attach_to_self"
        | "attach_already_pending";
    };

export type ChildWorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
};

function mapChildRow(row: {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  timezone: string | null;
}): ChildWorkspaceSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    timezone: row.timezone ?? FALLBACK_TIMEZONE,
  };
}

function mapRpcError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("slug_taken")) return "This workspace URL is already taken.";
  if (normalized.includes("forbidden")) return "You do not have permission to perform this action.";
  if (normalized.includes("parent_must_be_root")) {
    return "Child workspaces can only be created under a root workspace.";
  }
  if (normalized.includes("source_must_be_root")) {
    return "Only root workspaces can be attached to a parent.";
  }
  if (normalized.includes("must_have_another_root_workspace")) {
    return "You must belong to at least one other root workspace before attaching this one.";
  }
  if (normalized.includes("cannot_attach_to_self")) {
    return "A workspace cannot be attached to itself.";
  }
  return message;
}

export { resolveWorkspaceForUser, getWorkspaceScope, hasEffectiveWorkspacePermission };
export type { ResolveWorkspaceInput, ResolvedWorkspace, WorkspaceFamilyNode, WorkspaceScope };

/**
 * Create a child workspace under a root parent.
 */
export async function createChildWorkspace(
  params: CreateChildWorkspaceParams,
): Promise<CreateChildWorkspaceResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_child_workspace", {
    p_parent_id: params.parentId,
    p_name: params.name,
    p_slug: params.slug,
    p_timezone: params.timezone ?? FALLBACK_TIMEZONE,
  });

  if (error) {
    return { success: false, error: mapRpcError(error.message), code: "forbidden" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) {
    return { success: false, error: "Workspace was created but response was invalid." };
  }

  const parent = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", params.parentId)
    .maybeSingle();

  const parentSlug = parent.data?.slug ?? "";
  const pathKey = buildWorkspacePathKey(parentSlug, row.slug);

  return {
    success: true,
    workspace: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logo_url ?? null,
      websiteUrl: null,
      timezone: row.timezone ?? FALLBACK_TIMEZONE,
      roleSlug: "admin",
      parentId: params.parentId,
      parentSlug,
      isChild: true,
      pathKey,
    },
  };
}

/**
 * List root workspaces the current user can attach (workspace.transfer), excluding parent.
 */
export async function listAttachableRootWorkspaces(
  excludeParentId: string,
): Promise<ChildWorkspaceSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_attachable_root_workspaces", {
    p_exclude_parent_id: excludeParentId,
  });

  if (error) return [];
  return (data ?? []).map(mapChildRow);
}

/** @deprecated Use listAttachableRootWorkspaces */
export async function listAttachableOwnedWorkspaces(
  _userId: string,
  excludeWorkspaceId: string,
): Promise<ChildWorkspaceSummary[]> {
  return listAttachableRootWorkspaces(excludeWorkspaceId);
}

/**
 * List child workspaces for a root parent workspace.
 */
export async function listChildWorkspaces(parentId: string): Promise<ChildWorkspaceSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_child_workspaces", {
    p_parent_id: parentId,
  });

  if (error) return [];
  return (data ?? []).map(mapChildRow);
}

/**
 * Aggregated team members across parent + children.
 */
export async function getFamilyTeamMembers(
  scopeWorkspaceId: string,
  filterWorkspaceId?: string | null,
): Promise<TeamActiveMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_workspace_family_members", {
    p_scope_workspace_id: scopeWorkspaceId,
    p_filter_workspace_id: filterWorkspaceId ?? null,
  });

  if (error) return [];
  const members = (data ?? []).map(mapFamilyMemberRow);
  return filterMembersByWorkspace(members, filterWorkspaceId ?? null);
}
