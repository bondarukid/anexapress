import { editorPathFromSummary } from "@/lib/routing/editor-paths";
import type { WorkspaceSummary } from "@/types/workspace";

type OpenPostEditorOptions = {
  siteId?: string | null;
};

/**
 * Navigates to the standalone post editor page (outside dashboard shell).
 */
export function openPostEditor(
  workspace: WorkspaceSummary,
  postId: string,
  options?: OpenPostEditorOptions,
): void {
  const suffix = options?.siteId
    ? `/site/${options.siteId}/post/${postId}`
    : `/post/${postId}`;

  window.location.assign(editorPathFromSummary(workspace, suffix));
}
