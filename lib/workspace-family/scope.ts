import { createClient } from "@/lib/server";
import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import type { WorkspaceFamilyNode, WorkspaceScope } from "@/lib/workspace-family/types";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  timezone: string | null;
  parent_workspace_id: string | null;
};

function mapNode(row: WorkspaceRow): WorkspaceFamilyNode {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    timezone: row.timezone ?? FALLBACK_TIMEZONE,
    parentId: row.parent_workspace_id,
    isChild: row.parent_workspace_id !== null,
  };
}

/**
 * Load family scope for a workspace: self, parent (if child), and children (if root).
 */
export async function getWorkspaceScope(workspaceId: string): Promise<WorkspaceScope | null> {
  const supabase = await createClient();

  const { data: selfRow, error: selfError } = await supabase
    .from("workspaces")
    .select("id, name, slug, logo_url, timezone, parent_workspace_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (selfError || !selfRow) return null;

  const self = mapNode(selfRow as WorkspaceRow);
  let parent: WorkspaceFamilyNode | null = null;

  if (self.parentId) {
    const { data: parentRow } = await supabase
      .from("workspaces")
      .select("id, name, slug, logo_url, timezone, parent_workspace_id")
      .eq("id", self.parentId)
      .maybeSingle();

    if (parentRow) {
      parent = mapNode(parentRow as WorkspaceRow);
    }
  }

  const { data: childRows } = await supabase.rpc("get_child_workspaces", {
    p_parent_id: workspaceId,
  });

  const children = (childRows ?? []).map((row: WorkspaceRow) => mapNode(row));
  const workspaceIds = [self.id, ...children.map((c: WorkspaceFamilyNode) => c.id)];

  return { self, parent, children, workspaceIds };
}
