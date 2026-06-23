import { normalizeCountryCode } from "@/lib/countries";
import { WORKSPACE_OWNER_POSITION, type OnboardingFormData } from "@/lib/ui/onboarding-feed-data";
import type { WorkspaceCreateFormValues } from "@/lib/ui/workspace-create-form";
import type { CreateWorkspaceBaseInput, CreateWorkspaceInput } from "@/schemas/workspace.schema";

export function mapOnboardingFormToCreateInput(data: OnboardingFormData): CreateWorkspaceInput {
  return {
    workspaceName: data.workspaceName.trim(),
    workspaceUrl: data.workspaceUrl.trim(),
    timezone: data.timezone.trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    position: WORKSPACE_OWNER_POSITION,
    country: normalizeCountryCode(data.country) ?? undefined,
    gender: data.gender?.trim() || undefined,
    mobile: data.phoneNumber?.trim() || undefined,
  };
}

export function mapWorkspaceCreateFormToAdditionalInput(
  values: WorkspaceCreateFormValues,
): CreateWorkspaceBaseInput {
  return mapWorkspaceCreateFormToOwnedInput(values);
}

/** Preferred name for dashboard create-workspace dialogs (same shape as additional workspace). */
export function mapWorkspaceCreateFormToOwnedInput(
  values: WorkspaceCreateFormValues,
): CreateWorkspaceBaseInput {
  return {
    workspaceName: values.workspaceName.trim(),
    workspaceUrl: values.workspaceUrl.trim(),
    timezone: values.timezone.trim(),
  };
}

export function mapWorkspaceCreateFormToUpdateInput(
  workspaceId: string,
  values: WorkspaceCreateFormValues,
) {
  return {
    workspaceId,
    ...mapWorkspaceCreateFormToOwnedInput(values),
  };
}
