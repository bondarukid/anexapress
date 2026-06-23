import { onboardingSteps, type OnboardingStepMeta } from "@/lib/ui/onboarding-feed-data";

export function getOnboardingSteps(options?: { skipWorkspace?: boolean }): OnboardingStepMeta[] {
  if (!options?.skipWorkspace) {
    return onboardingSteps;
  }
  return onboardingSteps.filter((step) => step.id !== "workspace");
}
