"use server";

import { getMemberAccessContextSchema } from "@/schemas/member-access.schema";
import { getMemberAccessContext } from "@/services/team";
import type { MemberAccessContext, TeamActionResult } from "@/types/team";

export async function getMemberAccessContextAction(input: {
  membershipId: string;
}): Promise<TeamActionResult<MemberAccessContext>> {
  const parsed = getMemberAccessContextSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  return getMemberAccessContext(parsed.data.membershipId);
}
