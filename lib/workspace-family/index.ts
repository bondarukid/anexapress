export type {
  ResolveWorkspaceInput,
  ResolvedWorkspace,
  ResolvedWorkspacePath,
  WorkspaceFamilyNode,
  WorkspaceScope,
} from "@/lib/workspace-family/types";

export {
  buildWorkspacePath,
  buildWorkspacePathKey,
  isWorkspaceDashboardPath,
  isWorkspaceInvitePath,
  parseWorkspacePath,
  parseWorkspacePathKey,
  workspaceInvitePath,
  type WorkspacePathInput,
} from "@/lib/workspace-family/paths";

export { resolveWorkspaceForUser } from "@/lib/workspace-family/resolve";
export { getWorkspaceScope } from "@/lib/workspace-family/scope";
export { hasEffectiveWorkspacePermission, canViewWorkspace } from "@/lib/workspace-family/access";
export { filterMembersByWorkspace, mapFamilyMemberRow } from "@/lib/workspace-family/members";
