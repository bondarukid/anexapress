import type { OnboardingFormData } from "@/lib/ui/onboarding-feed-data";
import type { OnboardingStepId } from "@/lib/ui/onboarding-feed-data";
import { isWorkspaceCreateFormValid } from "@/lib/ui/workspace-create-form";
import type { SlugCheckState } from "@/hooks/use-workspace-slug-check";

function hasText(value?: string) {
  return Boolean(value?.trim());
}

export function isOnboardingStepValid(
  stepId: OnboardingStepId,
  data: OnboardingFormData,
  slugCheck?: SlugCheckState,
): boolean {
  switch (stepId) {
    case "personal-info":
      return hasText(data.firstName) && hasText(data.lastName);
    case "goals":
      return (data.goals?.length ?? 0) > 0;
    case "workspace":
      if (!slugCheck) return false;
      return isWorkspaceCreateFormValid(
        {
          workspaceName: data.workspaceName,
          workspaceUrl: data.workspaceUrl,
          timezone: data.timezone,
          companySize: data.companySize,
          industry: data.industry,
          description: data.description ?? "",
        },
        slugCheck,
      );
    case "notifications":
    case "complete":
      return true;
    default:
      return true;
  }
}
