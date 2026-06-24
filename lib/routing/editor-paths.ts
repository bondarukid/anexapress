import type { WorkspaceSummary } from "@/types/workspace";

import { coercePathname } from "@/lib/routing/normalize-pathname";
import { parseWorkspacePathKey, type WorkspacePathInput } from "@/lib/workspace-family/paths";

const ROOT_EDITOR_RE = /^\/([^/]+)\/editor(\/.*)?$/;
const CHILD_EDITOR_RE = /^\/([^/]+)\/([^/]+)\/editor(\/.*)?$/;

export type ParsedWorkspaceEditorPath = {
  parentSlug: string;
  childSlug: string | null;
  restPath: string;
};

/**
 * Build tenant editor path: `/{slug}/editor/...` or `/{parent}/{child}/editor/...`
 */
export function buildEditorPath(input: WorkspacePathInput): string {
  const normalized =
    input.suffix && input.suffix.length > 0
      ? input.suffix.startsWith("/")
        ? input.suffix
        : `/${input.suffix}`
      : "";

  if (input.childSlug) {
    return `/${input.parentSlug}/${input.childSlug}/editor${normalized}`;
  }

  return `/${input.parentSlug}/editor${normalized}`;
}

/** Build editor path from a resolved workspace record (client-safe). */
export function editorPathFromSummary(
  workspace: WorkspaceSummary,
  suffix: string = "",
): string {
  const input: WorkspacePathInput =
    workspace.isChild && workspace.parentSlug
      ? {
          parentSlug: workspace.parentSlug,
          childSlug: workspace.slug,
          suffix,
        }
      : {
          parentSlug: workspace.slug,
          suffix,
        };
  return buildEditorPath(input);
}

/** Whether pathname is under tenant editor (root or child workspace). */
export function isWorkspaceEditorPath(pathname: string | null | undefined): boolean {
  const path = coercePathname(pathname);
  return ROOT_EDITOR_RE.test(path) || CHILD_EDITOR_RE.test(path);
}

/** Alias for editor route detection in dashboard shell. */
export const isEditorPath = isWorkspaceEditorPath;

/** Fallback header title for editor routes without chrome context. */
export function editorTitleFromPath(pathname: string | null | undefined): string {
  const rest = tenantEditorRestSuffix(pathname);
  if (rest.includes("/page/")) return "Edit page";
  if (rest.includes("/post/")) return "Edit post";
  return "Editor";
}

/** Parse `/{slug}/editor/...` or `/{parent}/{child}/editor/...`. */
export function parseWorkspaceEditorPath(
  pathname: string | null | undefined,
): ParsedWorkspaceEditorPath | null {
  const path = coercePathname(pathname);
  if (!path) return null;

  const childMatch = path.match(CHILD_EDITOR_RE);
  if (childMatch) {
    return {
      parentSlug: childMatch[1],
      childSlug: childMatch[2],
      restPath: childMatch[3] ?? "",
    };
  }

  const rootMatch = path.match(ROOT_EDITOR_RE);
  if (rootMatch) {
    return {
      parentSlug: rootMatch[1],
      childSlug: null,
      restPath: rootMatch[2] ?? "",
    };
  }

  return null;
}

/** Path after `/{slug}/editor` or `/{parent}/{child}/editor` on tenant URLs. */
export function tenantEditorRestSuffix(pathname: string | null | undefined): string {
  const path = coercePathname(pathname);
  if (!path) return "";

  const childMatch = path.match(/^\/[^/]+\/[^/]+\/editor(\/.*)?$/);
  if (childMatch) return childMatch[1] ?? "";

  const rootMatch = path.match(/^\/[^/]+\/editor(\/.*)?$/);
  return rootMatch?.[1] ?? "";
}

/** Remap editor rest suffix onto another workspace editor base path. */
export function applyTenantEditorSuffix(
  targetWorkspacePathKey: string,
  restSuffix: string,
): string {
  const { parentSlug, childSlug } = parseWorkspacePathKey(targetWorkspacePathKey);
  return buildEditorPath({ parentSlug, childSlug, suffix: restSuffix });
}

/** Map legacy dashboard editor URLs to standalone editor paths. */
export function mapDashboardEditorPathToEditorPath(
  pathname: string | null | undefined,
): string | null {
  const path = coercePathname(pathname);
  if (!path) return null;

  const dashboardPost = path.match(
    /^\/([^/]+)(?:\/([^/]+))?\/dashboard\/content\/editor\/([^/]+)$/,
  );
  if (dashboardPost) {
    const [, parentSlug, childSlug, postId] = dashboardPost;
    return buildEditorPath({
      parentSlug,
      childSlug: childSlug ?? null,
      suffix: `/post/${postId}`,
    });
  }

  const sitePost = path.match(
    /^\/([^/]+)(?:\/([^/]+))?\/dashboard\/sites\/([^/]+)\/content\/editor\/([^/]+)$/,
  );
  if (sitePost) {
    const [, parentSlug, childSlug, siteId, postId] = sitePost;
    return buildEditorPath({
      parentSlug,
      childSlug: childSlug ?? null,
      suffix: `/site/${siteId}/post/${postId}`,
    });
  }

  const sitePage = path.match(
    /^\/([^/]+)(?:\/([^/]+))?\/dashboard\/sites\/([^/]+)\/pages\/editor\/([^/]+)$/,
  );
  if (sitePage) {
    const [, parentSlug, childSlug, siteId, pageId] = sitePage;
    return buildEditorPath({
      parentSlug,
      childSlug: childSlug ?? null,
      suffix: `/site/${siteId}/page/${pageId}`,
    });
  }

  return null;
}
