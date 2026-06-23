"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { clearPendingJoinCodeCookieOptions } from "@/lib/invites/pending-invite-cookie";
import { createClient } from "@/lib/server";
import { JoinWorkspaceByCodeSchema } from "@/schemas/invite-schema";
import { joinWorkspaceByCode } from "@/services/invite";
import type { InviteActionResult, JoinWorkspaceByCodeResult } from "@/types/invite";

export async function joinWorkspaceByCodeAction(
  joinCode: string,
): Promise<InviteActionResult<JoinWorkspaceByCodeResult>> {
  const parsed = JoinWorkspaceByCodeSchema.safeParse({ joinCode });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid join code.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const result = await joinWorkspaceByCode(user.id, parsed.data.joinCode);
  if (!result.success) return result;

  const cookieStore = await cookies();
  cookieStore.set(clearPendingJoinCodeCookieOptions());

  revalidatePath("/", "layout");
  return result;
}
