import { getPendingJoinCodeFromCookies } from "@/lib/invites/pending-invite-cookie";
import { hasPendingEmailInvites } from "@/services/invite";

/** Skip auto-create of a personal workspace when the user is on an invite path. */
export async function shouldSkipPersonalWorkspaceCreation(email: string): Promise<boolean> {
  const pendingCode = await getPendingJoinCodeFromCookies();
  if (pendingCode) return true;
  return hasPendingEmailInvites(email);
}
