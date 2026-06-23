/**
 * Onboarding goal slugs from step 2 ("What are your goals?").
 * Keep in sync with `goalOptions` in lib/ui/onboarding-feed-data.ts.
 */
export const ONBOARDING_GOAL_IDS = [
  "team-collaboration",
  "track-performance",
  "automate-workflows",
] as const;

export type OnboardingGoalId = (typeof ONBOARDING_GOAL_IDS)[number];

export function isOnboardingGoalId(value: string): value is OnboardingGoalId {
  return (ONBOARDING_GOAL_IDS as readonly string[]).includes(value);
}

/** Deduplicate while preserving selection order. */
export function normalizeOnboardingGoals(goals: string[]): OnboardingGoalId[] {
  const seen = new Set<string>();
  const normalized: OnboardingGoalId[] = [];

  for (const goal of goals) {
    if (!isOnboardingGoalId(goal) || seen.has(goal)) continue;
    seen.add(goal);
    normalized.push(goal);
  }

  return normalized;
}
