import { z } from "zod";

import { ONBOARDING_GOAL_IDS } from "@/lib/onboarding/goals";

/** Validates workspace onboarding goal slugs from step 2. */
export const OnboardingGoalIdSchema = z.enum(ONBOARDING_GOAL_IDS);

/**
 * Schema for persisting goals selected during onboarding onto a workspace.
 *
 * Used in:
 * - `saveWorkspaceOnboardingGoalsAction`
 */
export const SaveWorkspaceOnboardingGoalsSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace id."),
  goals: z.array(OnboardingGoalIdSchema).min(1, "Select at least one goal."),
});

export type SaveWorkspaceOnboardingGoalsInput = z.infer<
  typeof SaveWorkspaceOnboardingGoalsSchema
>;
