export type {
  CreateAdditionalWorkspaceInput,
  CreateWorkspaceBaseInput,
  CreateWorkspaceInput,
} from "@/schemas/workspace.schema";

export type { OnboardingGoalId } from "@/lib/onboarding/goals";

/** Lightweight workspace record for TeamSwitcher and WorkspaceContext. */
export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  timezone: string;
  roleSlug: string;
  parentId?: string | null;
  parentSlug?: string | null;
  isChild?: boolean;
  /** Canonical path segment for URLs: "acme" or "acme/marketing" */
  pathKey?: string;
};

/**
 * PBAC system roles (matches `public.roles.slug` with `is_system = true`).
 * `owner` is created via onboarding RPC and cannot be re-assigned from UI.
 */
export type WorkspaceRoleSlug =
  | "owner"
  | "admin"
  | "editor"
  | "publisher"
  | "translator"
  | "viewer";

export type WorkspaceRoleOption = {
  value: WorkspaceRoleSlug;
  label: string;
  description: string;
};

export type CreateWorkspaceResult =
  | { success: true; workspace: WorkspaceSummary }
  | { success: false; error: string; code?: "slug_taken" | "already_has_workspace" };

export type UpdateWorkspaceResult =
  | { success: true; workspace: WorkspaceSummary; slugChanged: boolean }
  | { success: false; error: string; code?: "slug_taken" | "not_found" | "forbidden" };

export type UpdateWorkspaceTimezoneResult =
  | { success: true; workspace: WorkspaceSummary }
  | { success: false; error: string; code?: "not_found" | "forbidden" };

export type UpdateWorkspaceWebsiteResult =
  | { success: true; workspace: WorkspaceSummary }
  | { success: false; error: string; code?: "not_found" | "forbidden" };

export type EnsurePersonalWorkspaceResult =
  | { success: true; workspace: WorkspaceSummary; created: boolean }
  | { success: false; error: string };

export type GetUserWorkspacesResult =
  | { success: true; workspaces: WorkspaceSummary[] }
  | { success: false; error: string };

export type SaveWorkspaceOnboardingGoalsResult =
  | { success: true }
  | { success: false; error: string; code?: "not_found" | "forbidden" };

export type WorkspaceLogoResult =
  | { success: true; logoUrl: string }
  | { success: false; error: string; code?: "not_found" | "forbidden" };

export type DeleteWorkspaceResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code?: "not_found" | "forbidden" | "has_members";
    };

/** Cookie name for remembering the last active workspace slug across sessions. */
export const ACTIVE_WORKSPACE_SLUG_COOKIE = "active_workspace_slug";
