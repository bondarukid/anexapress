/**
 * Build tenant-prefixed dashboard paths: `/{slug}/dashboard/...` or `/{parent}/{child}/dashboard/...`
 */
import type { WorkspaceSummary } from "@/types/workspace";
import {
  buildWorkspacePath,
  buildWorkspacePathKey,
  isWorkspaceDashboardPath,
  isWorkspaceInvitePath,
  parseWorkspacePath,
  parseWorkspacePathKey,
  workspaceInvitePath as buildWorkspaceInvitePath,
  type WorkspacePathInput,
} from "@/lib/workspace-family/paths";

export type { WorkspacePathInput };

export function workspacePath(
  slugOrInput: string | WorkspacePathInput,
  path: string = "",
): string {
  if (typeof slugOrInput === "string") {
    return buildWorkspacePath({ parentSlug: slugOrInput, suffix: path });
  }
  return buildWorkspacePath({ ...slugOrInput, suffix: slugOrInput.suffix ?? path });
}

/** Build dashboard path from a resolved workspace record (client-safe). */
export function workspacePathFromSummary(
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
  return workspacePath(input);
}

export const DASHBOARD_ENTRY_PATH = "/dashboard";

export function resolveDashboardHomePath(input: string | WorkspacePathInput): string {
  if (typeof input === "string") {
    return workspacePath(input);
  }
  return buildWorkspacePath(input);
}

export { buildWorkspacePathKey, parseWorkspacePathKey, isWorkspaceDashboardPath, isWorkspaceInvitePath };

/** Parse `/{slug}/dashboard/...` or `/{parent}/{child}/dashboard/...`. */
export function parseWorkspaceDashboardPath(pathname: string): {
  workspaceSlug: string;
  childSlug: string | null;
  restPath: string;
} | null {
  const parsed = parseWorkspacePath(pathname);
  if (!parsed) return null;

  const dashboardPrefix = parsed.childSlug
    ? `/${parsed.parentSlug}/${parsed.childSlug}/dashboard`
    : `/${parsed.parentSlug}/dashboard`;

  if (!pathname.startsWith(dashboardPrefix)) return null;

  const restPath = pathname.slice(dashboardPrefix.length);
  return {
    workspaceSlug: parsed.parentSlug,
    childSlug: parsed.childSlug,
    restPath,
  };
}

export function isTeamPath(pathname: string): boolean {
  const parsed = parseWorkspaceDashboardPath(pathname);
  if (!parsed) return false;
  return parsed.restPath === "/team" || parsed.restPath.startsWith("/team/");
}

/** True when pathname is the workspace dashboard home (`/dashboard` with no extra segments). */
export function isDashboardHomePath(pathname: string): boolean {
  const parsed = parseWorkspaceDashboardPath(pathname);
  if (!parsed) return false;
  return parsed.restPath === "" || parsed.restPath === "/";
}

/** True when pathname is the sites list (`/dashboard/sites`). */
export function isSitesListPath(pathname: string): boolean {
  const parsed = parseWorkspaceDashboardPath(pathname);
  if (!parsed) return false;
  return parsed.restPath === "/sites" || parsed.restPath === "/sites/";
}

export function isSaasSettingsPath(pathname: string): boolean {
  const parsed = parseWorkspaceDashboardPath(pathname);
  if (!parsed) return false;
  return (
    parsed.restPath === "/settings/workspace" ||
    parsed.restPath.startsWith("/settings/workspace/")
  );
}

export function settingsLeafFromPathname(pathname: string): string | null {
  const parsed = parseWorkspaceDashboardPath(pathname);
  if (!parsed?.restPath.startsWith("/settings/")) return null;
  const parts = parsed.restPath.split("/").filter(Boolean);
  return parts[1] ?? null;
}

export function workspaceInvitePath(
  workspaceSlug: string,
  joinCode: string,
  childSlug?: string | null,
): string {
  return buildWorkspaceInvitePath({ parentSlug: workspaceSlug, childSlug }, joinCode);
}
