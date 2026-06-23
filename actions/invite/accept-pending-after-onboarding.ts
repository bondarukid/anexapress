"use server";

import { getPendingJoinCodeFromCookies } from "@/lib/invites/pending-invite-cookie";
import { getFirstPendingEmailInvite } from "@/services/invite";
import { joinWorkspaceByCodeAction } from "@/actions/invite/join-workspace-by-code";
import type { InviteActionResult, JoinWorkspaceByCodeResult } from "@/types/invite";
import { createClient } from "@/lib/server";

/**
 * After onboarding completes on the invite path: join via cookie code or first pending email invite.
 */
export async function acceptPendingAfterOnboardingAction(): Promise<
  InviteActionResult<JoinWorkspaceByCodeResult>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const cookieCode = await getPendingJoinCodeFromCookies();
  if (cookieCode) {
    return joinWorkspaceByCodeAction(cookieCode);
  }

  const pending = await getFirstPendingEmailInvite(user.email);
  if (!pending) {
    return {
      success: false,
      error: "No pending invitation found. Ask your team for a new invite.",
    };
  }

  return joinWorkspaceByCodeAction(pending.joinCode);
}
