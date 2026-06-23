import type { WorkspaceRoleOption, WorkspaceRoleSlug, WorkspaceSummary } from "@/types/workspace";

export type { WorkspaceRoleOption, WorkspaceRoleSlug } from "@/types/workspace";

export const WORKSPACE_ROLE_OPTIONS: WorkspaceRoleOption[] = [
  {
    value: "owner",
    label: "Owner",
    description: "Full access; manages billing, members, and roles",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manages members, roles, and workspace settings",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Creates and edits content",
  },
  {
    value: "publisher",
    label: "Publisher",
    description: "Publishes content and manages releases",
  },
  {
    value: "translator",
    label: "Translator",
    description: "Translates content into other locales",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to the workspace",
  },
];

const WORKSPACE_ROLE_LABELS: Record<string, string> = Object.fromEntries(
  WORKSPACE_ROLE_OPTIONS.map((option) => [option.value, option.label]),
);

/** Workspace memberships may also expose a generic 'member' fallback. */
WORKSPACE_ROLE_LABELS.member = "Member";

/** Human-readable workspace role for sidebar and profile UI. */
export function formatWorkspaceRoleSlug(roleSlug: string): string {
  const normalized = roleSlug.trim().toLowerCase();
  if (WORKSPACE_ROLE_LABELS[normalized]) {
    return WORKSPACE_ROLE_LABELS[normalized];
  }

  return normalized
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatWorkspaceRole(workspace: WorkspaceSummary): string {
  return formatWorkspaceRoleSlug(workspace.roleSlug);
}

/** Normalize legacy position values (e.g. 'user', 'other') stored in `profiles.position`. */
export function normalizeWorkspaceRoleSlug(value?: string | null): WorkspaceRoleSlug | "" {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();
  const match = WORKSPACE_ROLE_OPTIONS.find((option) => option.value === normalized);
  return match ? match.value : "";
}
