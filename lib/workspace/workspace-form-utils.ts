import { deriveWorkspaceDefaults } from "@/lib/ui/onboarding-feed-data";
import {
  defaultWorkspaceCreateFormValues,
  type WorkspaceCreateFormValues,
} from "@/lib/ui/workspace-create-form";
import type { UserProfile } from "@/types/user";
import type { WorkspaceSummary } from "@/types/workspace";

/** Default form values for creating a new workspace from the team switcher. */
export function buildCreateFormValuesFromUser(user: UserProfile): WorkspaceCreateFormValues {
  const defaults = deriveWorkspaceDefaults(user.firstName ?? "", user.lastName ?? "");
  return {
    ...defaultWorkspaceCreateFormValues(),
    workspaceName: defaults.workspaceName,
    workspaceUrl: defaults.workspaceUrl,
  };
}

/** Pre-fill configure step from an existing personal workspace. */
export function buildConfigureFormValuesFromWorkspace(
  workspace: WorkspaceSummary,
): WorkspaceCreateFormValues {
  return {
    ...defaultWorkspaceCreateFormValues(),
    workspaceName: workspace.name,
    workspaceUrl: workspace.slug,
    timezone: workspace.timezone,
  };
}
