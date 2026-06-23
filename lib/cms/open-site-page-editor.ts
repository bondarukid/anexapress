import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import type { WorkspaceSummary } from "@/types/workspace";

export function openSitePageEditor(
  workspace: WorkspaceSummary,
  siteId: string,
  pageId: string,
): void {
  const url = workspacePathFromSummary(workspace, `/sites/${siteId}/pages/editor/${pageId}`);
  const popup = window.open(url, `page-editor-${pageId}`, "noopener,noreferrer,width=1400,height=900");
  if (!popup) window.open(url, "_blank", "noopener,noreferrer");
}
