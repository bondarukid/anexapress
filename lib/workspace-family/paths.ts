import type { ResolvedWorkspacePath } from "@/lib/workspace-family/types";
import { coercePathname } from "@/lib/routing/normalize-pathname";

const ROOT_DASHBOARD_RE = /^\/([^/]+)\/dashboard(\/.*)?$/;
const CHILD_DASHBOARD_RE = /^\/([^/]+)\/([^/]+)\/dashboard(\/.*)?$/;
const ROOT_INVITE_RE = /^\/([^/]+)\/invite$/;
const CHILD_INVITE_RE = /^\/([^/]+)\/([^/]+)\/invite$/;

export type WorkspacePathInput = {
  parentSlug: string;
  childSlug?: string | null;
  suffix?: string;
};

/**
 * Build tenant dashboard path.
 * Root: `/{parentSlug}/dashboard/...`
 * Child: `/{parentSlug}/{childSlug}/dashboard/...`
 */
export function buildWorkspacePath(input: WorkspacePathInput): string {
  const normalized =
    input.suffix && input.suffix.length > 0
      ? input.suffix.startsWith("/")
        ? input.suffix
        : `/${input.suffix}`
      : "";

  if (input.childSlug) {
    return `/${input.parentSlug}/${input.childSlug}/dashboard${normalized}`;
  }

  return `/${input.parentSlug}/dashboard${normalized}`;
}

/** Canonical path key for cookies and switcher: `acme` or `acme/marketing`. */
export function buildWorkspacePathKey(parentSlug: string, childSlug?: string | null): string {
  return childSlug ? `${parentSlug}/${childSlug}` : parentSlug;
}

/** Parse path key back into slug segments. */
export function parseWorkspacePathKey(pathKey: string): {
  parentSlug: string;
  childSlug: string | null;
} {
  const parts = pathKey.split("/").filter(Boolean);
  if (parts.length >= 2) {
    return { parentSlug: parts[0], childSlug: parts[1] };
  }
  return { parentSlug: parts[0] ?? "", childSlug: null };
}

/**
 * Parse tenant dashboard or invite pathname into workspace path segments.
 */
export function parseWorkspacePath(pathname: string | null | undefined): ResolvedWorkspacePath | null {
  const path = coercePathname(pathname);
  if (!path) return null;

  const childDashboard = path.match(CHILD_DASHBOARD_RE);
  if (childDashboard) {
    return {
      parentSlug: childDashboard[1],
      childSlug: childDashboard[2],
      restPath: childDashboard[3] ?? "",
    };
  }

  const rootDashboard = path.match(ROOT_DASHBOARD_RE);
  if (rootDashboard) {
    return {
      parentSlug: rootDashboard[1],
      childSlug: null,
      restPath: rootDashboard[2] ?? "",
    };
  }

  const childInvite = path.match(CHILD_INVITE_RE);
  if (childInvite) {
    return {
      parentSlug: childInvite[1],
      childSlug: childInvite[2],
      restPath: "/invite",
    };
  }

  const rootInvite = path.match(ROOT_INVITE_RE);
  if (rootInvite) {
    return {
      parentSlug: rootInvite[1],
      childSlug: null,
      restPath: "/invite",
    };
  }

  return null;
}

/** Whether pathname is under tenant dashboard (root or child). */
export function isWorkspaceDashboardPath(pathname: string | null | undefined): boolean {
  const path = coercePathname(pathname);
  return ROOT_DASHBOARD_RE.test(path) || CHILD_DASHBOARD_RE.test(path);
}

/** Whether pathname is a workspace invite landing. */
export function isWorkspaceInvitePath(pathname: string | null | undefined): boolean {
  const path = coercePathname(pathname);
  return ROOT_INVITE_RE.test(path) || CHILD_INVITE_RE.test(path);
}

export function workspaceInvitePath(input: WorkspacePathInput, joinCode: string): string {
  const params = new URLSearchParams({
    code: joinCode.trim().toUpperCase(),
  });
  const base = input.childSlug
    ? `/${input.parentSlug}/${input.childSlug}/invite`
    : `/${input.parentSlug}/invite`;
  return `${base}?${params.toString()}`;
}
