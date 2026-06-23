import { resolveWorkspacePath } from "@/services/workspace";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";

export { workspacePathFromSummary };

type WorkspaceRouteParams = {
  workspaceSlug: string;
  /** Second URL segment under child workspace dashboard routes (`/[workspaceSlug]/[slug]/dashboard`). */
  slug?: string;
  /** @deprecated Use `slug` — kept for callers outside App Router params. */
  childSlug?: string;
};

/** Resolve workspace from route params (root or child). */
export async function resolveWorkspaceFromRoute(
  params: WorkspaceRouteParams,
  userId: string,
) {
  return resolveWorkspacePath({
    parentSlug: params.workspaceSlug,
    childSlug: params.slug ?? params.childSlug,
    userId,
  });
}
