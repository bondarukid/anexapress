import { parseWorkspaceDashboardPath, workspacePath } from "@/lib/routing/workspace-paths";
import type { WorkspacePathInput } from "@/lib/workspace-family/paths";

export type SiteDashboardSection =
  | "overview"
  | "pages"
  | "layout"
  | "content"
  | "settings"
  | "files"
  | "unknown";

const SITE_DASHBOARD_RE = /^\/sites\/([^/]+)(?:\/(.*))?$/;

export type ParsedSiteDashboardPath = {
  siteId: string;
  section: SiteDashboardSection;
  restPath: string;
};

/** Whether pathname is under `/dashboard/sites/[siteId]/...`. */
export function isSiteDashboardPath(pathname: string | null | undefined): boolean {
  const parsed = parseWorkspaceDashboardPath(pathname);
  if (!parsed) return false;
  return parsed.restPath.startsWith("/sites/");
}

/** Parse site dashboard segment from a tenant dashboard pathname. */
export function parseSiteDashboardPath(
  pathname: string | null | undefined,
): ParsedSiteDashboardPath | null {
  const dashboard = parseWorkspaceDashboardPath(pathname);
  if (!dashboard) return null;

  const restPath = dashboard.restPath ?? "";
  const match = restPath.match(SITE_DASHBOARD_RE);
  if (!match) return null;

  const siteId = match[1];
  const tail = match[2] ?? "";
  const section = resolveSiteDashboardSection(tail);

  return {
    siteId,
    section,
    restPath: tail ? `/${tail}` : "",
  };
}

function resolveSiteDashboardSection(tail: string): SiteDashboardSection {
  if (!tail || tail === "overview") return "overview";
  if (tail === "pages" || tail.startsWith("pages/")) return "pages";
  if (tail === "layout") return "layout";
  if (tail === "settings") return "settings";
  if (tail === "files") return "files";
  if (tail === "media") return "files";
  if (tail === "content" || tail.startsWith("content/")) return "content";
  return "unknown";
}

/** Build tenant-prefixed site dashboard path. */
export function siteDashboardPath(
  workspaceSlugOrInput: string | WorkspacePathInput,
  siteId: string,
  suffix: string = "/overview",
): string {
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return workspacePath(workspaceSlugOrInput, `/sites/${siteId}${normalized}`);
}

/** Human-readable section title for site dashboard header. */
export function siteDashboardSectionTitle(section: SiteDashboardSection): string {
  switch (section) {
    case "overview":
      return "Overview";
    case "pages":
      return "Pages";
    case "layout":
      return "Layout";
    case "content":
      return "Blog posts";
    case "settings":
      return "Settings";
    case "files":
      return "Files";
    default:
      return "Site";
  }
}
