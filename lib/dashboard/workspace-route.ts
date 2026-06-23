import { resolveWorkspacePath } from "@/services/workspace";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";

export { workspacePathFromSummary };

type WorkspaceRouteParams = {
  workspaceSlug: string;
  childSlug?: string;
};

/** Resolve workspace from route params (root or child). */
export async function resolveWorkspaceFromRoute(
  params: WorkspaceRouteParams,
  userId: string,
) {
  return resolveWorkspacePath({
    parentSlug: params.workspaceSlug,
    childSlug: params.childSlug,
    userId,
  });
}
