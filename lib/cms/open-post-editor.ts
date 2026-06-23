import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import type { WorkspaceSummary } from "@/types/workspace";

/**
 * Opens the fullscreen post editor in a new browser window.
 */
export function openPostEditor(
  workspace: WorkspaceSummary,
  postId: string,
  options?: { siteDashboardBase?: string },
): void {
  const url =
    options?.siteDashboardBase
      ? `${options.siteDashboardBase}/content/editor/${postId}`
      : workspacePathFromSummary(workspace, `/content/editor/${postId}`);
  const popup = window.open(
    url,
    `post-editor-${postId}`,
    "noopener,noreferrer,width=1400,height=900",
  );

  if (!popup) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
