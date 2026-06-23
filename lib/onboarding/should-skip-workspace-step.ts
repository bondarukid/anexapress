import { getPendingJoinCodeFromCookies } from "@/lib/invites/pending-invite-cookie";
import { hasPendingEmailInvites } from "@/services/invite";

/** Skip workspace creation when joining via invite link or pending email invite. */
export async function shouldSkipWorkspaceStep(email: string): Promise<boolean> {
  const pendingCode = await getPendingJoinCodeFromCookies();
  if (pendingCode) return true;
  return hasPendingEmailInvites(email);
}
