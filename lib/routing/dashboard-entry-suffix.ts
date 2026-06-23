import {
  DASHBOARD_ENTRY_PATH,
  workspacePath,
} from "@/lib/routing/workspace-paths";
import { buildWorkspacePath, parseWorkspacePathKey } from "@/lib/workspace-family/paths";

/**
 * Maps legacy `/dashboard/*` paths to tenant-prefixed dashboard URLs.
 * Shared by middleware (edge) and server redirect resolver.
 */
export function mapLegacyDashboardPath(pathname: string, slugOrPathKey: string): string {
  const { parentSlug, childSlug } = parseWorkspacePathKey(slugOrPathKey);
  const normalized =
    pathname === DASHBOARD_ENTRY_PATH || pathname === `${DASHBOARD_ENTRY_PATH}/`
      ? DASHBOARD_ENTRY_PATH
      : pathname.startsWith(`${DASHBOARD_ENTRY_PATH}/`)
        ? pathname
        : DASHBOARD_ENTRY_PATH;

  if (
    normalized === `${DASHBOARD_ENTRY_PATH}/invites` ||
    normalized.startsWith(`${DASHBOARD_ENTRY_PATH}/invites/`)
  ) {
    return buildWorkspacePath({ parentSlug, childSlug, suffix: "/mail" });
  }

  if (normalized.startsWith(`${DASHBOARD_ENTRY_PATH}/settings`)) {
    const settingsSuffix = normalized.slice(DASHBOARD_ENTRY_PATH.length);
    return buildWorkspacePath({ parentSlug, childSlug, suffix: settingsSuffix });
  }

  if (normalized.startsWith(`${DASHBOARD_ENTRY_PATH}/`)) {
    const restSuffix = normalized.slice(DASHBOARD_ENTRY_PATH.length);
    return buildWorkspacePath({ parentSlug, childSlug, suffix: restSuffix });
  }

  return buildWorkspacePath({ parentSlug, childSlug });
}

/** Build legacy pathname from optional catch-all segments under `/dashboard`. */
export function buildLegacyDashboardPathname(pathSegments: string[] | undefined): string {
  if (!pathSegments || pathSegments.length === 0) {
    return DASHBOARD_ENTRY_PATH;
  }
  return `${DASHBOARD_ENTRY_PATH}/${pathSegments.join("/")}`;
}

/** Path after `/{slug}/dashboard` or `/{parent}/{child}/dashboard` on tenant URLs. */
export function tenantDashboardRestSuffix(pathname: string): string {
  const childMatch = pathname.match(/^\/[^/]+\/[^/]+\/dashboard(\/.*)?$/);
  if (childMatch) return childMatch[1] ?? "";

  const rootMatch = pathname.match(/^\/[^/]+\/dashboard(\/.*)?$/);
  return rootMatch?.[1] ?? "";
}

/** Append tenant dashboard suffix from the current URL onto a resolved dashboard target. */
export function applyTenantDashboardSuffix(target: string, restSuffix: string): string {
  if (!restSuffix) return target;
  const base = target.replace(/(\/dashboard)(\/.*)?$/, "$1");
  return `${base}${restSuffix}`;
}
