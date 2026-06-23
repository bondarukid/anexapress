import type { SlugCheckState } from "@/hooks/use-workspace-slug-check";
import { FALLBACK_TIMEZONE, isValidTimezone } from "@/lib/timezone/timezone-options";

export type WorkspaceCreateFormValues = {
  workspaceName: string;
  workspaceUrl: string;
  timezone: string;
  companySize: string;
  industry: string;
  description: string;
};

export const defaultWorkspaceCreateFormValues = (): WorkspaceCreateFormValues => ({
  workspaceName: "",
  workspaceUrl: "",
  timezone: FALLBACK_TIMEZONE,
  companySize: "",
  industry: "",
  description: "",
});

function hasText(value?: string) {
  return Boolean(value?.trim());
}

export function isWorkspaceCreateFormValid(
  values: WorkspaceCreateFormValues,
  slugCheck: SlugCheckState,
): boolean {
  if (!hasText(values.workspaceName)) return false;
  if (values.workspaceUrl.trim().length < 3) return false;
  if (!isValidTimezone(values.timezone)) return false;
  if (slugCheck.checking) return false;
  if (slugCheck.error) return false;
  if (slugCheck.available !== true) return false;
  return true;
}

/**
 * Validation for workspace General settings (name + URL only).
 * Skips slug availability when the URL is unchanged — the current slug is already valid.
 */
export function isWorkspaceSettingsFormValid(
  values: Pick<WorkspaceCreateFormValues, "workspaceName" | "workspaceUrl">,
  slugCheck: SlugCheckState,
  originalSlug: string,
): boolean {
  const name = values.workspaceName.trim();
  if (name.length < 2) return false;

  const slug = values.workspaceUrl.trim();
  if (slug.length < 3) return false;

  if (slug === originalSlug.trim()) {
    return true;
  }

  if (slugCheck.checking) return false;
  if (slugCheck.error) return false;
  if (slugCheck.available !== true) return false;
  return true;
}
