import { editorPathFromSummary } from "@/lib/routing/editor-paths";
import type { WorkspaceSummary } from "@/types/workspace";

/**
 * Navigates to the standalone site page editor (outside dashboard shell).
 */
export function openSitePageEditor(
  workspace: WorkspaceSummary,
  siteId: string,
  pageId: string,
): void {
  const url = editorPathFromSummary(workspace, `/site/${siteId}/page/${pageId}`);
  window.location.assign(url);
}
