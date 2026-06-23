import { cookies } from "next/headers";

import { canManageWorkspaceMembers } from "@/lib/team/permissions";
import { getTeamMemberPermissions } from "@/services/team";
import { getCurrentUser } from "@/services/user";
import { resolveWorkspaceFromRoute } from "@/lib/dashboard/workspace-route";
import { parseWorkspacePathKey } from "@/lib/workspace-family/paths";
import { ACTIVE_WORKSPACE_SLUG_COOKIE } from "@/types/workspace";

export async function resolveTeamSkeletonShowInviteButton(
  workspaceSlug?: string,
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const cookieStore = await cookies();
  const slug = workspaceSlug ?? cookieStore.get(ACTIVE_WORKSPACE_SLUG_COOKIE)?.value ?? null;

  if (!slug) return false;

  const { parentSlug, childSlug } = parseWorkspacePathKey(slug);
  const workspace = await resolveWorkspaceFromRoute(
    { workspaceSlug: parentSlug, childSlug: childSlug ?? undefined },
    user.id,
  );
  if (!workspace) return false;

  const permissions = await getTeamMemberPermissions(workspace.id);
  return canManageWorkspaceMembers(permissions);
}

export function teamSkeletonDescription(canManage: boolean): string {
  return canManage
    ? "Manage your team members and their permissions."
    : "View workspace members and their roles.";
}
