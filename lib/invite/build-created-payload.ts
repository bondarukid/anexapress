import { getSiteOrigin } from "@/lib/auth/site-origin";
import { workspaceInviteUrl } from "@/lib/invites/invite-url";
import type { InviteCreatedPayload } from "@/types/invite";

export function buildInviteCreatedPayload(
  workspaceSlug: string,
  joinCode: string,
  expiresAt: string,
  ids?: { inviteId?: string; joinLinkId?: string },
): InviteCreatedPayload | { error: string } {
  const origin = getSiteOrigin();
  if (!origin) {
    return { error: "Missing NEXT_PUBLIC_SITE_URL." };
  }

  return {
    joinCode,
    inviteUrl: workspaceInviteUrl(origin, workspaceSlug, joinCode),
    expiresAt,
    inviteId: ids?.inviteId,
    joinLinkId: ids?.joinLinkId,
  };
}
