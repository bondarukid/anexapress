"use server";

import { z } from "zod";

import { updateMemberVisibility } from "@/services/team";

const UpdateMemberVisibilitySchema = z.object({
  membershipId: z.string().uuid("Invalid membership id"),
  isPubliclyVisible: z.boolean(),
});

export async function updateMemberVisibilityAction(input: unknown) {
  const parsed = UpdateMemberVisibilitySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  return updateMemberVisibility(
    parsed.data.membershipId,
    parsed.data.isPubliclyVisible,
  );
}
