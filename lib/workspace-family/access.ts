import { createClient } from "@/lib/server";

/**
 * PBAC with parent cascade for child workspaces.
 * Wraps `has_effective_workspace_permission` RPC.
 */
export async function hasEffectiveWorkspacePermission(
  workspaceId: string,
  permKey: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_effective_workspace_permission", {
    ws_id: workspaceId,
    perm_key: permKey,
  });
  return data === true;
}

/**
 * Whether the current user can view workspace data (direct member or parent reader).
 */
export async function canViewWorkspace(workspaceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("can_view_workspace", {
    ws_id: workspaceId,
  });
  return data === true;
}
